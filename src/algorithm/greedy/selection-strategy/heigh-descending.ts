import { OrderingStrategy } from "../../../types/order-strategy";
import { Rectangle } from "../../rectangle";

export class HeightDescendingStrategy implements OrderingStrategy<Rectangle> {
    order(elements: readonly Rectangle[]): readonly Rectangle[] {
        return [...elements].sort((a, b) => b.height - a.height);
    }
}
