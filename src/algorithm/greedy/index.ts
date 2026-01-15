import { State } from "../state";
import { Extender } from "../../interfaces/extender";
import { Candidate } from "../../interfaces/candidate";
import { OrderingStrategy } from "../../interfaces/strategy/oderStrategy";

//export interface GreedyElement {}

export class GreedySolver<C extends Candidate, S extends State> {
  ordering: OrderingStrategy<C>;
  extender: Extender<C, S>;

  constructor(ordering: OrderingStrategy<C>, extender: Extender<C, S>) {
    this.ordering = ordering;
    this.extender = extender;
  }

  solve(initialState: S, candidates: readonly C[]): S {
    let state = initialState;
    const orderedCandidate = this.ordering.order(candidates);
    for (const candidate of orderedCandidate) {
      // if it is done then break
      // else keep extend the current state
      if (state.isCompleted()) break;
      state = this.extender.extend(state, candidate);
    }

    return state;
  }
}
