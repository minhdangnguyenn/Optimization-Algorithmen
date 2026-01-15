import type { Rectangle } from "./rectangle";

export class Box {
  readonly id: number;
  readonly length: number;
  rectangles: Rectangle[];
  utilization: number;

  get area(): number {
    return this.length * this.length;
  }

  constructor(id: number, size: number) {
    this.id = id;
    this.length = size;
    this.rectangles = [];
    this.utilization = 0;
  }

  addRect(rectangle: Rectangle): void {
    this.rectangles.push(rectangle);
    const totalArea = this.rectangles.reduce((sum, rect) => sum + rect.area, 0);
    this.utilization = (totalArea / this.area) * 100;
  }

  isOverlapped(rect1: Rectangle, rect2: Rectangle): boolean {
    const { x: x1, y: y1 } = rect1.position;
    const { x: x2, y: y2 } = rect2.position;
    return !(
      x1! + rect1.width <= x2! ||
      x2! + rect2.width <= x1! ||
      y1! + rect1.height <= y2! ||
      y2! + rect2.height <= y1!
    );
  }
}
