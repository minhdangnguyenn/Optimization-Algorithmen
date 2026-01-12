import {  Box, PackingResult, Rectangle } from "../types";


import { 
    InitialSolutionGenerator,
    LocalSearchAlgorithm, 
    SimulatedAnnealingAcceptance,
    Neighborhood,
    ObjectiveFunction
} from "./localSearch/LocalSearch";
import { GeometryBasedNeighborhood } from "./localSearch/neighborhood/GeometryBasedNeighborhood";
import { OverlapNeighborhood } from "./localSearch/neighborhood/OverlappedNeigborhood";
import { RuleBasedNeighborhood } from "./localSearch/neighborhood/RuleBasedNeighborhood";

export type LocalSearchCriterion = "geometry" | "rule" | "overlap";
/**
 * Bin Packing Local Search Solver using Generic Local Search Algorithm
 */
export class BinPackingLocalSearchSolver {
  private algorithm: LocalSearchAlgorithm<Rectangle, PackingResult>;
  private neighborhood: Neighborhood<PackingResult>;

  constructor(
    boxSize: number,
    neighborhoodType: LocalSearchCriterion = 'geometry'
  ) {
    if (neighborhoodType === 'geometry') {
      this.neighborhood = new GeometryBasedNeighborhood(boxSize);
    } else if (neighborhoodType === 'rule') {
      this.neighborhood = new RuleBasedNeighborhood(boxSize);
    } else if (neighborhoodType === 'overlap') {
      this.neighborhood = new OverlapNeighborhood(boxSize);
    } else {
      throw new Error(`Unknown neighborhood type: ${neighborhoodType}`);
    }

    class NaiveInitialSolution implements InitialSolutionGenerator<Rectangle, PackingResult> {
      constructor(private boxSize: number) {}

      generate(rectangles: Rectangle[]): PackingResult {
        // Naive solution: place each rectangle in its own box at position (0, 0)
        const boxes = rectangles.map((rect, index) => ({
          id: index,
          width: this.boxSize,
          height: this.boxSize,
          rectangles: [{
            ...rect,
            x: 0,
            y: 0,
            boxId: index
          }]
        }));

        const totalBoxes = boxes.length;
        const totalBoxArea = totalBoxes * this.boxSize * this.boxSize;
        const usedArea = rectangles.reduce((sum, rect) => sum + rect.width * rect.height, 0);
        const utilization = totalBoxArea > 0 ? (usedArea / totalBoxArea) * 100 : 0;

        return {
          boxes,
          totalBoxes,
          utilization,
          algorithm: 'Naive Initial Solution',
          executionTime: 0
        };
      }
    }
    
    const objective = new BinPackingObjective();
    const acceptance = new SimulatedAnnealingAcceptance<PackingResult>();
    const initialSolution = new NaiveInitialSolution(boxSize);
    
    this.algorithm = new LocalSearchAlgorithm(
      this.neighborhood,
      objective,
      acceptance,
      initialSolution
    );
  }

  solve(rectangles: Rectangle[], maxIterations: number = 100): PackingResult {
    // Set rectangles in neighborhood before solving
    if ('setRectangles' in this.neighborhood) {
      (this.neighborhood as any).setRectangles(rectangles);
    }
    
    const result = this.algorithm.search(rectangles, maxIterations);
    
    return {
      ...result.solution,
      algorithm: `Generic Local Search (${result.solution.totalBoxes} boxes)`,
      executionTime: result.executionTime
    };
  }
}

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
