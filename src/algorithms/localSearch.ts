import { Rectangle, PlacedRectangle, Box, PackingResult } from '../types';
import { GreedyPacker } from './greedyPacking';

export class LocalSearchPacker {
  private boxSize: number;
  private greedyPacker: GreedyPacker;
  
  constructor(boxSize: number) {
    this.boxSize = boxSize;
    this.greedyPacker = new GreedyPacker(boxSize);
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
    
    // Start with greedy solution
    let currentSolution = this.greedyPacker.pack(rectangles);
    
    // Check if greedy solution failed
    if (currentSolution.algorithm.includes('FAILED') || currentSolution.algorithm.includes('WARNING')) {
      const endTime = performance.now();
      return {
        ...currentSolution,
        algorithm: `Local Search (${currentSolution.algorithm})`,
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
    
    // Local search iterations
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const newSolution = this.performLocalSearch(currentSolution, rectangles);
      
      // Verify all rectangles are still placed after local search
      const totalPlacedInNew = newSolution.boxes.reduce((sum: number, box: Box) => sum + box.rectangles.length, 0);
      if (totalPlacedInNew !== rectangles.length) {
        continue; // Skip invalid solutions
      }
      
      if (newSolution.totalBoxes < bestSolution.totalBoxes || 
          (newSolution.totalBoxes === bestSolution.totalBoxes && newSolution.utilization > bestSolution.utilization)) {
        bestSolution = JSON.parse(JSON.stringify(newSolution));
        currentSolution = newSolution;
      } else {
        // Accept worse solutions with probability (simulated annealing approach)
        const temperature = 1.0 - (iteration / maxIterations);
        const probability = Math.exp(-(newSolution.totalBoxes - currentSolution.totalBoxes) / temperature);
        if (Math.random() < probability) {
          currentSolution = newSolution;
        }
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

  private performLocalSearch(solution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const operations = [
      () => this.swapRectangles(solution, rectangles),
      () => this.rotateRectangles(solution, rectangles),
      () => this.moveRectanglesToEmptySpaces(solution, rectangles),
      () => this.consolidateBoxes(solution, rectangles)
    ];

    // Randomly select and apply a local search operation
    const operation = operations[Math.floor(Math.random() * operations.length)];
    return operation();
  }

  private swapRectangles(solution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(solution.boxes)) as Box[];
    
    // Select two random rectangles from different boxes
    if (boxes.length < 2) return { ...solution, boxes };
    
    const box1Index = Math.floor(Math.random() * boxes.length);
    const box2Index = Math.floor(Math.random() * boxes.length);
    
    if (box1Index === box2Index || boxes[box1Index].rectangles.length === 0 || boxes[box2Index].rectangles.length === 0) {
      return { ...solution, boxes };
    }

    const rect1Index = Math.floor(Math.random() * boxes[box1Index].rectangles.length);
    const rect2Index = Math.floor(Math.random() * boxes[box2Index].rectangles.length);
    
    const rect1 = boxes[box1Index].rectangles[rect1Index];
    const rect2 = boxes[box2Index].rectangles[rect2Index];

    // Try swapping
    boxes[box1Index].rectangles.splice(rect1Index, 1);
    boxes[box2Index].rectangles.splice(rect2Index, 1);

    // Check if rectangles fit in swapped positions
    if (this.canFitInBox(boxes[box1Index], rect2) && this.canFitInBox(boxes[box2Index], rect1)) {
      const pos1 = this.findBestPosition(boxes[box1Index], rect2);
      const pos2 = this.findBestPosition(boxes[box2Index], rect1);
      
      if (pos1 && pos2) {
        boxes[box1Index].rectangles.push({ ...rect2, x: pos1.x, y: pos1.y, boxId: box1Index });
        boxes[box2Index].rectangles.push({ ...rect1, x: pos2.x, y: pos2.y, boxId: box2Index });
      } else {
        // Revert if can't place
        boxes[box1Index].rectangles.push(rect1);
        boxes[box2Index].rectangles.push(rect2);
      }
    } else {
      // Revert if can't fit
      boxes[box1Index].rectangles.push(rect1);
      boxes[box2Index].rectangles.push(rect2);
    }

    const utilization = this.calculateUtilization(boxes);
    return {
      ...solution,
      boxes,
      utilization
    };
  }

  private rotateRectangles(solution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(solution.boxes)) as Box[];
    
    // Select random box and rectangle to rotate
    if (boxes.length === 0) return { ...solution, boxes };
    
    const boxIndex = Math.floor(Math.random() * boxes.length);
    const box = boxes[boxIndex];
    
    if (box.rectangles.length === 0) return { ...solution, boxes };
    
    const rectIndex = Math.floor(Math.random() * box.rectangles.length);
    const rect = box.rectangles[rectIndex];
    
    // Try rotating the rectangle
    const rotatedRect = {
      ...rect,
      width: rect.height,
      height: rect.width,
      rotated: !rect.rotated
    };

    // Remove original rectangle
    box.rectangles.splice(rectIndex, 1);
    
    // Check if rotated rectangle fits
    if (this.canFitInBox(box, rotatedRect)) {
      const position = this.findBestPosition(box, rotatedRect);
      if (position) {
        box.rectangles.push({ ...rotatedRect, x: position.x, y: position.y });
      } else {
        box.rectangles.push(rect); // Revert
      }
    } else {
      box.rectangles.push(rect); // Revert
    }

    const utilization = this.calculateUtilization(boxes);
    return {
      ...solution,
      boxes,
      utilization
    };
  }

  private moveRectanglesToEmptySpaces(solution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(solution.boxes)) as Box[];
    
    // Find rectangles that could be moved to better utilize space
    for (const box of boxes) {
      const emptySpaces = this.findEmptySpaces(box);
      
      // Try to fill empty spaces with rectangles from other boxes
      for (const space of emptySpaces) {
        for (const otherBox of boxes) {
          if (otherBox.id === box.id) continue;
          
          for (let i = otherBox.rectangles.length - 1; i >= 0; i--) {
            const rect = otherBox.rectangles[i];
            
            if (rect.width <= space.width && rect.height <= space.height) {
              // Move rectangle to this space
              otherBox.rectangles.splice(i, 1);
              box.rectangles.push({
                ...rect,
                x: space.x,
                y: space.y,
                boxId: box.id
              });
              break;
            }
          }
        }
      }
    }

    // Remove empty boxes
    const nonEmptyBoxes = boxes.filter(box => box.rectangles.length > 0);
    
    const utilization = this.calculateUtilization(nonEmptyBoxes);
    return {
      ...solution,
      boxes: nonEmptyBoxes,
      totalBoxes: nonEmptyBoxes.length,
      utilization
    };
  }

  private consolidateBoxes(solution: PackingResult, rectangles: Rectangle[]): PackingResult {
    const boxes = JSON.parse(JSON.stringify(solution.boxes)) as Box[];
    
    // Try to merge rectangles from multiple boxes into fewer boxes
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const box1 = boxes[i];
        const box2 = boxes[j];
        
        // Try to fit all rectangles from box2 into box1
        const allRectangles = [...box1.rectangles, ...box2.rectangles];
        const tempBox: Box = {
          id: box1.id,
          width: this.boxSize,
          height: this.boxSize,
          rectangles: []
        };

        let allFit = true;
        for (const rect of allRectangles) {
          const position = this.findBestPosition(tempBox, rect);
          if (position) {
            tempBox.rectangles.push({ ...rect, x: position.x, y: position.y, boxId: tempBox.id });
          } else {
            allFit = false;
            break;
          }
        }

        if (allFit) {
          boxes[i] = tempBox;
          boxes.splice(j, 1);
          j--; // Adjust index after removal
        }
      }
    }

    const utilization = this.calculateUtilization(boxes);
    return {
      ...solution,
      boxes,
      totalBoxes: boxes.length,
      utilization
    };
  }

  private findEmptySpaces(box: Box): Array<{x: number, y: number, width: number, height: number}> {
    const spaces: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // Simple approach: find spaces between rectangles
    const occupiedAreas = box.rectangles.map(rect => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    }));

    // Check for spaces in a grid pattern
    const gridSize = 10;
    for (let x = 0; x < this.boxSize; x += gridSize) {
      for (let y = 0; y < this.boxSize; y += gridSize) {
        const maxWidth = this.boxSize - x;
        const maxHeight = this.boxSize - y;
        
        let actualWidth = maxWidth;
        let actualHeight = maxHeight;
        
        // Check if this space is occupied
        let occupied = false;
        for (const area of occupiedAreas) {
          if (this.rectanglesOverlap(
            { x, y, width: actualWidth, height: actualHeight },
            area
          )) {
            occupied = true;
            break;
          }
        }
        
        if (!occupied && actualWidth >= gridSize && actualHeight >= gridSize) {
          spaces.push({ x, y, width: actualWidth, height: actualHeight });
        }
      }
    }

    return spaces;
  }

  private canFitInBox(box: Box, rect: Rectangle): boolean {
    if (rect.width > this.boxSize || rect.height > this.boxSize) {
      return false;
    }

    // Check if there's space for this rectangle
    const position = this.findBestPosition(box, rect);
    return position !== null;
  }

  private findBestPosition(box: Box, rect: Rectangle): {x: number, y: number} | null {
    // Bottom-left fill strategy
    for (let y = 0; y <= this.boxSize - rect.height; y++) {
      for (let x = 0; x <= this.boxSize - rect.width; x++) {
        if (this.canPlaceAt(box, rect.width, rect.height, x, y)) {
          return { x, y };
        }
      }
    }
    return null;
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