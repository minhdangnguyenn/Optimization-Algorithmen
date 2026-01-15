import { Candidate } from "../types/candidate";
import { State } from "../types/state";

export abstract class Algorithm<C extends Candidate, S extends State> {
  abstract solve(initialState: S, candidates: readonly C[]): S;
}
