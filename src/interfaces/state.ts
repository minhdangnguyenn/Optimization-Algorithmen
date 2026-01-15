export interface State {
  isCompleted(): boolean;
  evaluate?(): number;
}
