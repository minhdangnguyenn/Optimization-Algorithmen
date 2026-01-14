import type { GreedyExtender } from ".";
import { Box } from "../box";
import type { Rectangle } from "../rectangle";
import type { PackingSolution } from "../solution";
import type { PackingStrategy } from "./packing";

export class FirstFitPlacer implements GreedyExtender<
  Rectangle,
  PackingSolution
> {
  private boxSize: number;
  private packingStrategy: PackingStrategy;

  constructor(boxSize: number, packingStrategy: PackingStrategy) {
    this.boxSize = boxSize;
    this.packingStrategy = packingStrategy;
  }

  extend(solution: PackingSolution, rectangle: Rectangle): PackingSolution {
    // Try to put boxes of the solution into a rectangle
    for (const box of solution.boxes) {
      if (this.packingStrategy.tryPut(rectangle, box)) {
        return solution;
      }
    }

    // Creating new box
    const newBox = new Box(this.boxSize);
    rectangle.setPosition(0, 0);
    newBox.addRect(rectangle);
    solution.boxes.push(newBox);

    return solution;
  }
}
