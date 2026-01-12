/**
 * Bin Packing Problem Implementation
 * 
 * This file contains the problem-specific logic for BOTH greedy and local search,
 * completely separated from the algorithm implementations.
 */

import { Rectangle, Box, PackingResult, PlacedRectangle } from '../types';
import { BinPackingSolutionBuilder } from './BinPackingSolutionBuilder';
import { 
  GreedyAlgorithm, 
} from './greedy/GreedyAlgorithm';
import { AreaBasedSelection, HeightBasedSelection } from './greedy/Strategy';
import {
  GenericLocalSearchAlgorithm,
  Neighborhood,
  ObjectiveFunction,
  InitialSolutionGenerator,
  SimulatedAnnealingAcceptance
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

export type LocalSearchCriterion = "geometry" | "rule" | "overlap";

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
 * Geometry-Based Neighborhood for Bin Packing
 */
export class GeometryBasedNeighborhood implements Neighborhood<PackingResult> {
  constructor(private boxSize: number) {}
  
  getNeighbor(currentSolution: PackingResult): PackingResult {
    const boxes = JSON.parse(JSON.stringify(currentSolution.boxes)) as Box[];
    
    const operation = Math.random();
    
    if (operation < 0.33) {
      return this.moveWithinBox(boxes, currentSolution);
    } else if (operation < 0.66) {
      return this.moveBetweenBoxes(boxes, currentSolution);
    } else {
      return this.swapBetweenBoxes(boxes, currentSolution);
    }
  }
  
  private moveWithinBox(boxes: Box[], solution: PackingResult): PackingResult {
    if (boxes.length === 0 || boxes.every(b => b.rectangles.length === 0)) {
      return { ...solution, boxes };
    }

    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    const box = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * box.rectangles.length);
    const rect = box.rectangles[rectIndex];

    const newPosition = this.findNearbyPosition(box, rect);
    if (newPosition) {
      box.rectangles[rectIndex] = { ...rect, x: newPosition.x, y: newPosition.y };
    }

    const utilization = this.calculateUtilization(boxes);
    return { ...solution, boxes, utilization };
  }

  private moveBetweenBoxes(boxes: Box[], solution: PackingResult): PackingResult {
    if (boxes.length < 2) return { ...solution, boxes };

    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    if (nonEmptyBoxes.length === 0) return { ...solution, boxes };

    const sourceBox = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * sourceBox.rectangles.length);
    const rect = sourceBox.rectangles[rectIndex];

    const targetBoxes = boxes.filter(b => b.id !== sourceBox.id);
    
    for (let i = 0; i < 3; i++) {
      const targetBox = targetBoxes[Math.floor(Math.random() * targetBoxes.length)];
      const position = this.findBestPosition(targetBox, rect);
      
      if (position) {
        sourceBox.rectangles.splice(rectIndex, 1);
        targetBox.rectangles.push({ ...rect, x: position.x, y: position.y, boxId: targetBox.id });

        const nonEmptyBoxesResult = boxes.filter(b => b.rectangles.length > 0);
        const utilization = this.calculateUtilization(nonEmptyBoxesResult);
        return { 
          ...solution, 
          boxes: nonEmptyBoxesResult, 
          totalBoxes: nonEmptyBoxesResult.length, 
          utilization 
        };
      }
    }

    const utilization = this.calculateUtilization(boxes);
    return { ...solution, boxes, utilization };
  }

  private swapBetweenBoxes(boxes: Box[], solution: PackingResult): PackingResult {
    if (boxes.length < 2) return { ...solution, boxes };

    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    if (nonEmptyBoxes.length < 2) return { ...solution, boxes };

    const box1 = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const box2 = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    
    if (box1.id === box2.id) return { ...solution, boxes };

    const idx1 = Math.floor(Math.random() * box1.rectangles.length);
    const idx2 = Math.floor(Math.random() * box2.rectangles.length);

    const rect1 = box1.rectangles[idx1];
    const rect2 = box2.rectangles[idx2];

    box1.rectangles.splice(idx1, 1);
    box2.rectangles.splice(idx2, 1);

    if (this.canPlaceAt(box1, rect2.width, rect2.height, rect2.x, rect2.y) &&
        this.canPlaceAt(box2, rect1.width, rect1.height, rect1.x, rect1.y)) {
      box1.rectangles.push({ ...rect2, x: rect2.x, y: rect2.y, boxId: box1.id });
      box2.rectangles.push({ ...rect1, x: rect1.x, y: rect1.y, boxId: box2.id });
    } else {
      box1.rectangles.push(rect1);
      box2.rectangles.push(rect2);
    }

    const utilization = this.calculateUtilization(boxes);
    return { ...solution, boxes, utilization };
  }

  private findNearbyPosition(box: Box, rect: PlacedRectangle): { x: number; y: number } | null {
    const attempts = 15;
    for (let i = 0; i < attempts; i++) {
      const offsetX = (Math.random() - 0.5) * this.boxSize * 0.3;
      const offsetY = (Math.random() - 0.5) * this.boxSize * 0.3;
      const x = Math.max(0, Math.min(this.boxSize - rect.width, rect.x + offsetX));
      const y = Math.max(0, Math.min(this.boxSize - rect.height, rect.y + offsetY));

      if (this.canPlaceAt(box, rect.width, rect.height, x, y, rect)) {
        return { x, y };
      }
    }
    return null;
  }

  private findBestPosition(box: Box, rect: Rectangle | PlacedRectangle): { x: number; y: number } | null {
    for (let y = 0; y <= this.boxSize - rect.height; y += 5) {
      for (let x = 0; x <= this.boxSize - rect.width; x += 5) {
        if (this.canPlaceAt(box, rect.width, rect.height, x, y)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  private canPlaceAt(box: Box, width: number, height: number, x: number, y: number, excludeRect?: PlacedRectangle): boolean {
    if (x + width > this.boxSize || y + height > this.boxSize || x < 0 || y < 0) {
      return false;
    }

    for (const rect of box.rectangles) {
      if (excludeRect && rect.id === excludeRect.id) continue;

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

/**
 * Rule-Based Neighborhood for Bin Packing
 */
export class RuleBasedNeighborhood implements Neighborhood<PackingResult> {
  constructor(private boxSize: number) {}
  
  getNeighbor(currentSolution: PackingResult): PackingResult {
    const permutation: number[] = [];
    for (const box of currentSolution.boxes) {
      for (const rect of box.rectangles) {
        permutation.push(rect.id);
      }
    }
    
    const newPermutation = this.modifyPermutation(permutation);
    return this.rebuildFromPermutation(newPermutation, currentSolution);
  }
  
  private modifyPermutation(permutation: number[]): number[] {
    const newPerm = [...permutation];
    
    if (newPerm.length < 2) return newPerm;
    
    const operation = Math.random();
    if (operation < 0.5) {
      const i = Math.floor(Math.random() * newPerm.length);
      const j = Math.floor(Math.random() * newPerm.length);
      [newPerm[i], newPerm[j]] = [newPerm[j], newPerm[i]];
    } else {
      const i = Math.floor(Math.random() * newPerm.length);
      const j = Math.floor(Math.random() * newPerm.length);
      if (i !== j) {
        const elem = newPerm.splice(i, 1)[0];
        newPerm.splice(j, 0, elem);
      }
    }
    
    return newPerm;
  }
  
  private rebuildFromPermutation(permutation: number[], oldSolution: PackingResult): PackingResult {
    const rectMap = new Map<number, Rectangle>();
    for (const box of oldSolution.boxes) {
      for (const rect of box.rectangles) {
        rectMap.set(rect.id, rect);
      }
    }
    
    const boxes: Box[] = [];
    let boxCounter = 0;
    
    for (const rectId of permutation) {
      const rect = rectMap.get(rectId);
      if (!rect) continue;
      
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
      algorithm: 'Rule-Based Neighborhood',
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

/**
 * Overlap Neighborhood for Bin Packing
 */
export class OverlapNeighborhood implements Neighborhood<PackingResult> {
  private overlapPercentage: number = 100;
  
  constructor(private boxSize: number, private maxIterations: number = 100) {}
  
  setIteration(iteration: number): void {
    this.overlapPercentage = Math.max(0, 100 * (1 - iteration / this.maxIterations));
  }
  
  getNeighbor(currentSolution: PackingResult): PackingResult {
    const boxes = JSON.parse(JSON.stringify(currentSolution.boxes)) as Box[];

    if (boxes.length === 0 || boxes.every(b => b.rectangles.length === 0)) {
      return { ...currentSolution, boxes };
    }

    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    const box = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * box.rectangles.length);
    const rect = box.rectangles[rectIndex];

    const newPosition = this.findPositionWithOverlap(box, rect);
    if (newPosition) {
      box.rectangles[rectIndex] = { ...rect, x: newPosition.x, y: newPosition.y };
    }

    const utilization = this.calculateUtilization(boxes);
    const penalty = this.calculateOverlapPenalty(boxes);

    return {
      ...currentSolution,
      boxes,
      utilization: utilization - penalty
    };
  }
  
  private findPositionWithOverlap(box: Box, rect: PlacedRectangle): { x: number; y: number } | null {
    const attempts = 20;
    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * (this.boxSize - rect.width * 0.5);
      const y = Math.random() * (this.boxSize - rect.height * 0.5);

      if (this.canPlaceWithOverlap(box, rect.width, rect.height, Math.max(0, x), Math.max(0, y))) {
        return { x: Math.max(0, x), y: Math.max(0, y) };
      }
    }
    return null;
  }
  
  private canPlaceWithOverlap(box: Box, width: number, height: number, x: number, y: number): boolean {
    if (x + width > this.boxSize || y + height > this.boxSize) {
      return false;
    }

    if (this.overlapPercentage < 100) {
      for (const otherRect of box.rectangles) {
        const overlapArea = this.calculateOverlapArea(
          { x, y, width, height },
          { x: otherRect.x, y: otherRect.y, width: otherRect.width, height: otherRect.height }
        );
        const maxRectArea = Math.max(width * height, otherRect.width * otherRect.height);
        const overlapPercentage = (overlapArea / maxRectArea) * 100;

        if (overlapPercentage > this.overlapPercentage) {
          return false;
        }
      }
    }

    return true;
  }
  
  private calculateOverlapArea(rect1: any, rect2: any): number {
    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (x2 <= x1 || y2 <= y1) return 0;
    return (x2 - x1) * (y2 - y1);
  }
  
  private calculateOverlapPenalty(boxes: Box[]): number {
    let totalPenalty = 0;
    for (const box of boxes) {
      for (let i = 0; i < box.rectangles.length; i++) {
        for (let j = i + 1; j < box.rectangles.length; j++) {
          const rect1 = box.rectangles[i];
          const rect2 = box.rectangles[j];
          const overlapArea = this.calculateOverlapArea(
            { x: rect1.x, y: rect1.y, width: rect1.width, height: rect1.height },
            { x: rect2.x, y: rect2.y, width: rect2.width, height: rect2.height }
          );
          totalPenalty += overlapArea;
        }
      }
    }
    return totalPenalty;
  }
  
  private calculateUtilization(boxes: Box[]): number {
    if (boxes.length === 0) return 0;
    const totalBoxArea = boxes.length * this.boxSize * this.boxSize;
    const usedArea = boxes.reduce((sum, box) => {
      return sum + box.rectangles.reduce((boxSum, rect) => boxSum + rect.width * rect.height, 0);
    }, 0);
    return (usedArea / totalBoxArea) * 100;
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
export class BinPackingSolver {
  private algorithm: GreedyAlgorithm<Rectangle, BinPackingSolution>;

  constructor(
    boxSize: number,
    criterion: GreedySelectionCriterion | LocalSearchCriterion = 'area'
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

/**
 * Bin Packing Local Search Solver using Generic Local Search Algorithm
 */
export class BinPackingLocalSearchSolver {
  private algorithm: GenericLocalSearchAlgorithm<Rectangle, PackingResult>;

  constructor(
    boxSize: number,
    neighborhoodType: LocalSearchCriterion = 'geometry'
  ) {
    let neighborhood: Neighborhood<PackingResult>;
    
    if (neighborhoodType === 'geometry') {
      neighborhood = new GeometryBasedNeighborhood(boxSize);
    } else if (neighborhoodType === 'rule') {
      neighborhood = new RuleBasedNeighborhood(boxSize);
    } else if (neighborhoodType === 'overlap') {
      neighborhood = new OverlapNeighborhood(boxSize);
    } else {
      throw new Error(`Unknown neighborhood type: ${neighborhoodType}`);
    }
    
    const objective = new BinPackingObjective();
    const acceptance = new SimulatedAnnealingAcceptance<PackingResult>();
    const initialSolution = new BinPackingInitialSolution(boxSize);
    
    this.algorithm = new GenericLocalSearchAlgorithm(
      neighborhood,
      objective,
      acceptance,
      initialSolution
    );
  }

  solve(rectangles: Rectangle[], maxIterations: number = 100): PackingResult {
    const result = this.algorithm.search(rectangles, maxIterations);
    
    return {
      ...result.solution,
      algorithm: `Generic Local Search (${result.solution.totalBoxes} boxes)`,
      executionTime: result.executionTime
    };
  }
}