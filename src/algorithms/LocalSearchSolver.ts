import {  PackingResult, Rectangle } from "../types";


import { 
    InitialSolutionGenerator,
    LocalSearchAlgorithm, 
    SimulatedAnnealingAcceptance 
} from "./localSearch/LocalSearchAlgorithm";
import { Neighborhood } from "./localSearch/LocalSearchAlgorithm";
import { GeometryBasedNeighborhood } from "./localSearch/neighborhood/GeometryBasedNeighborhood";
import { OverlapNeighborhood } from "./localSearch/neighborhood/OverlappedNeigborhood";
import { RuleBasedNeighborhood } from "./localSearch/neighborhood/RuleBasedNeighborhood";
import { BinPackingObjective, BinPackingInitialSolution } from "./GreedySolver";

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