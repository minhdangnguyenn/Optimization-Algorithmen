import { Rectangle, PlacedRectangle, Box, PackingResult, Point } from '../types';

export class GreedyPacker {
  private boxSize: number;
  
  constructor(boxSize: number) {
    this.boxSize = boxSize;
  }

  pack(rectangles: Rectangle[]): PackingResult {
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
        algorithm: `Greedy (FAILED: ${unpackableRectangles.length} rectangles too large for box size ${this.boxSize})`,
        executionTime: endTime - startTime
      };
    }
    
    // Sort rectangles by area in descending order (First Fit Decreasing)
    const sortedRectangles = [...rectangles].sort((a, b) => {
      const areaA = a.width * a.height;
      const areaB = b.width * b.height;
      return areaB - areaA;
    });

    const boxes: Box[] = [];
    const unplacedRectangles: Rectangle[] = [];

    for (const rect of sortedRectangles) {
      let placed = false;

      // Try to place in existing boxes
      for (const box of boxes) {
        const result = this.findBestPosition(box, rect);
        if (result) {
          const placedRect: PlacedRectangle = {
            ...rect,
            width: result.width,
            height: result.height,
            rotated: result.rotated,
            x: result.x,
            y: result.y,
            boxId: box.id
          };
          box.rectangles.push(placedRect);
          placed = true;
          break;
        }
      }

      // If not placed, create new box
      if (!placed) {
        const newBox: Box = {
          id: boxes.length,
          width: this.boxSize,
          height: this.boxSize,
          rectangles: []
        };

        const result = this.findBestPosition(newBox, rect);
        if (result) {
          const placedRect: PlacedRectangle = {
            ...rect,
            width: result.width,
            height: result.height,
            rotated: result.rotated,
            x: result.x,
            y: result.y,
            boxId: newBox.id
          };
          newBox.rectangles.push(placedRect);
          boxes.push(newBox);
          placed = true;
        } else {
          // This should never happen if we checked sizes correctly
          unplacedRectangles.push(rect);
        }
      }
    }

    const endTime = performance.now();
    const utilization = this.calculateUtilization(boxes);

    // Verify all rectangles were placed
    const totalPlacedRectangles = boxes.reduce((sum, box) => sum + box.rectangles.length, 0);
    const algorithmName = unplacedRectangles.length > 0 
      ? `Greedy (WARNING: ${unplacedRectangles.length} rectangles not placed)`
      : `Greedy (${totalPlacedRectangles}/${rectangles.length} rectangles placed)`;

    return {
      boxes,
      totalBoxes: boxes.length,
      utilization,
      algorithm: algorithmName,
      executionTime: endTime - startTime
    };
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

  private calculateUtilization(boxes: Box[]): number {
    if (boxes.length === 0) return 0;

    const totalBoxArea = boxes.length * this.boxSize * this.boxSize;
    const usedArea = boxes.reduce((sum, box) => {
      return sum + box.rectangles.reduce((boxSum, rect) => {
        return boxSum + rect.width * rect.height;
      }, 0);
    }, 0);

    return (usedArea / totalBoxArea) * 100;
  }
}