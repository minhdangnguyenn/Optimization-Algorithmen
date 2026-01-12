import { Rectangle, PackingResult } from "../../types";
import {
  BinPackingSolver,
  GreedySelectionCriterion,
} from "../BinPackingSolver";
import { SelectionStrategy } from "../greedy/GreedyAlgorithm";
import { GreedyElement } from "./GreedyAlgorithm";

/**
 * Legacy GreedyPacker class - now uses generic algorithm implementation
 *
 * This class maintains the same interface but now delegates to the generic
 * greedy algorithm implementation, demonstrating proper separation of concerns.
 * 
 * This class use FFD based on Area by default
 */
export class GreedyPacker {
  private solver: BinPackingSolver;

  constructor(boxSize: number, criteria: GreedySelectionCriterion) {
    // Use area-based selection strategy (First Fit Decreasing)
    this.solver = new BinPackingSolver(boxSize, criteria);
  }

  pack(rectangles: Rectangle[]): PackingResult {
    return this.solver.solve(rectangles);
  }
}

export class HeightBasedGreedyPacker {
  private solver: BinPackingSolver;

  // passing another criteria in constructor, using height based instead of area 
  constructor(boxSize: number) {
    this.solver = new BinPackingSolver(boxSize, "height");
  }

  pack(rectangles: Rectangle[]): PackingResult {
    return this.solver.solve(rectangles);
  }
}

/**
 * Alternative Selection Strategy: Height-based selection
 */
export class HeightBasedSelection implements SelectionStrategy<Rectangle> {
  selectNext(candidates: GreedyElement<Rectangle>[]): GreedyElement<Rectangle> | null {
    if (candidates.length === 0) return null;
    
    // Select element with highest height
    return candidates.reduce((best, current) => 
      current.value > best.value ? current : best // value = height for this criteria
    );
  }
}

/**
 * Selection Strategy: First Fit Decreasing (sort by area)
 */
export class AreaBasedSelection implements SelectionStrategy<Rectangle> {
  selectNext(candidates: GreedyElement<Rectangle>[]): GreedyElement<Rectangle> | null {
    if (candidates.length === 0) return null;
    
    // Select element with highest value (area)
    return candidates.reduce((best, current) => 
      current.value > best.value ? current : best // value = area for this criteria
    );
  }
}


