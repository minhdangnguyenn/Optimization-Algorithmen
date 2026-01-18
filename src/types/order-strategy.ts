import { Candidate } from "./candidate";

export interface OrderingStrategy<C extends Candidate> {
    order(elements: readonly C[]): readonly C[];
}
