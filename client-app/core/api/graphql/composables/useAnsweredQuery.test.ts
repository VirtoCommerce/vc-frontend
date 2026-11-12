import { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } from "@apollo/client/core";
import { DefaultApolloClient, useQuery } from "@vue/apollo-composable";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import { useAnsweredQuery } from "./useAnsweredQuery";

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

// The echo may claim the typed query only once the items on screen answer it, a skipped or failed query aside.
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
    // apollo-composable reads the deprecated `getLastResult` on an error.
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
