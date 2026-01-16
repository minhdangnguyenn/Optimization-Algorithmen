import { Box } from "../../algorithm";
import { Rectangle } from "../../algorithm/rectangle";
import { SearchStrategy } from "../../types/strategy/searchStrategy";

export class GeometryBased implements SearchStrategy<Rectangle> {
  constructor() {
    // Constructor implementation
  }

  search(candidate: Rectangle): Rectangle {
    // Search implementation
    return candidate;
  }

  moveWithin(candidate: Rectangle, x: number, y: number): Rectangle {
    // Move within implementation
    candidate.width += x;
    candidate.height += y;
    return candidate;
  }

  // move to another box
  moveBetweenBoxes(
    candidate: Rectangle,
    sourceBox: Box,
    destinationBox: Box,
    destinationPoint: [number, number],
  ) {
    sourceBox.removeRect(candidate);

    destinationBox.addRect(candidate);
    candidate.setPosition(destinationPoint[0], destinationPoint[1]);

    return candidate;
  }

  swapRectanglesBetweenBoxes(
    rect1: Rectangle,
    rect2: Rectangle,
    box1: Box,
    box2: Box,
  ) {
    box1.removeRect(rect1);
    box2.removeRect(rect2);

    box1.addRect(rect2);
    box2.addRect(rect1);

    return [rect1, rect2];
  }
}
