import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { openAuthorizedFile } from "./files";
import type { Mock } from "vitest";

const useFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/core/api/common", () => ({ useFetch: useFetchMock }));

const loggerErrorMock = vi.hoisted(() => vi.fn());
vi.mock("@/core/utilities", () => ({ Logger: { error: loggerErrorMock } }));

function mockFetchedBlob(blob: Blob): void {
  useFetchMock.mockReturnValue({ blob: () => Promise.resolve({ data: ref(blob) }) });
}

describe("openAuthorizedFile", () => {
  let clickSpy: Mock;
  let appendSpy: Mock;

  beforeEach(() => {
    // jsdom implements neither object-URL function.
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {}) as unknown as Mock;
    appendSpy = vi.spyOn(document.body, "appendChild") as unknown as Mock;
    useFetchMock.mockReset();
    loggerErrorMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("fetches the file through the authenticated path and opens the blob in a new tab", async () => {
    mockFetchedBlob(new Blob(["x"], { type: "application/pdf" }));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf");

    expect(useFetchMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1");

    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.getAttribute("href")).toBe("blob:mock-url");
    expect(anchor.target).toBe("_blank");
    expect(anchor.rel).toBe("noopener noreferrer");
    // No `download` attribute: the tab must VIEW the blob, not save it.
    expect(anchor.hasAttribute("download")).toBe(false);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("re-types a typeless blob so the tab renders it instead of downloading", async () => {
    mockFetchedBlob(new Blob(["x"]));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf");

    const blob = (URL.createObjectURL as Mock).mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/pdf");
  });

  it("revokes the object URL only after the delay, so the new tab can still load it", async () => {
    vi.useFakeTimers();
    mockFetchedBlob(new Blob(["x"], { type: "application/pdf" }));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1");

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("logs a failed fetch instead of throwing", async () => {
    useFetchMock.mockReturnValue({ blob: () => Promise.reject(new Error("403")) });

    await expect(openAuthorizedFile("/api/sales-rep/documents/doc-1")).resolves.toBeUndefined();

    expect(loggerErrorMock).toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
