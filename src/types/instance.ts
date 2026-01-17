import { Rectangle } from "../algorithm";

export interface InstanceParams {
    numRectangles: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    boxLength: number;
}

export class InstanceGenerator {
    generate(params: InstanceParams) {
        const rectangles: Rectangle[] = [];

        for (let i = 0; i < params.numRectangles; i++) {
            const width =
                Math.floor(
                    Math.random() * (params.maxWidth - params.minWidth + 1),
                ) + params.minWidth;
            const height =
                Math.floor(
                    Math.random() * (params.maxHeight - params.minHeight + 1),
                ) + params.minHeight;

            rectangles.push(new Rectangle(i, width, height));
        }
    }
}

export class PackingInstance {
    readonly boxLength: number;
    readonly rectangles: readonly Rectangle[];

    constructor(boxLength: number, rectangles: Rectangle[]) {
        this.boxLength = boxLength;
        this.rectangles = rectangles;
    }
}
