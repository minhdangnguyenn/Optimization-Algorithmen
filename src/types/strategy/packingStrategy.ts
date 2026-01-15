import { Rectangle } from "../../rectangle";
import { Box } from "../../box";
/**
 * This class decides how rectangle be placed in a box
 * It can be area desc or height desc
 */
export interface PackingStrategy {
  tryPut(rectangle: Rectangle, box: Box): boolean;
}
