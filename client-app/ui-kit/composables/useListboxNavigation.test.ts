import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { describeScrollBox } from "@/ui-kit/test-mocks";
import { useListboxNavigation } from "./useListboxNavigation";
import type { Ref } from "vue";

const COMPONENT_ID = "test-select";

function setRect(element: HTMLElement, top: number, bottom: number): void {
  element.getBoundingClientRect = () => ({ top, bottom, height: bottom - top }) as DOMRect;
}

/**
 * A listbox that owns only options, wrapped in the region that scrolls it — the shape both
 * consumers have, since a loader and an empty state may not be listbox children.
 */
function buildList(optionCount: number) {
  const region = document.createElement("div");
  const list = document.createElement("ul");

  list.setAttribute("role", "listbox");
  region.style.overflowY = "auto";
  region.append(list);
  document.body.append(region);

  const options = Array.from({ length: optionCount }, (_, index) => {
    const option = document.createElement("li");

    option.id = `${COMPONENT_ID}-option-${index}`;
    option.setAttribute("role", "option");
    setRect(option, index * 40, index * 40 + 40);
    list.append(option);

    return option;
  });

  // The region is 100px tall over 40px rows; the list inside it is as tall as its content.
  describeScrollBox(region, { clientHeight: 100, scrollHeight: optionCount * 40, scrollTop: 0 });
  describeScrollBox(list, { clientHeight: optionCount * 40, scrollHeight: optionCount * 40, scrollTop: 0 });
  setRect(region, 0, 100);
  setRect(list, 0, optionCount * 40);

  return { region, list, options };
}

describe("useListboxNavigation", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it.each(["home", "end", "down", "up"] as const)("has nowhere to go on an empty list: %s", (key) => {
    const { navigate, highlightedIndex, activeDescendantId } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref([]),
    });

    navigate(key);

    expect(highlightedIndex.value).toBe(-1);
    expect(activeDescendantId.value).toBeUndefined();
  });

  it("scrolls the region the list sits in, not the list itself", async () => {
    const { region, list } = buildList(10);
    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    navigate("end");
    await nextTick();
    await nextTick();

    // The last option ends at 400; the region's viewport ends at 100.
    expect(region.scrollTop).toBe(300);
    expect(list.scrollTop).toBe(0);
  });

  it("scrolls the region back up to an option above its viewport", async () => {
    const { region } = buildList(10);
    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    describeScrollBox(region, { clientHeight: 100, scrollHeight: 400, scrollTop: 300 });
    setRect(region, 300, 400);

    navigate("home");
    await nextTick();
    await nextTick();

    expect(region.scrollTop).toBe(0);
  });

  it("scrolls the listbox itself when it is the box that overflows", async () => {
    const { region, list } = buildList(10);

    describeScrollBox(region, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
    setRect(region, 0, 400);
    list.style.overflowY = "auto";
    describeScrollBox(list, { clientHeight: 100, scrollHeight: 400, scrollTop: 0 });
    setRect(list, 0, 100);

    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    navigate("end");
    await nextTick();
    await nextTick();

    expect(list.scrollTop).toBe(300);
    expect(region.scrollTop).toBe(0);
  });

  it.each(["hidden", "clip"])("never scrolls an overflow-y: %s clipper the list sits in", async (overflowY) => {
    const { region } = buildList(10);

    region.style.overflowY = overflowY;

    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    navigate("end");
    await nextTick();
    await nextTick();

    expect(region.scrollTop).toBe(0);
  });

  it("scrolls the region above a clipper the list sits in", async () => {
    const { region } = buildList(10);
    const clipper = document.createElement("div");

    clipper.style.overflowY = "hidden";
    region.before(clipper);
    clipper.append(region);
    region.style.overflowY = "visible";
    describeScrollBox(clipper, { clientHeight: 100, scrollHeight: 400, scrollTop: 0 });
    setRect(clipper, 0, 100);

    const scroller = document.createElement("div");

    scroller.style.overflowY = "scroll";
    clipper.before(scroller);
    scroller.append(clipper);
    describeScrollBox(scroller, { clientHeight: 100, scrollHeight: 400, scrollTop: 0 });
    setRect(scroller, 0, 100);

    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    navigate("end");
    await nextTick();
    await nextTick();

    expect(scroller.scrollTop).toBe(300);
    expect(clipper.scrollTop).toBe(0);
    expect(region.scrollTop).toBe(0);
  });

  it("leaves the list where it is for a pointer highlight on a clipped row", async () => {
    const { region } = buildList(10);
    const { highlightPassively } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(Array.from({ length: 10 })),
    });

    highlightPassively(2);
    await nextTick();
    await nextTick();

    expect(region.scrollTop).toBe(0);
  });

  it("scrolls a pointer-highlighted row in once a key lands on it", async () => {
    const { region } = buildList(3);
    const { highlightPassively, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(Array.from({ length: 3 })),
    });

    highlightPassively(2);
    await nextTick();
    navigate("end");
    await nextTick();
    await nextTick();

    // The last row spans 80-120 under a 100px viewport.
    expect(region.scrollTop).toBe(20);
  });

  it.each([
    ["0", [0, 1, 2], [0, 1, 2, 3]],
    ["an empty string", ["", "b"], ["", "b", "c"]],
    ["false", [false, true], [false, true, null]],
  ])("keeps the highlight on %s when a page is appended", async (_, first, paged) => {
    const items = ref<unknown[]>(first);
    const { highlight, highlightedIndex } = useListboxNavigation({ componentId: COMPONENT_ID, items });

    highlight(0);
    items.value = paged;
    await nextTick();

    expect(highlightedIndex.value).toBe(0);
  });
});

describe("useListboxNavigation passive highlight", () => {
  it("marks a passive highlight until the keyboard moves it", () => {
    const { highlightedIndex, isPassiveHighlight, highlightPassively, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });

    highlightPassively(1);

    expect(highlightedIndex.value).toBe(1);
    expect(isPassiveHighlight.value).toBe(true);

    navigate("down");

    expect(highlightedIndex.value).toBe(2);
    expect(isPassiveHighlight.value).toBe(false);
  });

  it("clears the mark when the keyboard lands on the same option", () => {
    const { isPassiveHighlight, highlightPassively, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });

    highlightPassively(0);
    navigate("home");

    expect(isPassiveHighlight.value).toBe(false);
  });

  it("clears the mark when the index is set as a keyboard position", () => {
    const { isPassiveHighlight, highlightPassively, highlight } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });

    highlightPassively(0);
    highlight(0);

    expect(isPassiveHighlight.value).toBe(false);
  });

  it("keeps a keyboard highlight when the pointer moves on the same row", () => {
    const { highlightedIndex, isPassiveHighlight, highlightPassively, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });

    navigate("down");
    highlightPassively(0);

    expect(highlightedIndex.value).toBe(0);
    expect(isPassiveHighlight.value).toBe(false);
  });

  it("hands its state out read-only, so it moves only through its functions", () => {
    const { highlightedIndex, isPassiveHighlight } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    (highlightedIndex as Ref<number>).value = 2;
    (isPassiveHighlight as Ref<boolean>).value = true;

    expect(highlightedIndex.value).toBe(-1);
    expect(isPassiveHighlight.value).toBe(false);
    warn.mockRestore();
  });

  it("drops only a passive highlight when the pointer leaves the list", () => {
    const list = document.createElement("ul");
    document.body.append(list);

    const { highlightedIndex, highlightPassively, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
      list: ref(list),
    });

    highlightPassively(1);
    list.dispatchEvent(new MouseEvent("mouseleave"));

    expect(highlightedIndex.value).toBe(-1);

    navigate("down");
    list.dispatchEvent(new MouseEvent("mouseleave"));

    expect(highlightedIndex.value).toBe(0);

    list.remove();
  });
});

describe("useListboxNavigation over a changing list", () => {
  function setup(initial: string[]) {
    const items = ref([...initial]);
    const navigation = useListboxNavigation({ componentId: COMPONENT_ID, items });

    navigation.navigate("end");

    return { items, ...navigation };
  }

  it("keeps the highlight when the options are rebuilt as new objects with the same keys", async () => {
    const items = ref([{ id: "a" }, { id: "b" }]);
    const { highlightedIndex, highlight } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items,
      getKey: (item) => item.id,
    });

    highlight(1);
    items.value = [{ id: "a" }, { id: "b" }];
    await nextTick();

    expect(highlightedIndex.value).toBe(1);
  });

  it("keeps the highlight when a page is appended to a new array", async () => {
    const { items, highlightedIndex } = setup(["a", "b", "c"]);

    items.value = [...items.value, "d"];
    await nextTick();

    expect(highlightedIndex.value).toBe(2);
  });

  it("keeps the highlight when a page is pushed into the same array", async () => {
    const { items, highlightedIndex } = setup(["a", "b", "c"]);

    items.value.push("d");
    await nextTick();

    expect(highlightedIndex.value).toBe(2);
  });

  it("drops the highlight when a new array puts another option under it", async () => {
    const { items, highlightedIndex } = setup(["a", "b", "c"]);

    items.value = ["a", "b", "z"];
    await nextTick();

    expect(highlightedIndex.value).toBe(-1);
  });

  it("drops the highlight when the same array is spliced to put another option under it", async () => {
    const { items, highlightedIndex } = setup(["a", "b", "c"]);

    items.value.splice(2, 1, "z");
    await nextTick();

    expect(highlightedIndex.value).toBe(-1);
  });

  it("drops the highlight on an option without a key when the list is cut short beneath it", async () => {
    const items = ref([{ value: "a" }, { value: undefined }]);
    const { highlightedIndex, highlight } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items,
      getKey: (item) => item.value,
    });

    highlight(1);
    items.value = [{ value: "a" }];
    await nextTick();

    expect(highlightedIndex.value).toBe(-1);
  });

  it("drops the highlight when the same array is cut short beneath it", async () => {
    const { items, highlightedIndex, activeDescendantId } = setup(["a", "b", "c"]);

    items.value.splice(1);
    await nextTick();

    expect(highlightedIndex.value).toBe(-1);
    expect(activeDescendantId.value).toBeUndefined();
  });
});

describe("useListboxNavigation at the ends of the list", () => {
  it.each([
    ["down", "end", 2],
    ["up", "home", 0],
  ] as const)("stays put on %s past the %s without wrap", (key, end, index) => {
    const { highlightedIndex, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
      wrap: false,
    });

    navigate(end);
    navigate(key);

    expect(highlightedIndex.value).toBe(index);
  });

  it.each([
    ["down", "end", 0],
    ["up", "home", 2],
  ] as const)("wraps on %s past the %s by default", (key, end, index) => {
    const { highlightedIndex, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: ref(["a", "b", "c"]),
    });

    navigate(end);
    navigate(key);

    expect(highlightedIndex.value).toBe(index);
  });

  it("follows wrap given as a getter", () => {
    const wrap = ref(true);
    const items = ["a", "b", "c"];
    const { highlightedIndex, navigate } = useListboxNavigation({
      componentId: COMPONENT_ID,
      items: () => items,
      wrap: () => wrap.value,
    });

    navigate("end");
    wrap.value = false;
    navigate("down");

    expect(highlightedIndex.value).toBe(2);
  });
});
