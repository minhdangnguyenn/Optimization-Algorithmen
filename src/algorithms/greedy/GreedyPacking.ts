import { Rectangle, PackingResult } from "../../types";
import {
  GreedyBinPackingSolver,
  GreedySelectionCriterion,
} from "../GreedySolver";


/**
 * Legacy GreedyPacker class - now uses generic algorithm implementation
 *
 * This class maintains the same interface but now delegates to the generic
 * greedy algorithm implementation, demonstrating proper separation of concerns.
 * 
 * This class use FFD based on Area by default
 */
export class GreedyPacker {
  private solver: GreedyBinPackingSolver;

  constructor(boxSize: number, criteria: GreedySelectionCriterion) {
    // Use area-based selection strategy (First Fit Decreasing)
    this.solver = new GreedyBinPackingSolver(boxSize, criteria);
  }

  pack(rectangles: Rectangle[]): PackingResult {
    return this.solver.solve(rectangles);
  }
}

export class HeightBasedGreedyPacker {
  private solver: GreedyBinPackingSolver;

  // passing another criteria in constructor, using height based instead of area 
  constructor(boxSize: number) {
    this.solver = new GreedyBinPackingSolver(boxSize, "height");
  }

  pack(rectangles: Rectangle[]): PackingResult {
    return this.solver.solve(rectangles);
  }
}



