import { Candidate } from "../types/candidate";

export class Rectangle implements Candidate {
  // Position within the box
  private x: number | null = null;
  private y: number | null = null;
  rotated: boolean = false;

  constructor(
    public readonly id: number,
    public readonly width: number,
    public readonly height: number,
  ) {
    this.id = id;
    this.width = width;
    this.height = height;
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get area(): number {
    return this.width * this.height;
  }

  rotate(): Rectangle {
    const rotatedRect = new Rectangle(this.id, this.height, this.width);
    rotatedRect.rotated = !this.rotated;
    return rotatedRect;
  }
}
