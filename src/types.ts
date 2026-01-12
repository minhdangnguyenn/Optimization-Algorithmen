import type { Box } from './algorithm/box';
// import type { Rectangle } from './algorithm/rectangle';

// Packing result for visualization
export interface PackingResult {
  boxes: Box[];
  totalBoxes: number;
  utilization: number;
  algorithm: string;
  executionTime: number;
}