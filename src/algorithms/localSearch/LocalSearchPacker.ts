// import { Rectangle, PackingResult } from "../../types";
// import {
//   BinPackingSolver,
//   AreaBasedSelection,
//   HeightBasedSelection,
// } from "../binPackingProblem";
// import { SelectionStrategy } from "./LocalSearchAlgorithm";

// /**
//  * Legacy LocalSearch class - now uses generic algorithm implementation
//  *
//  * This class maintains the same interface but now delegates to the generic
//  * greedy algorithm implementation, demonstrating proper separation of concerns.
//  * 
//  * This class use FFD based on Area by default
//  */
// export class LocalSearchPacker {
//   private solver: BinPackingSolver;

//   constructor(boxSize: number) {
//     // Use Geometry based by default
//     this.solver = new BinPackingSolver(boxSize, new AreaBasedSelection(), 'area');
//   }

//   pack(rectangles: Rectangle[]): PackingResult {
//     return this.solver.solve(rectangles);
//   }
// }

// export class HeightBasedGreedyPacker {
//   private solver: BinPackingSolver;

//   // passing another criteria in constructor, using height based instead of area 
//   constructor(boxSize: number) {
//     this.solver = new BinPackingSolver(boxSize, new HeightBasedSelection(), 'height');
//   }

//   pack(rectangles: Rectangle[]): PackingResult {
//     return this.solver.solve(rectangles);
//   }
// }

// export class PartiallyOverlapPacker {
//     private solver: BinPackingSolver;

//     // passing another criteria in constructor, using height based instead of area 
//     constructor(boxSize: number) {
//         this.solver = new BinPackingSolver(boxSize, new HeightBasedSelection(), 'height');
//     }

//     pack(rectangles: Rectangle[]): PackingResult {
//         return this.solver.solve(rectangles);
//     }
// }

// /**
//  * Geometry-Based Neighborhood
//  * Moves rectangles within a box or between boxes, modifying positions geometrically.
//  * This operates on valid solutions and modifies coordinates directly.
//  * 
//  * Three equally-likely operations (each ~33%):
//  * 1. Move within box - adjust position of a rectangle in its current box
//  * 2. Move between boxes - transfer a rectangle from one box to another
//  * 3. Swap between boxes - swap rectangles between two different boxes
//  */
// export class GeometryBasedNeighborhood implements SelectionStrategy {
//   constructor(private boxSize: number) {}

//   getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult {
//     const boxes = JSON.parse(JSON.stringify(currentSolution.boxes)) as Box[];
    
//     // Randomly choose one of three operations with equal probability (33% each)
//     const operation = Math.random();
    
//     if (operation < 0.33) {
//       // Operation 1: Move within box - adjust position of a rectangle within its current box
//       return this.moveWithinBox(boxes, currentSolution);
//     } else if (operation < 0.66) {
//       // Operation 2: Move between boxes - transfer rectangle from one box to another
//       return this.moveBetweenBoxes(boxes, currentSolution);
//     } else {
//       // Operation 3: Swap between boxes - exchange rectangles between two boxes
//       return this.swapBetweenBoxes(boxes, currentSolution);
//     }
//   }

//   private moveWithinBox(boxes: Box[], solution: PackingResult): PackingResult {
//     if (boxes.length === 0 || boxes.every(b => b.rectangles.length === 0)) {
//       return { ...solution, boxes };
//     }

//     // Select random box with rectangles
//     const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
//     const box = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
//     const rectIndex = Math.floor(Math.random() * box.rectangles.length);
//     const rect = box.rectangles[rectIndex];

//     // Try to move to a nearby new position within the same box
//     const newPosition = this.findNearbyPosition(box, rect);
//     if (newPosition) {
//       box.rectangles[rectIndex] = { ...rect, x: newPosition.x, y: newPosition.y };
//     }

//     const utilization = this.calculateUtilization(boxes);
//     return { ...solution, boxes, utilization };
//   }

//   private moveBetweenBoxes(boxes: Box[], solution: PackingResult): PackingResult {
//     if (boxes.length < 2) return { ...solution, boxes };

//     // Select a rectangle from a non-empty box
//     const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
//     if (nonEmptyBoxes.length === 0) return { ...solution, boxes };

//     const sourceBox = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
//     const rectIndex = Math.floor(Math.random() * sourceBox.rectangles.length);
//     const rect = sourceBox.rectangles[rectIndex];

//     // Preferentially move rectangles from sparsely-populated boxes
//     const targetBoxes = boxes.filter(b => b.id !== sourceBox.id);
    
//     // Try to place in a different box
//     for (let i = 0; i < 3; i++) {
//       const targetBox = targetBoxes[Math.floor(Math.random() * targetBoxes.length)];

//       const position = this.findBestPosition(targetBox, rect);
//       if (position) {
//         sourceBox.rectangles.splice(rectIndex, 1);
//         targetBox.rectangles.push({ ...rect, x: position.x, y: position.y, boxId: targetBox.id });

//         // Remove empty boxes - heuristic: prefer emptying sparse boxes
//         const nonEmptyBoxesResult = boxes.filter(b => b.rectangles.length > 0);
//         const utilization = this.calculateUtilization(nonEmptyBoxesResult);
//         return { ...solution, boxes: nonEmptyBoxesResult, totalBoxes: nonEmptyBoxesResult.length, utilization };
//       }
//     }

//     const utilization = this.calculateUtilization(boxes);
//     return { ...solution, boxes, utilization };
//   }

//   private swapBetweenBoxes(boxes: Box[], solution: PackingResult): PackingResult {
//     if (boxes.length < 2) return { ...solution, boxes };

//     const nonEmptyBoxes = boxes.filter(b => b.rectangles.length > 0);
//     if (nonEmptyBoxes.length < 2) return { ...solution, boxes };

//     const box1 = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
//     const box2 = nonEmptyBoxes[Math.floor(Math.random() * nonEmptyBoxes.length)];
    
//     if (box1.id === box2.id) return { ...solution, boxes };

//     const idx1 = Math.floor(Math.random() * box1.rectangles.length);
//     const idx2 = Math.floor(Math.random() * box2.rectangles.length);

//     const rect1 = box1.rectangles[idx1];
//     const rect2 = box2.rectangles[idx2];

//     // Try to swap positions
//     box1.rectangles.splice(idx1, 1);
//     box2.rectangles.splice(idx2, 1);

//     if (this.canPlaceAt(box1, rect2.width, rect2.height, rect2.x, rect2.y) &&
//         this.canPlaceAt(box2, rect1.width, rect1.height, rect1.x, rect1.y)) {
//       box1.rectangles.push({ ...rect2, x: rect2.x, y: rect2.y, boxId: box1.id });
//       box2.rectangles.push({ ...rect1, x: rect1.x, y: rect1.y, boxId: box2.id });
//     } else {
//       box1.rectangles.push(rect1);
//       box2.rectangles.push(rect2);
//     }

//     const utilization = this.calculateUtilization(boxes);
//     return { ...solution, boxes, utilization };
//   }

//   private findNearbyPosition(box: Box, rect: Rectangle | PlacedRectangle): { x: number; y: number } | null {
//     // Find a nearby position by small random offsets
//     const attempts = 15;
//     for (let i = 0; i < attempts; i++) {
//       const offsetX = (Math.random() - 0.5) * this.boxSize * 0.3;
//       const offsetY = (Math.random() - 0.5) * this.boxSize * 0.3;
//       const x = Math.max(0, Math.min(this.boxSize - rect.width, (rect as any).x + offsetX));
//       const y = Math.max(0, Math.min(this.boxSize - rect.height, (rect as any).y + offsetY));

//       if (this.canPlaceAt(box, rect.width, rect.height, x, y, rect as PlacedRectangle)) {
//         return { x, y };
//       }
//     }
//     return null;
//   }

//   private findBestPosition(box: Box, rect: Rectangle | PlacedRectangle): { x: number; y: number } | null {
//     for (let y = 0; y <= this.boxSize - rect.height; y += 5) {
//       for (let x = 0; x <= this.boxSize - rect.width; x += 5) {
//         if (this.canPlaceAt(box, rect.width, rect.height, x, y)) {
//           return { x, y };
//         }
//       }
//     }
//     return null;
//   }

//   private canPlaceAt(box: Box, width: number, height: number, x: number, y: number, excludeRect?: PlacedRectangle): boolean {
//     if (x + width > this.boxSize || y + height > this.boxSize || x < 0 || y < 0) {
//       return false;
//     }

//     for (const rect of box.rectangles) {
//       if (excludeRect && rect.id === excludeRect.id) continue;

//       if (!(x + width <= rect.x || rect.x + rect.width <= x || y + height <= rect.y || rect.y + rect.height <= y)) {
//         return false;
//       }
//     }
//     return true;
//   }

//   private calculateUtilization(boxes: Box[]): number {
//     if (boxes.length === 0) return 0;
//     const totalBoxArea = boxes.length * this.boxSize * this.boxSize;
//     const usedArea = boxes.reduce((sum, box) => {
//       return sum + box.rectangles.reduce((boxSum, rect) => boxSum + rect.width * rect.height, 0);
//     }, 0);
//     return (usedArea / totalBoxArea) * 100;
//   }
// }
