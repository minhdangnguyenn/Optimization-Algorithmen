/**
 * Bin Packing Problem Implementation
 * 
 * This file contains the problem-specific logic for BOTH greedy and local search,
 * completely separated from the algorithm implementations.
 */

import { Rectangle, Box, PackingResult } from '../types';
import { BinPackingSolutionBuilder } from './BinPackingSolutionBuilder';
import { GreedyAlgorithm } from './greedy/GreedyAlgorithm';
import { AreaBasedSelection, HeightBasedSelection } from './greedy/Strategy';
import {
  ObjectiveFunction,
  InitialSolutionGenerator,
} from './localSearch/LocalSearchAlgorithm';


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
export type GreedySelectionCriterion = 'area' | 'height';

// ============================================================================
// LOCAL SEARCH PROBLEM-SPECIFIC IMPLEMENTATIONS
// ============================================================================

/**
 * Bin Packing Objective Function
 * Minimizes number of boxes, then maximizes utilization
 */
export class BinPackingObjective implements ObjectiveFunction<PackingResult> {
  evaluate(solution: PackingResult): number {
    // Primary: minimize boxes (weight heavily)
    // Secondary: maximize utilization (minimize negative utilization)
    return solution.totalBoxes * 1000 - solution.utilization;
  }
  
  isBetter(solution1: PackingResult, solution2: PackingResult): boolean {
    return solution1.totalBoxes < solution2.totalBoxes ||
      (solution1.totalBoxes === solution2.totalBoxes &&
       solution1.utilization > solution2.utilization);
  }
}

/**
 * Initial Solution Generator for Bin Packing (FFD)
 */
export class BinPackingInitialSolution implements InitialSolutionGenerator<Rectangle, PackingResult> {
  constructor(private boxSize: number) {}
  
  generate(rectangles: Rectangle[]): PackingResult {
    const sorted = [...rectangles].sort((a, b) => 
      (b.width * b.height) - (a.width * a.height)
    );
    
    const boxes: Box[] = [];
    let boxCounter = 0;
    
    for (const rect of sorted) {
      let placed = false;
      
      for (const box of boxes) {
        const position = this.findBestPosition(box, rect);
        if (position) {
          box.rectangles.push({
            ...rect,
            x: position.x,
            y: position.y,
            boxId: box.id
          });
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        const newBox: Box = {
          id: boxCounter++,
          width: this.boxSize,
          height: this.boxSize,
          rectangles: []
        };
        
        const position = this.findBestPosition(newBox, rect);
        if (position) {
          newBox.rectangles.push({
            ...rect,
            x: position.x,
            y: position.y,
            boxId: newBox.id
          });
          boxes.push(newBox);
        }
      }
    }
    
    const utilization = this.calculateUtilization(boxes);
    return {
      boxes,
      totalBoxes: boxes.length,
      utilization,
      algorithm: 'Initial FFD',
      executionTime: 0
    };
  }
  
  private findBestPosition(box: Box, rect: Rectangle): { x: number; y: number } | null {
    for (let y = 0; y <= this.boxSize - rect.height; y += 5) {
      for (let x = 0; x <= this.boxSize - rect.width; x += 5) {
        if (this.canPlaceAt(box, rect.width, rect.height, x, y)) {
          return { x, y };
        }
      }
    }
    return null;
  }
  
  private canPlaceAt(box: Box, width: number, height: number, x: number, y: number): boolean {
    if (x + width > this.boxSize || y + height > this.boxSize) {
      return false;
    }
    
    for (const rect of box.rectangles) {
      if (!(x + width <= rect.x || rect.x + rect.width <= x || 
            y + height <= rect.y || rect.y + rect.height <= y)) {
        return false;
      }
    }
    return true;
  }
  
  private calculateUtilization(boxes: Box[]): number {
    if (boxes.length === 0) return 0;
    const totalBoxArea = boxes.length * this.boxSize * this.boxSize;
    const usedArea = boxes.reduce((sum, box) => {
      return sum + box.rectangles.reduce((boxSum, rect) => 
        boxSum + rect.width * rect.height, 0);
    }, 0);
    return (usedArea / totalBoxArea) * 100;
  }
}

// ============================================================================
// BIN PACKING SOLVER (GREEDY + LOCAL SEARCH)
// ============================================================================

/**
 * Bin Packing Solver using Generic Greedy Algorithm
 */
export class GreedyBinPackingSolver {
  private algorithm: GreedyAlgorithm<Rectangle, BinPackingSolution>;

  constructor(
    boxSize: number,
    criterion: GreedySelectionCriterion = 'area'
  ) {
    let strategy: AreaBasedSelection | HeightBasedSelection;

    if (criterion === "area") {
        strategy = new AreaBasedSelection();
    } else if (criterion === "height") {
        strategy = new HeightBasedSelection();
    } else {
        throw new Error(`Unknown criterion: ${criterion}`);
    }
    const solutionBuilder = new BinPackingSolutionBuilder(boxSize, criterion);

    this.algorithm = new GreedyAlgorithm(
      strategy,
      solutionBuilder
    );
  }

  solve(rectangles: Rectangle[]): PackingResult {
    const result = this.algorithm.solve(rectangles);
    
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

