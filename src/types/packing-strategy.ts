import { Rectangle } from "../algorithm";
import { Box } from "../algorithm";
import { TryPutPosition } from "../algorithm/greedy/packer";

/**
 * This class decides how rectangle be placed in a box
 * It can be area desc or height desc
 */
export interface PackingStrategy {
    tryPut(rectangle: Rectangle, box: Box): TryPutPosition | null;
}
