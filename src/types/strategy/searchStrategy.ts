import { Candidate } from "../candidate";

export interface SearchStrategy<C extends Candidate> {
  search(candidate: C): Candidate;
}
