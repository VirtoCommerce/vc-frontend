import { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } from "@apollo/client/core";
import { DefaultApolloClient, provideApolloClient, useQuery } from "@vue/apollo-composable";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { computed, defineComponent, effectScope, h, ref } from "vue";
import {
  ANSWERS,
  SEARCH_DEBOUNCE_MS,
  SELECTED,
  WITH_MESSAGES,
  announced,
  isSelectAllDisabled,
  mountWithReactiveProps,
  selectAllProps,
} from "@/ui-kit/test-mocks/vc-select-harness.mock";
import { useAnsweredQuery } from "./useAnsweredQuery";
import type { VueWrapper } from "@vue/test-utils";

const SEARCH_DOCUMENT = gql`
  query Search($keyword: String!) {
    search(keyword: $keyword) {
      items
    }
  }
`;

type ConsumerOptionsType = {
  fetchPolicy?: "network-only" | "cache-first";
  keepPreviousResult?: boolean;
  debounce?: number;
  minLength?: number;
};

type FrameType = { typed: string; shown?: string; answered?: string; skipped: boolean; failed: boolean };

enableAutoUnmount(afterEach);

function mountConsumer({
  fetchPolicy = "network-only",
  keepPreviousResult = true,
  debounce,
  minLength,
}: ConsumerOptionsType = {}) {
  const requests: { keyword: string; cancelled: boolean; respond: () => void; fail: () => void }[] = [];
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const request = {
            keyword: operation.variables.keyword as string,
            cancelled: false,
            respond: () => {
              observer.next({ data: { search: { __typename: "SearchResult", items: [`${request.keyword}#1`] } } });
              observer.complete();
            },
            fail: () => observer.error(new Error(request.keyword)),
          };

          requests.push(request);

          return () => {
            request.cancelled = true;
          };
        }),
    ),
  });
  const keyword = ref("");
  const frames: FrameType[] = [];
  let answeredQuery = computed<string | undefined>(() => undefined);

  const consumer = defineComponent({
    setup() {
      const enabled = computed(() => !minLength || !keyword.value || keyword.value.length >= minLength);
      const queryReturn = useQuery<{ search: { items: string[] } }, { keyword: string }>(
        SEARCH_DOCUMENT,
        () => ({ keyword: keyword.value }),
        () => ({ fetchPolicy, keepPreviousResult, debounce, enabled: enabled.value }),
      );
      const { result, error, loading } = queryReturn;

      answeredQuery = useAnsweredQuery(queryReturn, (variables) => variables?.keyword);

      return () => {
        frames.push({
          typed: keyword.value,
          shown: result.value?.search.items[0]?.split("#")[0],
          answered: answeredQuery.value,
          skipped: !enabled.value,
          failed: !!error.value && !loading.value,
        });

        return h("div");
      };
    },
  });

  mount(consumer, { global: { provide: { [DefaultApolloClient]: client } } });

  async function type(value: string) {
    keyword.value = value;
    await vi.advanceTimersByTimeAsync(0);
  }

  async function respond(expected: string, outcome: "respond" | "fail" = "respond") {
    const request = requests.find((candidate) => candidate.keyword === expected && !candidate.cancelled);

    expect(request).toBeDefined();
    requests.splice(requests.indexOf(request!), 1);
    request![outcome]();
    await vi.advanceTimersByTimeAsync(0);
  }

  return { type, respond, requests, frames, answered: () => answeredQuery.value };
}

// A skipped or failed query counts as answered, so the echo may claim it early.
function claimsUnanswered(frames: FrameType[]): FrameType[] {
  return frames.filter(
    (frame) => frame.answered === frame.typed && frame.shown !== frame.typed && !frame.skipped && !frame.failed,
  );
}

describe("useAnsweredQuery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });
  });

  it.each([
    ["keeping the previous result", true],
    ["dropping the previous result", false],
  ])("holds the previous query while a network-only query loads, %s", async (_label, keepPreviousResult) => {
    const { type, respond, frames, answered } = mountConsumer({ keepPreviousResult });

    expect(answered()).toBeUndefined();

    await respond("");

    expect(answered()).toBe("");

    await type("a");

    expect(answered()).toBe("");

    await respond("a");

    expect(answered()).toBe("a");

    await type("");

    expect(answered()).toBe("a");

    await respond("");

    expect(answered()).toBe("");
    expect(claimsUnanswered(frames)).toEqual([]);
  });

  it("moves to a cached query at once", async () => {
    const { type, respond, requests, frames, answered } = mountConsumer({ fetchPolicy: "cache-first" });

    await respond("");
    await type("a");
    await respond("a");
    await type("");

    expect(answered()).toBe("");

    await type("a");

    expect(answered()).toBe("a");
    expect(requests).toEqual([]);
    expect(claimsUnanswered(frames)).toEqual([]);
  });

  it("holds the previous query while useQuery debounces the new one", async () => {
    const { type, respond, requests, frames, answered } = mountConsumer({ debounce: 100 });

    await respond("");
    await type("a");
    await vi.advanceTimersByTimeAsync(50);

    expect(requests).toEqual([]);
    expect(answered()).toBe("");

    await vi.advanceTimersByTimeAsync(50);
    await respond("a");

    expect(answered()).toBe("a");
    expect(claimsUnanswered(frames)).toEqual([]);
  });

  it("answers a skipped query at once, and waits again once querying resumes", async () => {
    const { type, respond, requests, frames, answered } = mountConsumer({ minLength: 2 });

    await respond("");
    await type("ab");
    await respond("ab");
    await type("a");

    expect(answered()).toBe("a");
    expect(requests).toEqual([]);

    await type("abc");

    expect(answered()).toBe("a");

    await respond("abc");

    expect(answered()).toBe("abc");
    expect(claimsUnanswered(frames)).toEqual([]);
  });

  it("moves to a failed query, whose items the consumer has to clear", async () => {
    // apollo-composable calls ObservableQuery methods deprecated in Apollo 3.14 on an error.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    onTestFinished(() => warn.mockRestore());

    const { type, respond, frames, answered } = mountConsumer();

    await respond("");
    await type("a");
    await respond("a", "fail");

    expect(answered()).toBe("a");

    await type("ab");

    expect(answered()).toBe("a");

    await respond("ab");

    expect(answered()).toBe("ab");
    expect(claimsUnanswered(frames)).toEqual([]);
  });

  it("follows only the latest of queries typed in quick succession", async () => {
    const { type, respond, requests, frames, answered } = mountConsumer();

    await respond("");
    await type("a");
    await type("ab");

    // The older request answers late, whether or not Apollo has torn it down yet.
    requests.find(({ keyword }) => keyword === "a")?.respond();
    await vi.advanceTimersByTimeAsync(0);

    expect(answered()).toBe("");

    await respond("ab");

    expect(answered()).toBe("ab");
    expect(claimsUnanswered(frames)).toEqual([]);
  });
});

// The helper bound to VcSelect's `answered-query`, as its JSDoc tells a consumer to: Select all counts,
// enables and announces only the query the items on screen answer.
describe("useAnsweredQuery bound to a server-filter VcSelect", () => {
  const COUNTED_SEARCH_DOCUMENT = gql`
    query Search($keyword: String!) {
      search(keyword: $keyword) {
        items
        total
        selectedCount
      }
    }
  `;

  type ApolloConsumerOptionsType = {
    fetchPolicy: "network-only" | "cache-first";
    debounce?: number;
    skipShort?: boolean;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });
  });

  function mountApolloConsumer({ fetchPolicy, debounce, skipShort }: ApolloConsumerOptionsType) {
    const requests: { keyword: string; respond: () => void }[] = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            const keyword = operation.variables.keyword as string;

            requests.push({
              keyword,
              respond: () => {
                observer.next({ data: { search: { __typename: "SearchResult", ...ANSWERS[keyword] } } });
                observer.complete();
              },
            });
          }),
      ),
    });
    const keyword = ref("");
    const isEnabled = computed(() => !skipShort || keyword.value.length !== 1);
    const scope = effectScope();

    onTestFinished(() => scope.stop());

    const { result, loading, answeredQuery } = scope.run(() => {
      const queryReturn = provideApolloClient(client)(() =>
        useQuery<{ search: (typeof ANSWERS)[string] }, { keyword: string }>(
          COUNTED_SEARCH_DOCUMENT,
          () => ({ keyword: keyword.value }),
          () => ({ fetchPolicy, keepPreviousResult: true, debounce, enabled: isEnabled.value }),
        ),
      );

      return { ...queryReturn, answeredQuery: useAnsweredQuery(queryReturn, (variables) => variables?.keyword) };
    })!;

    const wrapper = mountWithReactiveProps(
      () => ({
        ...selectAllProps,
        ...result.value?.search,
        answeredQuery: answeredQuery.value,
        loading: loading.value,
        autocomplete: true,
        serverFilter: true,
        modelValue: SELECTED,
        onSearch: (value: string) => {
          keyword.value = value;
        },
      }),
      undefined,
      WITH_MESSAGES,
    );

    async function respond(expected: string) {
      const request = requests.shift();

      expect(request?.keyword).toBe(expected);
      request?.respond();
      await vi.advanceTimersByTimeAsync(0);
    }

    return { wrapper, requests, respond };
  }

  async function typeInto(wrapper: VueWrapper, value: string) {
    await wrapper.get("input").setValue(value);
    await vi.advanceTimersByTimeAsync(value ? SEARCH_DEBOUNCE_MS : 0);
  }

  const state = (wrapper: VueWrapper) => ({
    count: wrapper.get(".vc-select-all__count").text(),
    disabled: isSelectAllDisabled(wrapper),
  });

  it("counts the previous result while every query goes to the network", async () => {
    const { wrapper, respond } = mountApolloConsumer({ fetchPolicy: "network-only" });

    await respond("");
    await wrapper.get("input").trigger("click");
    await typeInto(wrapper, "a");

    expect(state(wrapper)).toEqual({ count: "40 of 500", disabled: true });

    await respond("a");

    expect(state(wrapper)).toEqual({ count: "1 of 10", disabled: false });

    await typeInto(wrapper, "");

    expect(state(wrapper)).toEqual({ count: "1 of 10", disabled: true });

    await respond("");

    expect(state(wrapper)).toEqual({ count: "40 of 500", disabled: false });
  });

  it("counts a cached result at once", async () => {
    const { wrapper, requests, respond } = mountApolloConsumer({ fetchPolicy: "cache-first" });

    await respond("");
    await wrapper.get("input").trigger("click");
    await typeInto(wrapper, "a");
    await respond("a");
    await typeInto(wrapper, "");

    expect(state(wrapper)).toEqual({ count: "40 of 500", disabled: false });

    await typeInto(wrapper, "a");

    expect(state(wrapper)).toEqual({ count: "1 of 10", disabled: false });
    expect(requests).toEqual([]);
  });

  it("counts the previous result while `useQuery` debounces the query", async () => {
    const { wrapper, requests, respond } = mountApolloConsumer({ fetchPolicy: "network-only", debounce: 100 });

    await respond("");
    await wrapper.get("input").trigger("click");
    await typeInto(wrapper, "a");
    await vi.advanceTimersByTimeAsync(50);

    expect(requests).toEqual([]);
    expect(state(wrapper)).toEqual({ count: "40 of 500", disabled: true });

    await vi.advanceTimersByTimeAsync(50);
    await respond("a");

    expect(state(wrapper)).toEqual({ count: "1 of 10", disabled: false });
  });

  it("takes the result on screen as the answer to a query it skips", async () => {
    const { wrapper, requests, respond } = mountApolloConsumer({ fetchPolicy: "network-only", skipShort: true });

    await respond("");
    await wrapper.get("input").trigger("click");
    await typeInto(wrapper, "a");

    expect(requests).toEqual([]);
    expect(state(wrapper)).toEqual({ count: "40 of 500", disabled: false });
    expect(announced(wrapper)).toBe("500 results available");
  });
});
