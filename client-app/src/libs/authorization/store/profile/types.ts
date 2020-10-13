import { UserType } from '@core/api/graphql/types';

// state type
export interface ProfileState {
  // todo: replace with real errors model
  errors: any;
  // todo: replace with real profile model
  profile?: UserType;
  isLoading: boolean;
  loaded: boolean;
}
