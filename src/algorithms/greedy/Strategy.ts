import { Rectangle } from "../../types";
import { GreedyElement, SelectionStrategy } from "./GreedyAlgorithm";

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
