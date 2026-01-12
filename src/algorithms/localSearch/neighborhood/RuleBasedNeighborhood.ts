import { Box, PackingResult, Rectangle } from "../../../types";
import { Neighborhood } from "../../../types";

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
