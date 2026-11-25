import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { VcMenuItem, VcMenuList } from "@/ui-kit/components/molecules";
import type { MockInstance } from "vitest";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/:any(.*)*", component: { template: "<div />" } }],
});

async function mountList(template: string, setup: () => Record<string, unknown> = () => ({})) {
  const wrapper = mount(defineComponent({ components: { VcMenuItem, VcMenuList }, setup, template }), {
    attachTo: document.body,
    global: { plugins: [router] },
  });
  // An item joins the list once its element is in the DOM: one more render.
  await nextTick();
  return wrapper;
}

type WrapperType = Awaited<ReturnType<typeof mountList>>;

type CodesStateType = { codes: string[]; current?: string; disabled: string[] };

function state(wrapper: WrapperType): CodesStateType {
  return wrapper.vm as unknown as CodesStateType;
}

function inners(wrapper: WrapperType) {
  return wrapper.findAll<HTMLElement>(".vc-menu-item__inner");
}

function attrsOf(wrapper: WrapperType, name: string) {
  return inners(wrapper).map((inner) => inner.attributes(name));
}

function codesList(extraAttrs = "") {
  return `
    <VcMenuList role="listbox" aria-label="Currency">
      <div class="scroll">
        <VcMenuItem v-for="code in codes" :key="code" :active="code === current" ${extraAttrs} @click="current = code">
          {{ code }}
        </VcMenuItem>
      </div>
    </VcMenuList>
  `;
}

const DISABLED_BY_CODE = ':disabled="disabled.includes(code)"';

function codesSetup(initial?: string, disabled: string[] = []) {
  return () => ({ codes: ref(["USD", "EUR", "GBP"]), current: ref(initial), disabled });
}

function keydown(target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

let warn: MockInstance<typeof console.warn>;

beforeEach(async () => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  await router.push("/");
});

afterEach(() => {
  warn.mockRestore();
});

enableAutoUnmount(afterEach);

describe("VcMenuList", () => {
  describe("roles", () => {
    it("renders a listbox whose items, at any depth, are options", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      expect(wrapper.get(".vc-menu-list").attributes("role")).toBe("listbox");
      expect(attrsOf(wrapper, "role")).toEqual(["option", "option", "option"]);
      expect(wrapper.findAll(".vc-menu-item").map((item) => item.attributes("role"))).toEqual(["none", "none", "none"]);
    });

    it("renders a menu whose items are menu items without aria-selected", async () => {
      const wrapper = await mountList(`
        <VcMenuList role="menu" aria-label="Account">
          <VcMenuItem to="/orders" active>Orders</VcMenuItem>
          <VcMenuItem to="/lists">Lists</VcMenuItem>
        </VcMenuList>
      `);

      expect(wrapper.get(".vc-menu-list").attributes("role")).toBe("menu");
      expect(attrsOf(wrapper, "role")).toEqual(["menuitem", "menuitem"]);
      expect(attrsOf(wrapper, "aria-selected")).toEqual([undefined, undefined]);
    });

    it("keeps a role the item sets itself", async () => {
      const wrapper = await mountList(`
        <VcMenuList role="listbox" aria-label="Currency">
          <VcMenuItem role="menuitem">USD</VcMenuItem>
          <VcMenuItem>EUR</VcMenuItem>
        </VcMenuList>
      `);

      expect(attrsOf(wrapper, "role")).toEqual(["menuitem", "option"]);
    });
  });

  describe("aria-selected", () => {
    it("follows active in a listbox", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      expect(attrsOf(wrapper, "aria-selected")).toEqual(["false", "true", "false"]);

      await inners(wrapper)[2].trigger("click");

      expect(attrsOf(wrapper, "aria-selected")).toEqual(["false", "false", "true"]);
    });

    it("does not follow active outside a listbox", async () => {
      const wrapper = await mountList(`
        <VcMenuList role="menu" aria-label="Sort">
          <VcMenuItem role="option" active>Name</VcMenuItem>
        </VcMenuList>
      `);

      expect(attrsOf(wrapper, "aria-selected")).toEqual(["false"]);
    });

    it("keeps an aria-selected the item sets itself", async () => {
      const wrapper = await mountList(codesList(':aria-selected="false"'), codesSetup("EUR"));

      expect(attrsOf(wrapper, "aria-selected")).toEqual(["false", "false", "false"]);
    });
  });

  describe("tab stop", () => {
    it("is the active item alone", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1"]);
    });

    it("is the first enabled item while none is active", async () => {
      const wrapper = await mountList(codesList(DISABLED_BY_CODE), codesSetup(undefined, ["USD"]));

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1"]);
    });

    it("skips an item that is not clickable", async () => {
      const wrapper = await mountList(`
        <VcMenuList role="listbox" aria-label="Currency">
          <VcMenuItem :clickable="false">Text</VcMenuItem>
          <VcMenuItem>USD</VcMenuItem>
        </VcMenuList>
      `);

      expect(attrsOf(wrapper, "tabindex")).toEqual([undefined, "0"]);
    });

    it("skips an active item that is disabled", async () => {
      const wrapper = await mountList(codesList(DISABLED_BY_CODE), codesSetup("EUR", ["EUR"]));

      expect(attrsOf(wrapper, "tabindex")).toEqual(["0", "-1", "-1"]);
    });

    it("does not exist while every item is disabled", async () => {
      const wrapper = await mountList(codesList("disabled"), codesSetup("EUR"));

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "-1", "-1"]);
    });

    it("stays on the item focused last", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      inners(wrapper)[2].element.focus();
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "-1", "0"]);
    });

    it("keeps the item focused last while focus stays inside the list", async () => {
      const wrapper = await mountList(
        `
          <VcMenuList role="listbox" aria-label="Currency">
            <VcMenuItem v-for="code in codes" :key="code" :active="code === current">{{ code }}</VcMenuItem>
            <button type="button" class="more">More</button>
          </VcMenuList>
        `,
        codesSetup("EUR"),
      );

      inners(wrapper)[2].element.focus();
      await nextTick();
      (wrapper.get(".more").element as HTMLElement).focus();
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "-1", "0"]);
    });

    it("goes back to the active item when focus leaves the list", async () => {
      const wrapper = await mountList(
        `<div><button type="button" class="outside">Outside</button>${codesList()}</div>`,
        codesSetup("EUR"),
      );

      inners(wrapper)[2].element.focus();
      await nextTick();
      (wrapper.get(".outside").element as HTMLElement).focus();
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1"]);
    });

    it("goes back to the active item when focus leaves for nowhere", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      inners(wrapper)[2].element.focus();
      await nextTick();
      inners(wrapper)[2].element.blur();
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1"]);
    });

    it("moves to a new active item", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      inners(wrapper)[2].element.focus();
      await nextTick();
      state(wrapper).current = "USD";
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["0", "-1", "-1"]);
    });

    it("falls back to the active item when the focused one is disabled", async () => {
      const wrapper = await mountList(codesList(DISABLED_BY_CODE), () => ({
        ...codesSetup("EUR")(),
        disabled: ref<string[]>([]),
      }));

      inners(wrapper)[2].element.focus();
      await nextTick();
      state(wrapper).disabled = ["GBP"];
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1"]);
    });

    it("falls back to the first enabled item when the focused one is removed", async () => {
      const wrapper = await mountList(codesList(), codesSetup());

      inners(wrapper)[2].element.focus();
      await nextTick();
      state(wrapper).codes = ["USD", "EUR"];
      await nextTick();

      expect(attrsOf(wrapper, "tabindex")).toEqual(["0", "-1"]);
    });
  });

  describe("keys", () => {
    it("moves focus down and up, wrapping at the ends", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));
      const [usd, eur, gbp] = inners(wrapper).map((inner) => inner.element);

      keydown(eur, "ArrowDown");
      expect(document.activeElement).toBe(gbp);

      keydown(gbp, "ArrowDown");
      expect(document.activeElement).toBe(usd);

      keydown(usd, "ArrowUp");
      expect(document.activeElement).toBe(gbp);

      keydown(gbp, "ArrowUp");
      expect(document.activeElement).toBe(eur);
    });

    it("goes to the ends with Home and End", async () => {
      const wrapper = await mountList(codesList(), () => ({
        ...codesSetup("EUR")(),
        codes: ref(["USD", "EUR", "GBP", "JPY"]),
      }));
      const [usd, eur, gbp, jpy] = inners(wrapper).map((inner) => inner.element);

      keydown(eur, "End");
      expect(document.activeElement).toBe(jpy);

      keydown(gbp, "Home");
      expect(document.activeElement).toBe(usd);
    });

    it("takes the key from the page only when it moves focus", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));
      const eur = inners(wrapper)[1].element;

      expect(keydown(eur, "ArrowDown").defaultPrevented).toBe(true);
      expect(keydown(eur, "Enter").defaultPrevented).toBe(false);
    });

    it("follows the order on screen when an item is added before the others", async () => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));

      state(wrapper).codes = ["CHF", "USD", "EUR", "GBP"];
      await nextTick();
      const [chf, , eur] = inners(wrapper).map((inner) => inner.element);

      keydown(eur, "Home");
      expect(document.activeElement).toBe(chf);
    });

    it("steps over disabled items", async () => {
      const wrapper = await mountList(codesList(DISABLED_BY_CODE), codesSetup("USD", ["EUR"]));
      const [usd, , gbp] = inners(wrapper).map((inner) => inner.element);

      keydown(usd, "ArrowDown");
      expect(document.activeElement).toBe(gbp);
    });

    it.each(["shiftKey", "ctrlKey", "altKey", "metaKey"])("leaves a key with %s to the browser", async (modifier) => {
      const wrapper = await mountList(codesList(), codesSetup("EUR"));
      const eur = inners(wrapper)[1].element;
      eur.focus();

      const event = keydown(eur, "ArrowDown", { [modifier]: true });

      expect(document.activeElement).toBe(eur);
      expect(event.defaultPrevented).toBe(false);
    });

    it("moves between links", async () => {
      const wrapper = await mountList(`
        <VcMenuList role="menu" aria-label="Account">
          <VcMenuItem to="/orders">Orders</VcMenuItem>
          <VcMenuItem to="/lists" active>Lists</VcMenuItem>
        </VcMenuList>
      `);
      const [orders, lists] = inners(wrapper).map((inner) => inner.element);

      expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0"]);

      keydown(lists, "ArrowDown");
      expect(document.activeElement).toBe(orders);
    });
  });

  describe("focus()", () => {
    async function mountWithButton(initial?: string) {
      return mountList(
        `
          <div>
            <button type="button" class="entry" @keydown.down.prevent="list?.focus()">Search</button>
            ${codesList().replace("<VcMenuList", '<VcMenuList ref="list"')}
          </div>
        `,
        () => ({ ...codesSetup(initial)(), list: ref() }),
      );
    }

    it("focuses the active item", async () => {
      const wrapper = await mountWithButton("GBP");

      keydown(wrapper.get(".entry").element as HTMLElement, "ArrowDown");

      expect(document.activeElement).toBe(inners(wrapper)[2].element);
    });

    it("enters at the active item again after focus has left the list", async () => {
      const wrapper = await mountWithButton("GBP");

      inners(wrapper)[0].element.focus();
      await nextTick();
      (wrapper.get(".entry").element as HTMLElement).focus();
      await nextTick();
      keydown(wrapper.get(".entry").element as HTMLElement, "ArrowDown");

      expect(document.activeElement).toBe(inners(wrapper)[2].element);
    });

    it("focuses the first item while none is active", async () => {
      const wrapper = await mountWithButton();

      keydown(wrapper.get(".entry").element as HTMLElement, "ArrowDown");

      expect(document.activeElement).toBe(inners(wrapper)[0].element);
    });
  });

  it("keeps two lists apart", async () => {
    const wrapper = await mountList(`
      <div>
        <VcMenuList role="listbox" aria-label="A">
          <VcMenuItem v-for="n in 3" :key="n" :active="n === 2">{{ n }}</VcMenuItem>
        </VcMenuList>
        <VcMenuList role="listbox" aria-label="B">
          <VcMenuItem v-for="n in 3" :key="n">{{ n }}</VcMenuItem>
        </VcMenuList>
      </div>
    `);
    const elements = inners(wrapper).map((inner) => inner.element);

    expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1", "0", "-1", "-1"]);

    keydown(elements[2], "ArrowDown");
    expect(document.activeElement).toBe(elements[0]);

    elements[5].focus();
    await nextTick();

    expect(attrsOf(wrapper, "tabindex")).toEqual(["-1", "0", "-1", "-1", "-1", "0"]);
  });

  describe("an item teleported out of the list", () => {
    async function mountWithTeleported() {
      return mountList(`
        <VcMenuList role="listbox" aria-label="Currency">
          <VcMenuItem v-for="code in ['USD', 'EUR']" :key="code" :active="code === 'EUR'">{{ code }}</VcMenuItem>
          <Teleport to="body">
            <VcMenuItem class="teleported">Popover action</VcMenuItem>
          </Teleport>
        </VcMenuList>
      `);
    }

    function teleported() {
      return document.querySelector<HTMLElement>(".teleported .vc-menu-item__inner")!;
    }

    it("keeps the markup it has outside a list", async () => {
      await mountWithTeleported();

      expect(teleported().getAttribute("role")).toBeNull();
      expect(teleported().getAttribute("aria-selected")).toBeNull();
      expect(teleported().getAttribute("tabindex")).toBe("0");
      expect(teleported().parentElement!.getAttribute("role")).toBeNull();
    });

    it("is not reached by the arrows", async () => {
      const wrapper = await mountWithTeleported();
      const [usd, eur] = inners(wrapper).map((inner) => inner.element);

      keydown(eur, "ArrowDown");

      expect(document.activeElement).toBe(usd);
    });

    it("does not take the tab stop when it is focused", async () => {
      const wrapper = await mountWithTeleported();

      inners(wrapper)[0].element.focus();
      await nextTick();
      teleported().focus();
      await nextTick();

      // Focus has left the list: it is entered again at its active item.
      expect(attrsOf(wrapper, "tabindex").slice(0, 2)).toEqual(["-1", "0"]);
    });
  });

  // The component id varies with the mount order.
  describe("an item outside a list renders as before", () => {
    const BASELINE = {
      plain: [
        `<VcMenuItem>Plain</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item"><button type="button" tabindex="0" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary"><!--v-if--><span class="vc-menu-item__content">Plain</span><!--v-if--></button></div>`,
      ],
      option: [
        `<VcMenuItem role="option">Option</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item" role="none"><button type="button" tabindex="0" role="option" aria-selected="false" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary"><!--v-if--><span class="vc-menu-item__content">Option</span><!--v-if--></button></div>`,
      ],
      selected: [
        `<VcMenuItem role="option" active aria-selected>Selected</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item" role="none"><button type="button" tabindex="0" role="option" aria-selected="true" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary vc-menu-item__inner--active"><!--v-if--><span class="vc-menu-item__content">Selected</span><!--v-if--></button></div>`,
      ],
      link: [
        `<VcMenuItem external-link="https://example.com" target="_blank">Link</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item"><a href="https://example.com" target="_blank" tabindex="0" disabled="false" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary"><!--v-if--><span class="vc-menu-item__content">Link</span><!--v-if--></a></div>`,
      ],
      routerLink: [
        `<VcMenuItem to="/account">Account</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item"><a href="/account" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary" tabindex="0" disabled="false"><!--v-if--><span class="vc-menu-item__content">Account</span><!--v-if--></a></div>`,
      ],
      disabled: [
        `<VcMenuItem disabled>Disabled</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item"><button type="button" tabindex="0" disabled="" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary vc-menu-item__inner--disabled"><!--v-if--><span class="vc-menu-item__content">Disabled</span><!--v-if--></button></div>`,
      ],
      notClickable: [
        `<VcMenuItem :clickable="false">Text</VcMenuItem>`,
        `<div id="menu-item-ID" class="vc-menu-item"><span disabled="false" class="vc-menu-item__inner vc-menu-item__inner--size--md vc-menu-item__inner--color--primary"><!--v-if--><span class="vc-menu-item__content">Text</span><!--v-if--></span></div>`,
      ],
    };

    it.each(Object.entries(BASELINE))("%s", async (_name, [template, html]) => {
      const wrapper = await mountList(template);

      expect(wrapper.html({ raw: true }).replace(/menu-item-\d+/, "menu-item-ID")).toBe(html);
    });
  });

  describe("dev warnings", () => {
    it("asks for a name", async () => {
      await mountList(`<VcMenuList role="listbox"><VcMenuItem>USD</VcMenuItem></VcMenuList>`);

      expect(warn).toHaveBeenCalledWith("[VcMenuList] Name the list with `aria-label` or `aria-labelledby`.");
    });

    it("accepts a name from aria-labelledby", async () => {
      await mountList(`<VcMenuList role="listbox" aria-labelledby="heading"><VcMenuItem>USD</VcMenuItem></VcMenuList>`);

      expect(warn).not.toHaveBeenCalled();
    });

    it("flags an item role that does not belong to the list", async () => {
      await mountList(`
        <VcMenuList role="listbox" aria-label="Currency">
          <VcMenuItem role="menuitem">USD</VcMenuItem>
          <VcMenuItem role="option">EUR</VcMenuItem>
        </VcMenuList>
      `);

      expect(warn.mock.calls).toEqual([
        ['[VcMenuItem] role="menuitem" does not belong in a VcMenuList role="listbox".'],
      ]);
    });

    // VcMenuItem passes attributes to its wrapper, so a checkable row's aria-checked cannot reach the role.
    it.each(["menuitemradio", "menuitemcheckbox"])("flags a checkable %s in a menu", async (role) => {
      await mountList(`
        <VcMenuList role="menu" aria-label="Sort">
          <VcMenuItem role="${role}">Name</VcMenuItem>
        </VcMenuList>
      `);

      expect(warn).toHaveBeenCalledWith(`[VcMenuItem] role="${role}" does not belong in a VcMenuList role="menu".`);
    });
  });
});
