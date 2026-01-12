import type { GreedyElement } from "./greedy";

export class Rectangle implements GreedyElement {

    readonly width: number;
    readonly height: number;

    // Position within the box
    private x: number | null = null;
    private y: number | null = null;
    rotated: boolean = false;
    
    get position() {
        return { x: this.x , y: this.y };
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    get area(): number {
        return this.width * this.height;
    }
    
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }


    rotate(): Rectangle {
        const rotatedRect = new Rectangle(this.height, this.width);
        rotatedRect.rotated = !this.rotated;
        return rotatedRect;
    }
}