import { OrderingStrategy } from "../../interfaces/strategy/oderStrategy";
import { Rectangle } from "../../algorithm/rectangle";

export class HeightDescendingStrategy implements OrderingStrategy<Rectangle> {
  order(elements: readonly Rectangle[]): readonly Rectangle[] {
    return [...elements].sort((a, b) => b.height - a.height);
  }
}
