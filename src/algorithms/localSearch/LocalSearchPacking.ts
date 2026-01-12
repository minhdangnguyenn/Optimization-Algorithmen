import { Box, PackingResult, PlacedRectangle, Rectangle } from "../../types";
import { Neighborhood } from "./LocalSearch";
import { GeometryBasedNeighborhood } from "./neighborhood/GeometryBasedNeighborhood";
import { OverlapNeighborhood } from "./neighborhood/OverlappedNeigborhood";
import { RuleBasedNeighborhood } from "./neighborhood/RuleBasedNeighborhood";

export class LocalSearchPacker {
  private boxSize: number;
  private neighborhoods: Neighborhood<PackingResult>[];
  private earlyStoppingThreshold: number = 0.2; // Stop if no improvement for 20% of max iterations
  
  constructor(boxSize: number, neighborhoodType: 'geometry' | 'rule' | 'overlap' = 'geometry') {
    this.boxSize = boxSize;
    
    this.neighborhoods = [];
    if (neighborhoodType === 'geometry') {
      this.neighborhoods.push(new GeometryBasedNeighborhood(boxSize));
    } else if (neighborhoodType === 'rule') {
      this.neighborhoods.push(new RuleBasedNeighborhood(boxSize));
    } else if (neighborhoodType === 'overlap') {
      this.neighborhoods.push(new OverlapNeighborhood(boxSize));
    }
  }

  pack(rectangles: Rectangle[], maxIterations: number = 100): PackingResult {
    const startTime = performance.now();
    
    // Check if any rectangle is too large for the box
    const unpackableRectangles = rectangles.filter(rect => 
      Math.min(rect.width, rect.height) > this.boxSize || 
      Math.max(rect.width, rect.height) > this.boxSize
    );

    if (unpackableRectangles.length > 0) {
      const endTime = performance.now();
      return {
        boxes: [],
        totalBoxes: 0,
        utilization: 0,
        algorithm: `Local Search (FAILED: ${unpackableRectangles.length} rectangles too large for box size ${this.boxSize})`,
        executionTime: endTime - startTime
      };
    }

    // Generate initial solution using random permutation placement
    let currentSolution = this.generateInitialSolution(rectangles);
    
    // Check if initial solution was successful
    if (currentSolution.totalBoxes === 0) {
      const endTime = performance.now();
      return {
        boxes: [],
        totalBoxes: 0,
        utilization: 0,
        algorithm: `Local Search (FAILED: Could not place all rectangles)`,
        executionTime: endTime - startTime
      };
    }

    let bestSolution = JSON.parse(JSON.stringify(currentSolution));
    
    // Verify all rectangles are placed in initial solution
    const totalPlacedInInitial = currentSolution.boxes.reduce((sum: number, box: Box) => sum + box.rectangles.length, 0);
    if (totalPlacedInInitial !== rectangles.length) {
      const endTime = performance.now();
      return {
        ...currentSolution,
        algorithm: `Local Search (WARNING: Only ${totalPlacedInInitial}/${rectangles.length} rectangles placed)`,
        executionTime: endTime - startTime
      };
    }
    
    // Local search iterations with early stopping
    let iterationsWithoutImprovement = 0;
    const maxIterationsWithoutImprovement = Math.max(10, Math.floor(maxIterations * this.earlyStoppingThreshold));
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const newSolution = this.performLocalSearch(currentSolution, rectangles, iteration, maxIterations);
      
      // Verify all rectangles are still placed after local search
      const totalPlacedInNew = newSolution.boxes.reduce((sum: number, box: Box) => sum + box.rectangles.length, 0);
      if (totalPlacedInNew !== rectangles.length) {
        continue; // Skip invalid solutions
      }
      
      if (newSolution.totalBoxes < bestSolution.totalBoxes || 
          (newSolution.totalBoxes === bestSolution.totalBoxes && newSolution.utilization > bestSolution.utilization)) {
        bestSolution = JSON.parse(JSON.stringify(newSolution));
        currentSolution = newSolution;
        iterationsWithoutImprovement = 0; // Reset counter on improvement
      } else {
        iterationsWithoutImprovement++;
        
        // Accept worse solutions with probability (simulated annealing approach)
        const temperature = 1.0 - (iteration / maxIterations);
        const probability = Math.exp(-(newSolution.totalBoxes - currentSolution.totalBoxes) / Math.max(0.1, temperature));
        if (Math.random() < probability) {
          currentSolution = newSolution;
        }
      }
      
      // Early stopping: if no improvement for many iterations, stop
      if (iterationsWithoutImprovement > maxIterationsWithoutImprovement && iteration > maxIterations * 0.5) {
        break;
      }
    }

    const endTime = performance.now();
    const finalPlacedCount = bestSolution.boxes.reduce((sum: number, box: Box) => sum + box.rectangles.length, 0);
    
    return {
      ...bestSolution,
      algorithm: `Local Search (${finalPlacedCount}/${rectangles.length} rectangles placed)`,
      executionTime: endTime - startTime
    };
  }

  private generateInitialSolution(rectangles: Rectangle[]): PackingResult {
    // Naive solution: each rectangle gets its own box at position (0, 0)
    const boxes: Box[] = [];

    for (let i = 0; i < rectangles.length; i++) {
      const rect = rectangles[i];
      const box: Box = {
        id: i,
        width: this.boxSize,
        height: this.boxSize,
        rectangles: [{
          ...rect,
          x: 0,
          y: 0,
          boxId: i
        }]
      };
      boxes.push(box);
    }

    const utilization = this.calculateUtilization(boxes);
    return {
      boxes,
      totalBoxes: boxes.length,
      utilization,
      algorithm: 'Naive Solution',
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
    if (x + width > this.boxSize || y + height > this.boxSize || x < 0 || y < 0) {
      return false;
    }

    for (const rect of box.rectangles) {
      if (!(x + width <= rect.x || rect.x + rect.width <= x || y + height <= rect.y || rect.y + rect.height <= y)) {
        return false;
      }
    }
    return true;
  }

  private calculateUtilization(boxes: Box[]): number {
    if (boxes.length === 0) return 0;
    const totalBoxArea = boxes.length * this.boxSize * this.boxSize;
    const usedArea = boxes.reduce((sum, box) => {
      return sum + box.rectangles.reduce((boxSum, rect) => boxSum + rect.width * rect.height, 0);
    }, 0);
    return (usedArea / totalBoxArea) * 100;
  }

  private performLocalSearch(solution: PackingResult, rectangles: Rectangle[], iteration: number, maxIterations: number): PackingResult {
    if (this.neighborhoods.length === 0) {
      return solution;
    }

    // Set rectangles in neighborhoods before using them
    for (const neighborhood of this.neighborhoods) {
      if ('setRectangles' in neighborhood) {
        (neighborhood as any).setRectangles(rectangles);
      }
    }

    // Update overlap neighborhood iteration
    const overlapNeighborhood = this.neighborhoods.find(n => n instanceof OverlapNeighborhood) as OverlapNeighborhood;
    if (overlapNeighborhood && 'setIteration' in overlapNeighborhood) {
      overlapNeighborhood.setIteration(iteration);
    }

    // Randomly select a neighborhood
    const neighborhood = this.neighborhoods[Math.floor(Math.random() * this.neighborhoods.length)];
    return neighborhood.getNeighbor(solution);
  }
}

export { GeometryBasedNeighborhood };

