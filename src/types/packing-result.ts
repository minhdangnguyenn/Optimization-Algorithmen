import type { Box } from "../algorithm/box";

// Packing result for visualization
export interface PackingResult {
    boxes: Box[];
    totalBoxes: number;
    utilization: number;
    algorithm: string;
    executionTime: number;
}

// Comparison result that holds both algorithm results
export interface ComparisonResult {
    greedy: PackingResult | null;
    localSearch: PackingResult | null;
}
