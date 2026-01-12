export interface Rectangle {
  id: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotated: boolean;
}

export interface PlacedRectangle extends Rectangle {
  x: number;
  y: number;
  boxId: number;
}

export interface Box {
  id: number;
  width: number;
  height: number;
  rectangles: PlacedRectangle[];
}

export interface PackingResult {
  boxes: Box[];
  totalBoxes: number;
  utilization: number;
  algorithm: string;
  executionTime: number;
  comparisonResult?: {
    greedy: PackingResult;
    localSearch: PackingResult;
  };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Neighborhood interface for local search
 */
export interface Neighborhood {
  /**
   * Generates a neighbor solution from the current solution
   */
  getNeighbor(currentSolution: PackingResult, rectangles: Rectangle[]): PackingResult;
}