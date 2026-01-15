import type { Extender } from "../types/extender";
import { Box } from "./box";
import type { Rectangle } from "./rectangle";
import type { PackingSolution } from "./solution";
import type { PackingStrategy } from "../types/strategy/packingStrategy";

/**
 * decide in which bx should the rectangle be put
 * @param Rectangle try to extend with this rectangle
 * @param PackingSolution the current solution to pack this rectangle
 */
export class FirstFitPlacer implements Extender<Rectangle, PackingSolution> {
  private boxSize: number;
  private packingStrategy: PackingStrategy;

  constructor(boxSize: number, packingStrategy: PackingStrategy) {
    this.boxSize = boxSize;
    this.packingStrategy = packingStrategy;
  }

  /**
   * Extend the current solution to for the next rectangle
   * @param solution current solution
   * @param rectangle the next rectangle
   * @returns
   */
  extend(solution: PackingSolution, rectangle: Rectangle): PackingSolution {
    // try to put a rectangle into a box by iterating boxes
    // if it is able, stop the extend process
    for (const box of solution.boxes) {
      if (this.packingStrategy.tryPut(rectangle, box)) {
        return solution;
      }
    }

    // if can not put the rectangle into any boxes
    // means that all of boxes are full
    // then create a new box for rectangle
    const newBoxID = solution.boxes.length + 1;
    const newBox = new Box(newBoxID, this.boxSize);
    rectangle.setPosition(0, 0);
    newBox.addRect(rectangle);
    solution.boxes.push(newBox);

    return solution;
  }
}
