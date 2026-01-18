export interface NeighborhoodStrategy<SOL> {
    getNeighbors(solution: SOL): readonly SOL[];
}
