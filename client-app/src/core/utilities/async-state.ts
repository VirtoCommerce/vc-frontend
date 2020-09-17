import { AsyncState } from '../models/asyncState';

export function fetchAsync(state: AsyncState) {
  state.isLoading = true;
  state.loaded = false;
  state.errors = null;
}

export function setAsync(state: AsyncState) {
  state.loaded = true;
  state.isLoading = false;
  // todo: add error handling
}
