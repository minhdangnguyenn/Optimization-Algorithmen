import { LocalPacker } from ".";
import { NeighborhoodStrategy } from "../../types";
import type { State } from "../../types/state";

/**
 * Adapter to make NeighborhoodStrategy work with LocalPacker interface
 */
export class NeighborhoodAdapter<S extends State> implements LocalPacker<S> {
    private neighborhoodStrategy: NeighborhoodStrategy<S>;

    constructor(neighborhoodStrategy: NeighborhoodStrategy<S>) {
        this.neighborhoodStrategy = neighborhoodStrategy;
    }

    search(state: S): readonly S[] {
        return this.neighborhoodStrategy.getNeighbors(state);
    }
}
