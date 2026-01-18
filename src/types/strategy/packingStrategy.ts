import { Rectangle } from "../../algorithm/rectangle";
import { Box } from "../../algorithm/box";
import { TryPutPosition } from "../../algorithm/BottomLeftPacker";

/**
 * This class decides how rectangle be placed in a box
 * It can be area desc or height desc
 */
export interface PackingStrategy {
    tryPut(rectangle: Rectangle, box: Box): TryPutPosition | null;
}
