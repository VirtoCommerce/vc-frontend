import { Role } from "@/core/types/role";

export type AddNewMember = {
  //role: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};
