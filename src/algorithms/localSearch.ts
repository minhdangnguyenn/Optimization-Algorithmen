import { Rectangle, PlacedRectangle, Box, PackingResult } from '../types';

/**
 * Neighborhood interface for local search
 */
export interface Neighborhood {
  /**
   * Generates a neighbor solution from the current solution
   */
  getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult;
}

/**
 * Geometry-Based Neighborhood
 * Moves rectangles within a box or between boxes, modifying positions geometrically.
 * This operates on valid solutions and modifies coordinates directly.
 * 
 * Three equally-likely operations (each ~33%):
 * 1. Move within box - adjust position of a rectangle in its current box
 * 2. Move between boxes - transfer a rectangle from one box to another
 * 3. Swap between boxes - swap rectangles between two different boxes
 */
export class GeometryBasedNeighborhood implements Neighborhood {
  constructor(private boxSize: number) {}

  getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(currentSolution.boxes)) as Box[];
    
    // Randomly choose one of three operations with equal probability (33% each)
    const operation = Math.random();
    
    if (operation < 0.33) {
      // Operation 1: Move within box - adjust position of a rectangle within its current box
      return this.moveWithinBox(boxes, currentSolution);
    } else if (operation < 0.66) {
      // Operation 2: Move between boxes - transfer rectangle from one box to another
      return this.moveBetweenBoxes(boxes, currentSolution);
    } else {
      // Operation 3: Swap between boxes - exchange rectangles between two boxes
      return this.swapBetweenBoxes(boxes, currentSolution);
    }
  }

  private moveWithinBox(boxes: Box[], solution: PackingResult): PackingResult {
    if (boxes.length === 0 || boxes.every(b => b.rectangles.length === 0)) {
      return { ...solution, boxes };
    }

    // Select random box with rectangles
    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    const box = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * box.rectangles.length);
    const rect = box.rectangles[rectIndex];

    // Try to move to a nearby new position within the same box
    const newPosition = this.findNearbyPosition(box, rect);
    if (newPosition) {
      box.rectangles[rectIndex] = { ...rect, x: newPosition.x, y: newPosition.y };
    }

    const utilization = this.calculateUtilization(boxes);
    return { ...solution, boxes, utilization };
  }

  private moveBetweenBoxes(boxes: Box[], solution: PackingResult): PackingResult {
    if (boxes.length < 2) return { ...solution, boxes };

    // Select a rectangle from a non-empty box
    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    if (nonEmptyBoxes.length === 0) return { ...solution, boxes };

    const sourceBox = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * sourceBox.rectangles.length);
    const rect = sourceBox.rectangles[rectIndex];

    // Preferentially move rectangles from sparsely-populated boxes
    const targetBoxes = boxes.filter(b => b.id !== sourceBox.id);
    
    // Try to place in a different box
    for (let i = 0; i < 3; i++) {
      const targetBox = targetBoxes[Math.floor(Math.random() * targetBoxes.length)];

      const position = this.findBestPosition(targetBox, rect);
      if (position) {
        sourceBox.rectangles.splice(rectIndex, 1);
        targetBox.rectangles.push({ ...rect, x: position.x, y: position.y, boxId: targetBox.id });

        // Remove empty boxes - heuristic: prefer emptying sparse boxes
        const nonEmptyBoxesResult = boxes.filter(b => b.rectangles.length > 0);
        const utilization = this.calculateUtilization(nonEmptyBoxesResult);
        return { ...solution, boxes: nonEmptyBoxesResult, totalBoxes: nonEmptyBoxesResult.length, utilization };
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

    // Try to swap positions
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

  private findNearbyPosition(box: Box, rect: Rectangle | PlacedRectangle): { x: number; y: number } | null {
    // Find a nearby position by small random offsets
    const attempts = 15;
    for (let i = 0; i < attempts; i++) {
      const offsetX = (Math.random() - 0.5) * this.boxSize * 0.3;
      const offsetY = (Math.random() - 0.5) * this.boxSize * 0.3;
      const x = Math.max(0, Math.min(this.boxSize - rect.width, (rect as any).x + offsetX));
      const y = Math.max(0, Math.min(this.boxSize - rect.height, (rect as any).y + offsetY));

      if (this.canPlaceAt(box, rect.width, rect.height, x, y, rect as PlacedRectangle)) {
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
}

/**
 * Rule-Based Neighborhood
 * Works on permutations of rectangles using the same principle as the greedy algorithm.
 * Modifies the order/permutation of rectangles and re-packs using greedy placement.
 */
export class RuleBasedNeighborhood implements Neighborhood {
  private lastPermutation: number[] = []; // IDs of rectangles in current order

  constructor(private boxSize: number) {}

  getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult {
    // Extract current rectangle order from solution
    let currentPermutation = this.extractPermutation(currentSolution);
    
    // If first time, initialize from rectangles array
    if (currentPermutation.length === 0) {
      currentPermutation = rectangles.map((_, i) => i);
    }

    // Apply small modification to permutation - move rectangles from sparse boxes earlier
    const newPermutation = this.modifyPermutation(currentPermutation, currentSolution);
    
    // Rebuild solution by placing rectangles in new order
    return this.rebuildFromPermutation(newPermutation, rectangles);
  }

  private extractPermutation(solution: PackingResult): number[] {
    const permutation: number[] = [];
    for (const box of solution.boxes) {
      for (const rect of box.rectangles) {
        permutation.push(rect.id);
      }
    }
    return permutation;
  }

  private modifyPermutation(permutation: number[], solution: PackingResult): number[] {
    const newPerm = [...permutation];
    
    // Heuristic: Move rectangles from sparse boxes earlier in the permutation
    // This gives them priority in the greedy placement
    const boxOccupancy = new Map<number, number>();
    for (const box of solution.boxes) {
      boxOccupancy.set(box.id, box.rectangles.length);
    }

    // Find rectangles in sparse boxes
    const sparseBoxRectIds: number[] = [];
    for (const box of solution.boxes) {
      if (box.rectangles.length < 3) { // Consider sparse if < 3 rectangles
        sparseBoxRectIds.push(...box.rectangles.map(r => r.id));
      }
    }

    // Move some of these to earlier in the permutation (different placement strategy)
    if (sparseBoxRectIds.length > 0) {
      const rectToMove = sparseBoxRectIds[Math.floor(Math.random() * sparseBoxRectIds.length)];
      const currentIndex = newPerm.indexOf(rectToMove);
      if (currentIndex !== -1) {
        // Remove and reinsert at earlier position
        newPerm.splice(currentIndex, 1);
        const newIndex = Math.max(0, currentIndex - Math.floor(Math.random() * 5) - 1);
        newPerm.splice(newIndex, 0, rectToMove);
      }
    }

    // Also apply random swap or move
    const operation = Math.random();
    if (operation < 0.5 && newPerm.length > 1) {
      // Swap two random elements
      const i = Math.floor(Math.random() * newPerm.length);
      const j = Math.floor(Math.random() * newPerm.length);
      [newPerm[i], newPerm[j]] = [newPerm[j], newPerm[i]];
    } else if (newPerm.length > 2) {
      // Move element to different position
      const i = Math.floor(Math.random() * newPerm.length);
      const j = Math.floor(Math.random() * newPerm.length);
      if (i !== j) {
        const elem = newPerm.splice(i, 1)[0];
        newPerm.splice(j, 0, elem);
      }
    }

    return newPerm;
  }

  private rebuildFromPermutation(permutation: number[], rectangles: Rectangle[]): PackingResult {
    const boxes: Box[] = [];
    let boxCounter = 0;

    // Map rectangle IDs to rectangles
    const rectMap = new Map<number, Rectangle>();
    for (const rect of rectangles) {
      rectMap.set(rect.id, rect);
    }

    // Place rectangles in permutation order using greedy strategy
    for (const rectId of permutation) {
      const rect = rectMap.get(rectId);
      if (!rect) continue;

      const placed = this.placeRectangle(boxes, rect, boxCounter);
      if (!placed) {
        // Create new box
        const newBox: Box = {
          id: boxCounter++,
          width: this.boxSize,
          height: this.boxSize,
          rectangles: []
        };
        this.placeRectangle([newBox], rect, boxCounter);
        boxes.push(newBox);
      }
    }

    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    const utilization = this.calculateUtilization(nonEmptyBoxes);

    return {
      boxes: nonEmptyBoxes,
      totalBoxes: nonEmptyBoxes.length,
      utilization,
      algorithm: 'Rule-Based Neighborhood',
      executionTime: 0
    };
  }

  private placeRectangle(boxes: Box[], rect: Rectangle, nextBoxId: number): boolean {
    // Try to place in existing boxes, prioritizing boxes with fewer items
    const sorted = [...boxes].sort((a, b) => a.rectangles.length - b.rectangles.length);
    
    for (const box of sorted) {
      const position = this.findBestPosition(box, rect);
      if (position) {
        box.rectangles.push({
          ...rect,
          x: position.x,
          y: position.y,
          boxId: box.id
        });
        return true;
      }
    }
    return false;
  }

  private findBestPosition(box: Box, rect: Rectangle): { x: number; y: number } | null {
    // Try to place with first-fit decreasing strategy
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
}

/**
 * Overlap Neighborhood
 * Allows partial overlaps initially, gradually tightening the constraint
 */
export class OverlapNeighborhood implements Neighborhood {
  private overlapPercentage: number = 100; // Start at 100%

  constructor(private boxSize: number, private maxIterations: number = 100) {}

  setIteration(iteration: number): void {
    // Gradually reduce overlap percentage from 100 to 0
    this.overlapPercentage = Math.max(0, 100 * (1 - iteration / this.maxIterations));
  }

  getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(currentSolution.boxes)) as Box[];

    if (boxes.length === 0 || boxes.every(b => b.rectangles.length === 0)) {
      return { ...currentSolution, boxes };
    }

    // Select random box with rectangles
    const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
    const box = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    const rectIndex = Math.floor(Math.random() * box.rectangles.length);
    const rect = box.rectangles[rectIndex];

    // Find position allowing overlaps
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

  private findPositionWithOverlap(box: Box, rect: Rectangle | PlacedRectangle): { x: number; y: number } | null {
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
    // Strict bounds checking
    if (x + width > this.boxSize || y + height > this.boxSize) {
      return false;
    }

    if (this.overlapPercentage < 100) {
      // Check overlap constraints
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

export class LocalSearchPacker {
  private boxSize: number;
  private neighborhoods: Neighborhood[];
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

  /**
   * Set the early stopping threshold
   * @param threshold Fraction of maxIterations after which to stop if no improvement (e.g., 0.2 = 20%)
   */
  setEarlyStoppingThreshold(threshold: number): void {
    this.earlyStoppingThreshold = Math.max(0.05, Math.min(1, threshold)); // Clamp between 5% and 100%
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
    // Sort rectangles by area (descending) for better initial packing
    const sorted = [...rectangles].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    const boxes: Box[] = [];
    let boxCounter = 0;

    for (const rect of sorted) {
      // Try to place in existing boxes
      let placed = false;
      
      // Sort boxes by occupancy (ascending) - prefer less filled boxes
      const sortedBoxes = [...boxes].sort((a, b) => a.rectangles.length - b.rectangles.length);
      
      for (const box of sortedBoxes) {
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

      // If not placed in any existing box, create a new one
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
        } else {
          // Rectangle cannot fit even in an empty box
          return { boxes: [], totalBoxes: 0, utilization: 0, algorithm: 'Failed', executionTime: 0 };
        }
      }
    }

    const utilization = this.calculateUtilization(boxes);
    return {
      boxes,
      totalBoxes: boxes.length,
      utilization,
      algorithm: 'Initial Solution',
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

    // Update overlap neighborhood iteration
    const overlapNeighborhood = this.neighborhoods.find(n => n instanceof OverlapNeighborhood) as OverlapNeighborhood;
    if (overlapNeighborhood) {
      overlapNeighborhood.setIteration(iteration);
    }

    // Randomly select a neighborhood
    const neighborhood = this.neighborhoods[Math.floor(Math.random() * this.neighborhoods.length)];
    return neighborhood.getNeighbor(solution, rectangles);
  }
}