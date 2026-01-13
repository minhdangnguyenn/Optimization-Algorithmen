import type { GreedyExtender } from ".";
import { Box } from "../box";
import type { Rectangle } from "../rectangle";
import type { PackingSolution } from "../solution";
import type { PuttingStrategy } from "./putting";

export class FirstFitPlacer implements GreedyExtender<Rectangle, PackingSolution> {
    private boxSize: number;
    private puttingStrategy: PuttingStrategy;

    constructor(boxSize: number, puttingStrategy: PuttingStrategy) {
        this.boxSize = boxSize;
        this.puttingStrategy = puttingStrategy;
    }

    extend(
        solution: PackingSolution,
        rectangle: Rectangle
    ): PackingSolution {
        // Try to put boxes of the solution into a rectangle
        for (const box of solution.boxes) {
            if (this.puttingStrategy.tryPut(rectangle, box)) {
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