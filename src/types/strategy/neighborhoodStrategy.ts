import { Candidate } from "../candidate";

export interface NeighborhoodStrategy<SOL> {
    generateNeighbors(solution: SOL): readonly SOL[];
}
