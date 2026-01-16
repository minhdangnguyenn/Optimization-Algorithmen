import { NeighborhoodStrategy } from "../../types";
import { PackingSolution } from "../../algorithm";
import { Rectangle } from "../../algorithm";
import { Box } from "../../algorithm";

export class GeometryBasedNeighborhood implements NeighborhoodStrategy<PackingSolution> {
    generateNeighbors(solution: PackingSolution): PackingSolution[] {
        const neighbors: PackingSolution[] = [];

        for (const box of solution.boxes) {
            for (const rect of box.rectangles) {
                // move inside same box
                neighbors.push(...this.moveInsideBox(solution, rect, box));

                // move to other boxes
                neighbors.push(...this.moveToOtherBoxes(solution, rect, box));
            }
        }

        return neighbors;
    }

    private moveInsideBox(
        solution: PackingSolution,
        rect: Rectangle,
        box: Box,
    ): PackingSolution[] {
        const neighbors: PackingSolution[] = [];
        const steps = [
            [5, 0],
            [-5, 0],
            [0, 5],
            [0, -5],
        ];

        for (const [dx, dy] of steps) {
            const next = solution.copySolution();

            const b = next.boxes.find((b) => b.id === box.id)!;
            const r = b.rectangles.find((r) => r.id === rect.id)!;

            r.setPosition(r.position.x + dx, r.position.y + dy);

            if (this.fitsInBox(r, b)) {
                neighbors.push(next);
            }
        }

        return neighbors;
    }

    private moveToOtherBoxes(
        solution: PackingSolution,
        rect: Rectangle,
        fromBox: Box,
    ): PackingSolution[] {
        const neighbors: PackingSolution[] = [];

        for (const targetBox of solution.boxes) {
            if (targetBox.id === fromBox.id) continue;

            const next = solution.copySolution();

            const src = next.boxes.find((b) => b.id === fromBox.id)!;
            const boxDestination = next.boxes.find(
                (b) => b.id === targetBox.id,
            )!;

            const r = src.rectangles.find((r) => r.id === rect.id)!;

            src.removeRect(r);
            r.setPosition(0, 0);

            if (boxDestination.canPlace(r)) {
                boxDestination.addRect(r);
                neighbors.push(next);
            }
        }

        return neighbors;
    }

    private fitsInBox(rect: Rectangle, box: Box): boolean {
        return (
            rect.position.x >= 0 &&
            rect.position.y >= 0 &&
            rect.position.x + rect.width <= box.length &&
            rect.position.y + rect.height <= box.length
        );
    }
}
