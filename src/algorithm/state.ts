export interface State {
  isComplete(): boolean;
  evaluate?(): number;
}
