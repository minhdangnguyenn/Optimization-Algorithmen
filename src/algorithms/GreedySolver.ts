/**
 * Bin Packing Problem Implementation
 * 
 * This file contains the problem-specific logic for BOTH greedy and local search,
 * completely separated from the algorithm implementations.
 */

import { Rectangle, Box, PackingResult } from '../types';
import { GreedySolutionBuilder } from './greedy/GreedySolutionBuilder';
import { GreedyAlgorithm } from './greedy/GreedyAlgorithm';
import { AreaBasedSelection, HeightBasedSelection } from './greedy/Strategy';

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
    const solutionBuilder = new GreedySolutionBuilder(boxSize, criterion);

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