import { describe, it, expect } from "vitest";
import { getFileSize, getBytes } from "./file-size";

describe("getFileSize", () => {
  it("should return file size in bytes when value isn't provided", () => {
    const result = getFileSize();
    expect(result).toEqual({ value: 0, unit: "byte" });
  });

  it("should return file size in bytes when value in bytes not in power of 2 is provided", () => {
    const result = getFileSize(1);
    expect(result).toEqual({ value: 1, unit: "byte" });
  });

  it("should return file size in bytes when value in bytes in power of 2 is provided", () => {
    const result = getFileSize(4);
    expect(result).toEqual({ value: 4, unit: "byte" });
  });

  it("should return file size in bytes when value in bytes less than kilobyte is provided", () => {
    const result = getFileSize(1023);
    expect(result).toEqual({ value: 1023, unit: "byte" });
  });

  it("should return file size in kilobytes when corresponding value in bytes are provided", () => {
    const result = getFileSize(1 * Math.pow(1024, 1));
    expect(result).toEqual({ value: 1, unit: "kilobyte" });
  });

  it("should return file size in kilobytes when corresponding fractional value in bytes are provided", () => {
    const result = getFileSize(1 * Math.pow(1024, 1) + 256);
    expect(result).toEqual({ value: 1.25, unit: "kilobyte" });
  });

  it("should return file size in megabytes when corresponding value in bytes are provided", () => {
    const result = getFileSize(1 * Math.pow(1024, 2));
    expect(result).toEqual({ value: 1, unit: "megabyte" });
  });

  it("should return file size in gigabytes when corresponding value in bytes are provided", () => {
    const result = getFileSize(1 * Math.pow(1024, 3));
    expect(result).toEqual({ value: 1, unit: "gigabyte" });
  });

  it("should return file size in terabytes when corresponding value in bytes are provided", () => {
    const result = getFileSize(1 * Math.pow(1024, 4));
    expect(result).toEqual({ value: 1, unit: "terabyte" });
  });
});

describe("getBytes", () => {
  it("should return 0 bytes when value isn't provided", () => {
    const result = getBytes();
    expect(result).toEqual(0);
  });

  it("should return file size in bytes when value in bytes is provided", () => {
    const result = getBytes({ value: 1, unit: "byte" });
    expect(result).toEqual(1);
  });

  it("should return file size in bytes when value in kilobytes is provided", () => {
    const result = getBytes({ value: 1, unit: "kilobyte" });
    expect(result).toEqual(Math.pow(1024, 1));
  });

  it("should return file size in bytes when fractional value in kilobytes is provided", () => {
    const result = getBytes({ value: 1.25, unit: "kilobyte" });
    expect(result).toEqual(Math.pow(1024, 1) + 256);
  });

  it("should return file size in bytes when value in megabytes is provided", () => {
    const result = getBytes({ value: 1, unit: "megabyte" });
    expect(result).toEqual(Math.pow(1024, 2));
  });

  it("should return file size in bytes when value in gigabytes is provided", () => {
    const result = getBytes({ value: 1, unit: "gigabyte" });
    expect(result).toEqual(Math.pow(1024, 3));
  });

  it("should return file size in bytes when value in terabytes is provided", () => {
    const result = getBytes({ value: 1, unit: "terabyte" });
    expect(result).toEqual(Math.pow(1024, 4));
  });
});
