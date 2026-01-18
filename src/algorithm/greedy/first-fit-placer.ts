import type { Extender } from "../../types/extender";
import { Box } from "../box";
import type { Rectangle } from "../rectangle";
import type { PackingSolution } from "../solution";
import type { PackingStrategy } from "../../types/packing-strategy";

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
            const position = this.packingStrategy.tryPut(rectangle, box);
            if (position) {
                // Place the rectangle at the returned position
                // Handle rotation if needed
                if (position.rotated && !rectangle.rotated) {
                    // Rotate the rectangle dimensions (swap width and height)
                    const tempWidth = rectangle.width;
                    rectangle.width = rectangle.height;
                    rectangle.height = tempWidth;
                    rectangle.rotated = true;
                }
                rectangle.setPosition(position.x, position.y);
                box.addRect(rectangle);
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
