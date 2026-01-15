import { Box } from "../box";
import { Rectangle } from "../rectangle";
import { State } from ".";

export class PackingState implements State {
  constructor(
    private boxes: Box[],
    private _packedRectangles: Rectangle[],
    private rectangles: Rectangle[],
  ) {
    this.boxes = boxes;
    this._packedRectangles = _packedRectangles;
    this.rectangles = rectangles;
  }

  get packedRectangles(): Rectangle[] {
    return this._packedRectangles;
  }

  isCompleted(): boolean {
    return this.rectangles.length === this.packedRectangles.length;
  }

  computeUtilization(): number {
    // use reduce here because in case there are more than a box
    // => calculate the total area of all boxes
    const usedArea = this.packedRectangles.reduce(
      (sum, r) => sum + r.width * r.height,
      0,
    );

    const boxArea = this.boxes.reduce((sum, b) => sum + b.length * b.length, 0);

    return usedArea / boxArea;
  }

  evaluate(): number {
    return this.computeUtilization(); // higher is better
  }
}
