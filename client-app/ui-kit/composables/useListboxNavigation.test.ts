import { afterEach, describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";
import { describeScrollBox } from "@/core/utilities/tests";
import { useListboxNavigation } from "./useListboxNavigation";

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

  // `home` ставил нулевой индекс без оглядки на длину: в пустом списке
  // `aria-activedescendant` указывал на опцию, которой нет.
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

    // Последняя опция кончается на 400, окно региона — на 100.
    expect(region.scrollTop).toBe(300);
    expect(list.scrollTop).toBe(0);
  });

  it("scrolls the listbox itself when it is the box that overflows", async () => {
    const { region, list } = buildList(10);

    describeScrollBox(region, { clientHeight: 400, scrollHeight: 400, scrollTop: 0 });
    setRect(region, 0, 400);
    describeScrollBox(list, { clientHeight: 100, scrollHeight: 400, scrollTop: 0 });
    setRect(list, 0, 100);

    const { navigate } = useListboxNavigation({ componentId: COMPONENT_ID, items: ref(Array.from({ length: 10 })) });

    navigate("end");
    await nextTick();
    await nextTick();

    expect(list.scrollTop).toBe(300);
    expect(region.scrollTop).toBe(0);
  });
});
