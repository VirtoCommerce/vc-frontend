import { Role } from "@/core/types";

export type AddNewMember = {
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};
