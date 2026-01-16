import { Candidate } from "../candidate";

export interface NeighborhoodStrategy<SOL> {
    getNeighbors(solution: SOL): readonly SOL[];
}
