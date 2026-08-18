import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { openAuthorizedFile } from "./files";
import type { Mock } from "vitest";

const useFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/core/api/common", () => ({ useFetch: useFetchMock }));

const downloadFileMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/files", () => ({ downloadFile: downloadFileMock }));

const notifyErrorMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: notifyErrorMock }) }));

vi.mock("@/core/globals", () => ({ globals: { i18n: { global: { t: (key: string) => key } } } }));

const loggerErrorMock = vi.hoisted(() => vi.fn());
vi.mock("@/core/utilities", () => ({ Logger: { error: loggerErrorMock } }));

function mockFetchedBlob(blob: Blob): void {
  useFetchMock.mockReturnValue({ blob: () => Promise.resolve({ data: ref(blob) }) });
}

describe("openAuthorizedFile", () => {
  let openSpy: Mock;
  let fakeTab: { location: { href: string }; opener: unknown; close: Mock };

  beforeEach(() => {
    // jsdom implements neither object-URL function.
    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    fakeTab = { location: { href: "" }, opener: {}, close: vi.fn() };
    openSpy = vi.spyOn(window, "open").mockReturnValue(fakeTab as unknown as Window) as unknown as Mock;
    useFetchMock.mockReset();
    downloadFileMock.mockReset();
    notifyErrorMock.mockReset();
    loggerErrorMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders an allow-listed type inline: opens the tab synchronously and points it at the blob URL", async () => {
    mockFetchedBlob(new Blob(["x"], { type: "application/pdf" }));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf", "spring.pdf");

    // Tab opened inside the click gesture (blank), before the awaited fetch — not blocked by Safari/FF.
    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    expect(useFetchMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1");
    expect(fakeTab.location.href).toBe("blob:mock-url");
    // Opener severed, as rel="noopener" would.
    expect(fakeTab.opener).toBeNull();
    expect(downloadFileMock).not.toHaveBeenCalled();
  });

  it("re-types a typeless blob so the tab renders it instead of downloading", async () => {
    mockFetchedBlob(new Blob(["x"]));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf", "spring.pdf");

    const blob = (URL.createObjectURL as Mock).mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/pdf");
  });

  it("downloads a non-inline type instead of opening it same-origin", async () => {
    // An .html/.svg blob would run script on the storefront origin, so it must never be opened inline.
    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "text/html", "evil.html");

    expect(downloadFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1", "evil.html");
    expect(openSpy).not.toHaveBeenCalled();
    expect(useFetchMock).not.toHaveBeenCalled();
  });

  it("downloads when the content type is unknown", async () => {
    await openAuthorizedFile("/api/sales-rep/documents/doc-1", undefined, "mystery.bin");

    expect(downloadFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1", "mystery.bin");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("falls back to a download when the popup is blocked", async () => {
    openSpy.mockReturnValue(null);
    mockFetchedBlob(new Blob(["x"], { type: "application/pdf" }));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf", "spring.pdf");

    expect(downloadFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1", "spring.pdf");
  });

  it("revokes the object URL only after the delay, so the new tab can still load it", async () => {
    vi.useFakeTimers();
    mockFetchedBlob(new Blob(["x"], { type: "application/pdf" }));

    await openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf", "spring.pdf");

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("closes the tab, logs, and toasts when the fetch fails", async () => {
    useFetchMock.mockReturnValue({ blob: () => Promise.reject(new Error("403")) });

    await expect(
      openAuthorizedFile("/api/sales-rep/documents/doc-1", "application/pdf", "spring.pdf"),
    ).resolves.toBeUndefined();

    expect(fakeTab.close).toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalled();
    expect(notifyErrorMock).toHaveBeenCalled();
  });
});
