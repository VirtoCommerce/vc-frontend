import { describe, it, expect } from "vitest";
import { isFilenameOnly } from "./images";

describe("isFilenameOnly", () => {
  it("should return true for filenames with letters, numbers, dashes, and underscores", () => {
    expect(isFilenameOnly("image.png")).toBe(true);
    expect(isFilenameOnly("file-name_123.txt")).toBe(true);
    expect(isFilenameOnly("example-file_456.jpg")).toBe(true);
    expect(isFilenameOnly("123_file-name.pdf")).toBe(true);
  });

  it("should return true for filenames without extensions", () => {
    expect(isFilenameOnly("image")).toBe(true);
    expect(isFilenameOnly("file_name")).toBe(true);
    expect(isFilenameOnly("file-name-123")).toBe(true);
  });

  it("should return false for paths", () => {
    expect(isFilenameOnly("path/to/image.png")).toBe(false);
    expect(isFilenameOnly("/image.png")).toBe(false);
    expect(isFilenameOnly("./image.png")).toBe(false);
  });

  it("should return false for external URLs", () => {
    expect(isFilenameOnly("http://example.com/image.png")).toBe(false);
    expect(isFilenameOnly("https://example.com/file.txt")).toBe(false);
  });

  it("should return false for empty strings", () => {
    expect(isFilenameOnly("")).toBe(false);
  });

  it("should return false for filenames with slashes, spaces, or invalid characters", () => {
    expect(isFilenameOnly("file/name.png")).toBe(false);
    expect(isFilenameOnly("file name.png")).toBe(false);
    expect(isFilenameOnly("<filename.png")).toBe(false);
    expect(isFilenameOnly("filename.png>")).toBe(false);
    expect(isFilenameOnly("filename?.png")).toBe(false);
  });
});
