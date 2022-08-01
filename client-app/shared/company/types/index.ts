import { Role } from "@/core/types/role";

export type AddNewMember = {
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};
