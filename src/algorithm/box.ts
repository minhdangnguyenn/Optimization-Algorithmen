import type { Rectangle } from "./rectangle";

export class Box {
    readonly id: number;
    readonly length: number;
    rectangles: Rectangle[];
    utilization: number;

    get area(): number {
        return this.length * this.length;
    }

    constructor(id: number, length: number) {
        this.id = id;
        this.length = length;
        this.rectangles = [];
        this.utilization = 0;
    }

    addRect(rectangle: Rectangle): void {
        this.rectangles.push(rectangle);
        const totalArea = this.rectangles.reduce(
            (sum, rect) => sum + rect.area,
            0,
        );
        this.utilization = (totalArea / this.area) * 100;
    }

    removeRect(rectangle: Rectangle): void {
        const index = this.rectangles.indexOf(rectangle);
        if (index !== -1) {
            this.rectangles.splice(index, 1);

            // recompute utilization after removing rectangle
            const totalArea = this.rectangles.reduce(
                (sum, rect) => sum + rect.area,
                0,
            );
            this.utilization = (totalArea / this.area) * 100;
        }
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

    canPlace(rect: Rectangle): boolean {
        // 1. Check boundaries
        if (
            rect.position.x < 0 ||
            rect.position.y < 0 ||
            rect.position.x + rect.width > this.length ||
            rect.position.y + rect.height > this.length
        ) {
            return false;
        }

        // 2. Check overlaps
        for (const other of this.rectangles) {
            if (other.id !== rect.id && this.isOverlapped(rect, other)) {
                return false;
            }
        }

        return true;
    }
}
