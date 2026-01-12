/**
 * Bin Packing Problem Implementation
 * 
 * This file contains the problem-specific logic for bin packing,
 * completely separated from the algorithm implementation.
 */

import { Rectangle, PlacedRectangle, Box, PackingResult, Point } from '../types';
import { 
  GreedyAlgorithm, 
  SelectionStrategy, 
  SolutionBuilder, 
  GreedyElement 
} from './greedy/GreedyAlgorithm';

/**
 * Bin Packing Solution representation
 */
export interface BinPackingSolution {
  boxes: Box[];
  boxSize: number;
}

/**
 * Criterion for selecting rectangles
 */
export type SelectionCriterion = 'area' | 'height';

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
 * Solution Builder: Constructs bin packing solutions
 */
export class BinPackingSolutionBuilder implements SolutionBuilder<Rectangle, BinPackingSolution> {
  constructor(private boxSize: number, private criterion: SelectionCriterion = 'area') {}

  createInitialSolution(): BinPackingSolution {
    return {
      boxes: [],
      boxSize: this.boxSize
    };
  }

  addElement(currentSolution: BinPackingSolution, rectangle: Rectangle): BinPackingSolution {
    // Try to place in existing boxes first
    for (const box of currentSolution.boxes) {
      const position = this.findBestPosition(box, rectangle);
      if (position) {
        const placedRect: PlacedRectangle = {
          ...rectangle,
          width: position.width,
          height: position.height,
          rotated: position.rotated,
          x: position.x,
          y: position.y,
          boxId: box.id
        };
        box.rectangles.push(placedRect);
        return currentSolution;
      }
    }

    // Create new box if needed
    const newBox: Box = {
      id: currentSolution.boxes.length,
      width: this.boxSize,
      height: this.boxSize,
      rectangles: []
    };

    const position = this.findBestPosition(newBox, rectangle);
    
    if (position) {
      const placedRect: PlacedRectangle = {
        ...rectangle,
        width: position.width,
        height: position.height,
        rotated: position.rotated,
        x: position.x,
        y: position.y,
        boxId: newBox.id
      };
      newBox.rectangles.push(placedRect);
      currentSolution.boxes.push(newBox);
    }

    return currentSolution;
  }

  // Sort the rectangles based on: area or height
  prepareElements(rectangles: Rectangle[]): GreedyElement<Rectangle>[] {
    return rectangles
      .map(rect => {
        let value: number;
        if (this.criterion === 'height') {
          value = Math.max(rect.height, rect.width);
        } else {
          value = rect.width * rect.height; // Area for default
        }
        return {
          element: rect,
          value
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by criterion descending
  }

  private findBestPosition(box: Box, rect: Rectangle): { x: number; y: number; width: number; height: number; rotated: boolean } | null {
    // Try both orientations
    const orientations = [
      { width: rect.width, height: rect.height, rotated: rect.rotated },
      { width: rect.height, height: rect.width, rotated: !rect.rotated }
    ];

    for (const orientation of orientations) {
      if (orientation.width > this.boxSize || orientation.height > this.boxSize) {
        continue;
      }

      // Bottom-left fill strategy
      const positions = this.generatePositions(box);
      
      for (const pos of positions) {
        if (this.canPlaceAt(box, orientation.width, orientation.height, pos.x, pos.y)) {
          return {
            x: pos.x,
            y: pos.y,
            width: orientation.width,
            height: orientation.height,
            rotated: orientation.rotated
          };
        }
      }
    }

    return null;
  }

  private generatePositions(box: Box): Point[] {
    const positions: Point[] = [{ x: 0, y: 0 }];
    
    // Add positions based on existing rectangles
    for (const rect of box.rectangles) {
      positions.push(
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height }
      );
    }

    // Sort by bottom-left preference
    return positions.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }

  private canPlaceAt(box: Box, width: number, height: number, x: number, y: number): boolean {
    // Check bounds
    if (x + width > this.boxSize || y + height > this.boxSize) {
      return false;
    }

    // Check overlap with existing rectangles
    for (const rect of box.rectangles) {
      if (this.rectanglesOverlap(
        { x, y, width, height },
        { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      )) {
        return false;
      }
    }

    return true;
  }

  private rectanglesOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  }
}

/**
 * Bin Packing Solver using Generic Greedy Algorithm
 */
export class BinPackingSolver {
  private algorithm: GreedyAlgorithm<Rectangle, BinPackingSolution>;

  constructor(
    boxSize: number,
    selectionStrategy?: SelectionStrategy<Rectangle>,
    criterion: SelectionCriterion = 'area'
  ) {
    const strategy = selectionStrategy || new AreaBasedSelection();
    // const feasibilityChecker = new BinPackingFeasibility();
    const solutionBuilder = new BinPackingSolutionBuilder(boxSize, criterion);

    this.algorithm = new GreedyAlgorithm(
      strategy,
      // feasibilityChecker,
      solutionBuilder
    );
  }

  solve(rectangles: Rectangle[]): PackingResult {
    const result = this.algorithm.solve(rectangles);
    
    // Convert to expected PackingResult format
    const utilization = this.calculateUtilization(result.solution.boxes, result.solution.boxSize);
    const unplacedCount = rectangles.length - result.selectedElements.length;
    
    const algorithmName = unplacedCount > 0 
      ? `Generic Greedy (WARNING: ${unplacedCount} rectangles not placed)`
      : `Generic Greedy (${result.selectedElements.length}/${rectangles.length} rectangles placed)`;

    return {
      boxes: result.solution.boxes,
      totalBoxes: result.solution.boxes.length,
      utilization,
      algorithm: algorithmName,
      executionTime: result.executionTime
    };
  }

  private calculateUtilization(boxes: Box[], boxSize: number): number {
    if (boxes.length === 0) return 0;

    const totalBoxArea = boxes.length * boxSize * boxSize;
    const usedArea = boxes.reduce((sum, box) => {
      return sum + box.rectangles.reduce((boxSum, rect) => {
        return boxSum + rect.width * rect.height;
      }, 0);
    }, 0);

    return (usedArea / totalBoxArea) * 100;
  }
}