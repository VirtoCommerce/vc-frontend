import { User } from "core/api/api-clients";

// state type
export interface ProfileState {
  // todo: replace with real errors model
  errors: any;
  // todo: replace with real profile model
  profile?: User;
  isLoading: boolean;
  loaded: boolean;
}
