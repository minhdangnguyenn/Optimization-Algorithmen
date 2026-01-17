import { Box } from "./box";
import type { State } from "../types/state";
import { Rectangle } from "./rectangle";

export class PackingSolution implements State {
    readonly boxes: Box[];

    constructor(boxSize: number) {
        this.boxes = [new Box(0, boxSize)];
    }

    isCompleted(): boolean {
        return false;
    }

    /**
     * Evaluate the solution. Higher score is better.
     * Returns negative number of boxes (to minimize boxes) plus utilization bonus.
     */
    evaluate(): number {
        // Primary goal: minimize number of boxes (so negative boxes = higher score)
        // Secondary goal: maximize utilization
        const boxPenalty = -this.boxes.length * 1000;
        const avgUtilization =
            this.boxes.reduce((sum, box) => sum + box.utilization, 0) /
            Math.max(1, this.boxes.length);

        // Return score where fewer boxes and higher utilization is better
        return boxPenalty + avgUtilization;
    }

    copySolution(): PackingSolution {
        const newSolution = new PackingSolution(this.boxes[0].length);

        newSolution.boxes.length = 0;

        for (const box of this.boxes) {
            const b = new Box(box.id, box.length);
            for (const r of box.rectangles) {
                b.addRect(r.copy());
            }
            newSolution.boxes.push(b);
        }

        return newSolution;
    }
}
