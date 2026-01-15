import { Candidate } from "../interfaces/candidate";
import { State } from "../interfaces/state";

export abstract class Algorithm<C extends Candidate, S extends State> {
  abstract solve(initialState: S, candidates: readonly C[]): S;
}
