import { NeighborhoodStrategy, State } from ".";
import { PackingSolution } from "../solution";
import { Rectangle } from "../rectangle";
import { PackingState } from "./packing";
import { Box } from "../box";

export class GeometryBasedNeighborhood implements NeighborhoodStrategy<PackingState> {
  generateNeighbors(state: PackingState): PackingState[] {
    const neighbors: PackingState[] = [];

    for (const rect of state.packedRectangles) {
      // move rectangle within a box
      // move rectangle between different box
      //
    }

    return neighbors;
  }

  // move rectangles within a box to maximize the vertical first
  compactBoxVertically(state: PackingState, box: Box) {
    // sort the rectangle for this box base on their height desc
    const rectangles = box.rectangles.sort(
      (rect1, rect2) => rect1.height - rect2.height,
    );

    for (const rect of rectangles) {
      if (box.id != 0) {
      }
    }
  }
}
