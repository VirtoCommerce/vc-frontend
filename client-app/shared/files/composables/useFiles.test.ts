import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { createI18n } from "@/i18n";
import { toNewFile } from "@/ui-kit/utilities";
import enMessages from "../../../../locales/en.json";
import { useFiles } from "./useFiles";

type UseFilesType = ReturnType<typeof useFiles>;

// Stands in for `POST /api/files/{scope}`: each test sets how the server answers the files of a request.
const server = vi.hoisted(() => ({
  respond: vi.fn<(fileNames: string[]) => unknown[]>(),
}));

vi.mock("@/core/api/common/composables/useAxios", async () => {
  const { shallowRef } = await import("vue");

  return {
    useAxios: () => {
      const data = shallowRef<unknown[]>();

      return {
        data,
        execute: (_url: string, config: { data: FormData }) => {
          data.value = server.respond(config.data.getAll("file").map((file) => (file as File).name));
          return Promise.resolve();
        },
      };
    },
  };
});

vi.mock("@/core/api/graphql/files", () => ({ getFileUploadOptions: vi.fn(), deleteFile: vi.fn() }));

const SCOPE = "product-configuration";

// Every uploadFiles() call awaits one Promise.all; a healthy upload of these files needs a single round.
const MAX_UPLOAD_ROUNDS = 20;

// Results as FileUploadController returns them. Neither error names a file.
const saved = (name: string) => ({ succeeded: true, id: `id-${name}`, name, url: `/api/files/id-${name}` });
const invalidScope = (scope: string) => ({
  succeeded: false,
  errorCode: "INVALID_SCOPE",
  errorMessage: `Unknown scope '${scope}'`,
  errorParameter: scope,
});
const readFailure = { succeeded: false, errorCode: "EXCEPTION", errorMessage: "Unexpected end of Stream" };

enableAutoUnmount(afterEach);

beforeEach(() => {
  server.respond.mockReset();
});

// Mounted rather than called bare: useFiles registers onUnmounted and takes i18n from the app.
function mountUseFiles(): UseFilesType {
  const i18n = createI18n("en", "USD");
  i18n.global.setLocaleMessage("en", enMessages);

  let composable!: UseFilesType;
  mount(
    defineComponent({
      setup() {
        composable = useFiles(SCOPE);
        return () => null;
      },
    }),
    { global: { plugins: [i18n] } },
  );

  return composable;
}

// The same steps every caller takes before uploading.
function attach(composable: UseFilesType, fileNames: string[]): void {
  composable.addFiles(fileNames.map((name) => toNewFile(new File(["content"], name, { type: "text/plain" }))));
  composable.validateFiles();
}

/**
 * Runs uploadFiles, capped at MAX_UPLOAD_ROUNDS. While a file is left "uploading", uploadFiles re-awaits an
 * already settled Promise.all forever — a microtask loop that never yields, so vitest's timeout can't fire and the
 * run hangs until it runs out of memory. Past the cap the next round throws, which fails the test instead.
 */
async function upload(composable: UseFilesType): Promise<void> {
  const promiseAll = Promise.all.bind(Promise);
  let rounds = 0;
  const spy = vi.spyOn(Promise, "all").mockImplementation(((values: Iterable<unknown>) => {
    rounds += 1;
    if (rounds > MAX_UPLOAD_ROUNDS) {
      throw new Error(`uploadFiles() is still looping after ${MAX_UPLOAD_ROUNDS} rounds`);
    }
    return promiseAll(values);
  }) as typeof Promise.all);

  try {
    await composable.uploadFiles();
  } finally {
    spy.mockRestore();
  }
}

function outcome(composable: UseFilesType) {
  return composable.files.value.map(({ name, status, errorMessage }) => ({ name, status, errorMessage }));
}

describe("useFiles uploadFiles", () => {
  it("fails the file with the scope error when the scope is not registered", async () => {
    // The scope check answers 200 with a single result that names no file.
    server.respond.mockImplementation(() => [invalidScope(SCOPE)]);
    const composable = mountUseFiles();
    attach(composable, ["spec.pdf"]);

    await expect(upload(composable)).resolves.toBeUndefined();

    // The INVALID_SCOPE translation, not the server's own text (no trailing period). The quoted scope goes
    // unchecked: getErrorMessage hands it to the list placeholder {0} as a named value, which vue-i18n doesn't
    // read — pre-existing, and the same for an error that names its file.
    expect(outcome(composable)).toEqual([
      { name: "spec.pdf", status: "error", errorMessage: expect.stringMatching(/^Unknown scope '.*'\.$/) },
    ]);
  });

  it("fails the file the server broke off at and keeps the files it saved before", async () => {
    // A failure reading the multipart body ends the request: the files saved so far keep their named results,
    // and the failure names no file.
    server.respond.mockImplementation((fileNames) => {
      const brokenAt = fileNames.indexOf("d.txt");
      return brokenAt === -1
        ? fileNames.map((name) => saved(name))
        : [...fileNames.slice(0, brokenAt).map((name) => saved(name)), readFailure];
    });
    const composable = mountUseFiles();
    attach(composable, ["a.txt", "b.txt", "c.txt", "d.txt"]);

    await expect(upload(composable)).resolves.toBeUndefined();

    // Four files go out as two requests of two, so one response has a saved file next to the unnamed failure.
    expect(server.respond).toHaveReturnedWith([saved("c.txt"), readFailure]);
    expect(outcome(composable)).toEqual([
      { name: "a.txt", status: "uploaded", errorMessage: undefined },
      { name: "b.txt", status: "uploaded", errorMessage: undefined },
      { name: "c.txt", status: "uploaded", errorMessage: undefined },
      { name: "d.txt", status: "error", errorMessage: "Failure while uploading file. Please try again." },
    ]);
  });

  it("fails a file the server saved under its browser-encoded name", async () => {
    // The browser's multipart encoding sends the " in the name as %22, and the server saves and returns that name
    // without decoding it, so no result carries the name of the attached file.
    server.respond.mockImplementation(() => [saved("12%22 pipe.pdf")]);
    const composable = mountUseFiles();
    attach(composable, ['12" pipe.pdf']);

    await expect(upload(composable)).resolves.toBeUndefined();

    expect(outcome(composable)).toEqual([
      { name: '12" pipe.pdf', status: "error", errorMessage: "Failure while uploading file. Please try again." },
    ]);
  });

  it("uploads every file the server saves", async () => {
    // Control: every result names its file.
    server.respond.mockImplementation((fileNames) => fileNames.map((name) => saved(name)));
    const composable = mountUseFiles();
    attach(composable, ["a.txt", "b.txt", "c.txt", "d.txt"]);

    await expect(upload(composable)).resolves.toBeUndefined();

    expect(outcome(composable)).toEqual([
      { name: "a.txt", status: "uploaded", errorMessage: undefined },
      { name: "b.txt", status: "uploaded", errorMessage: undefined },
      { name: "c.txt", status: "uploaded", errorMessage: undefined },
      { name: "d.txt", status: "uploaded", errorMessage: undefined },
    ]);
  });
});
