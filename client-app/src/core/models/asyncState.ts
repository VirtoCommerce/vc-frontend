export interface AsyncState {
  isLoading: boolean;
  loaded: boolean;
  // todo: replace with real errors model
  errors: object | null;
}

