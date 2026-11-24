import { ContactStatus } from "@/shared/company/types";

const APPROVED: string = ContactStatus.Approved;

export interface IContactApprovalInput {
  /** The store's `require_contact_approval` theme setting. */
  requireApproval?: boolean;
  isAuthenticated: boolean;
  isAdministrator?: boolean;
  /** The contact's status; empty counts as approved, as on the platform. */
  status?: string | null;
}

export function isAwaitingContactApproval(input: IContactApprovalInput): boolean {
  return (
    !!input.requireApproval &&
    input.isAuthenticated &&
    !input.isAdministrator &&
    !!input.status &&
    input.status !== APPROVED
  );
}
