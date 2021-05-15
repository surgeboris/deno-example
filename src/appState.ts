export interface State {
  isBootstrapInProgress?: boolean;
  [k: string]: unknown;
}

export const state: State = {};

export function set<T extends string>(key: T, value: State[T]) {
  state[key] = value;
}
