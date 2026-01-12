import { Box } from "./box";
import type { GreedyState } from "./greedy";


export class PackingSolution implements GreedyState {

    readonly boxes: Box[];

    constructor(boxSize: number) {
        this.boxes = [new Box(boxSize)];
    }
    
    isComplete(): boolean {
        return false;
    }
}