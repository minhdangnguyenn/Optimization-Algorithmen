import { Box } from "./box";
import type { State } from "./state";

export class PackingSolution implements State {
  readonly boxes: Box[];

  constructor(boxSize: number) {
    this.boxes = [new Box(0, boxSize)];
  }

  isCompleted(): boolean {
    return false;
  }
}
