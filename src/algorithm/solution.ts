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
