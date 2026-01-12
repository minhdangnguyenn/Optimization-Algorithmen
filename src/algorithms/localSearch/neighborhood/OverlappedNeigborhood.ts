import { Box, PackingResult, PlacedRectangle, Rectangle } from "../../../types";
import { Neighborhood } from "../LocalSearchAlgorithm";

/**
 * Overlap Neighborhood
* Allows partial overlaps initially, gradually tightening the constraint
 */
export class OverlapNeighborhood implements Neighborhood<PackingResult> {
  private overlapPercentage: number = 100; // Start at 100%
  private rectangles: Rectangle[] = [];

  constructor(private boxSize: number, private maxIterations: number = 100) {}

  setRectangles(rectangles: Rectangle[]): void {
    this.rectangles = rectangles;
  }

  setIteration(iteration: number): void {
    // Gradually reduce overlap percentage from 100 to 0
    this.overlapPercentage = Math.max(0, 100 * (1 - iteration / this.maxIterations));
  }

  getNeighbor(currentSolution: PackingResult): PackingResult {
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