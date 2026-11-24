import { describe, expect, it } from "vitest";
import { isAwaitingContactApproval } from "./contact-approval";

const PENDING = { requireApproval: true, isAuthenticated: true, isAdministrator: false, status: "New" };

describe("isAwaitingContactApproval", () => {
  it("holds back a signed-in customer whose status is New", () => {
    expect(isAwaitingContactApproval(PENDING)).toBe(true);
  });

  it("holds back any status other than Approved", () => {
    expect(isAwaitingContactApproval({ ...PENDING, status: "Rejected" })).toBe(true);
  });

  it("lets an Approved customer through", () => {
    expect(isAwaitingContactApproval({ ...PENDING, status: "Approved" })).toBe(false);
  });

  it("does nothing while the store has not opted in", () => {
    expect(isAwaitingContactApproval({ ...PENDING, requireApproval: false })).toBe(false);
    expect(isAwaitingContactApproval({ ...PENDING, requireApproval: undefined })).toBe(false);
  });

  it("treats an empty status as approved, as the platform does", () => {
    expect(isAwaitingContactApproval({ ...PENDING, status: null })).toBe(false);
    expect(isAwaitingContactApproval({ ...PENDING, status: undefined })).toBe(false);
    expect(isAwaitingContactApproval({ ...PENDING, status: "" })).toBe(false);
  });

  it("never holds back an administrator", () => {
    expect(isAwaitingContactApproval({ ...PENDING, isAdministrator: true })).toBe(false);
  });

  it("does not apply to a guest", () => {
    expect(isAwaitingContactApproval({ ...PENDING, isAuthenticated: false })).toBe(false);
  });
});
