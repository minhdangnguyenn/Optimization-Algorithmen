import type { Box } from "../box";
import { Rectangle } from "../rectangle";
import { PackingStrategy } from "../../types";

export interface TryPutPosition {
    x: number;
    y: number;
    rotated: boolean;
}

export class BottomLeftPacking implements PackingStrategy {
    tryPut(rectangle: Rectangle, box: Box): TryPutPosition | null {
        const posistions: { x: number; y: number }[] = [{ x: 0, y: 0 }];

        for (const rect of box.rectangles) {
            const { x, y } = rect.position;
            posistions.push({ x: x! + rect.width, y: y! });
            posistions.push({ x: x!, y: y! + rect.height });
        }

        posistions.sort((a, b) => {
            if (a.y === b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });

        const orientations = [rectangle, rectangle.rotate()];

        for (const rect of orientations) {
            for (const { x, y } of posistions) {
                const testRect = new Rectangle(
                    rect.id,
                    rect.width,
                    rect.height,
                );
                testRect.setPosition(x, y);

                let overlapping = false;
                let overflow = false;

                // Check overflow
                if (
                    x + rect.width > box.length ||
                    y + rect.height > box.length
                ) {
                    overflow = true;
                }

                // Check overlapping
                for (const placedRect of box.rectangles) {
                    if (box.isOverlapped(testRect, placedRect)) {
                        overlapping = true;
                        break;
                    }
                }

                // if no overlapping and no overflow
                if (!overlapping && !overflow) {
                    // box.addRect(rect);
                    // rect.setPosition(x, y);
                    // return true;
                    const rotated = rect.rotated;
                    return { x, y, rotated };
                }
            }
        }
        return null;
    }
}
