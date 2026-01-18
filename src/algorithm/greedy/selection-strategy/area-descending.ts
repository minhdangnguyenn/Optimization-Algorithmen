import { Rectangle } from "../../rectangle";
import { OrderingStrategy } from "../../../types/strategy/order-strategy";

/**
 * Init two order strategies
 * area desc and height desc
 */
export class AreaDescendingStrategy implements OrderingStrategy<Rectangle> {
    order(elements: readonly Rectangle[]): readonly Rectangle[] {
        return [...elements].sort((a, b) => b.area - a.area);
    }
}
