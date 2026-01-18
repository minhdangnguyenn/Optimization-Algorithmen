import { PackingSolution } from "../solution";
import { Rectangle } from "../rectangle";
import { Box } from "../box";

/**
 * Creates a deliberately bad initial solution for local search.
 * Places each rectangle in its own box to maximize the number of boxes.
 */
export function createBadInitialSolution(
    rectangles: readonly Rectangle[],
    boxSize: number,
): PackingSolution {
    const solution = new PackingSolution(boxSize);
    solution.boxes.length = 0; // Clear the initial box

    // Place each rectangle in its own box
    rectangles.forEach((rect, index) => {
        const box = new Box(index, boxSize);
        const rectCopy = rect.copy();
        rectCopy.setPosition(0, 0);
        box.addRect(rectCopy);
        solution.boxes.push(box);
    });

    return solution;
}
