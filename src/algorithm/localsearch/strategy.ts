import { NeighborhoodStrategy, State } from ".";
import { PackingSolution } from "../solution";
import { Rectangle } from "../rectangle";
import { PackingState } from "./packing";

export class GeometryBasedNeighborhood implements NeighborhoodStrategy<PackingState> {
  generateNeighbors(state: PackingState): PackingState[] {
    const neighbors: PackingState[] = [];

    // Example: move one rectangle
    // for (const rect of state.packedRectangles) {
    //   // move the rect to new position
    //   const moved = rect.setPosition(1, 0); // hypothetical
    //   if (moved.isValid()) {
    //     neighbors.push(state.withMovedRectangle(rect, moved));
    //   }
    // }

    return neighbors;
  }
}
