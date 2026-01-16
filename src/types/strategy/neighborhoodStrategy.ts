import { Candidate } from "../candidate";

export interface NeighborhoodStrategy<S> {
    generateNeighbors(state: S): readonly S[];
}
