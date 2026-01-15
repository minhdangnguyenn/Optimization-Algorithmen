import React, { useState } from "react";
import type { PackingResult } from "../types";
import {
  FirstFitPlacer,
  Box,
  Rectangle,
  PackingSolution,
  BottomLeftPacking,
  GreedySolver,
  LocalSearchSolver,
} from "../algorithm";
import {
  AreaDescendingStrategy,
  HeightDescendingStrategy,
} from "../strategy/greedy";

interface AlgorithmControlsProps {
  rectangles: Rectangle[];
  boxSize: number;
  onResult: (result: PackingResult | null) => void;
  onRunningStateChange: (isRunning: boolean) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  rectangles,
  boxSize,
  onResult,
  onRunningStateChange,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sortingCriteria, setSortingCriteria] = useState<"area" | "height">(
    "area",
  );

  const setRunningState = (running: boolean) => {
    setIsRunning(running);
    onRunningStateChange(running);
  };

  const convertSolutionToResult = (
    solution: PackingSolution,
    algorithmName: string,
    executionTime: number,
  ): PackingResult => {
    // compute total area of rectangles
    const usedArea = solution.boxes.reduce(
      (sum, box) =>
        sum + box.rectangles.reduce((boxSum, rect) => boxSum + rect.area, 0),
      0,
    );
    const totalBoxArea = solution.boxes.length * boxSize * boxSize;
    const utilization = totalBoxArea > 0 ? (usedArea / totalBoxArea) * 100 : 0;

    const result: PackingResult = {
      boxes: solution.boxes,
      totalBoxes: solution.boxes.length,
      utilization,
      algorithm: algorithmName,
      executionTime,
    };

    return result;
  };

  const runAlgorithm = async () => {
    if (rectangles.length === 0) return;

    setRunningState(true);
    onResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const startTime = performance.now();

      // Use rectangles directly - they are already Rectangle class instances
      const orderingStrategy =
        sortingCriteria === "area"
          ? new AreaDescendingStrategy()
          : new HeightDescendingStrategy();

      // Create putting strategy and placer
      const packingStrategy = new BottomLeftPacking();
      const placer = new FirstFitPlacer(boxSize, packingStrategy);

      // Create solver
      const solver = new GreedySolver(orderingStrategy, placer);

      // Solve
      const initialSolution = new PackingSolution(boxSize);
      const solution = solver.solve(initialSolution, rectangles);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const result = convertSolutionToResult(
        solution,
        `Greedy FFD (${sortingCriteria === "area" ? "Area" : "Height"} Descending)`,
        executionTime,
      );

      onResult(result);
    } catch (error) {
      console.error("Error running algorithm:", error);
    } finally {
      setRunningState(false);
    }
  };

  return (
    <div className="controls">
      <h3>Algorithm Controls</h3>

      <div className="input-group">
        <label>Sorting Criteria:</label>
        <select
          value={sortingCriteria}
          onChange={(e) =>
            setSortingCriteria(e.target.value as "area" | "height")
          }
          disabled={isRunning}
        >
          <option value="area">Area Descending</option>
          <option value="height">Height Descending</option>
        </select>
      </div>

      <div className="input-group">
        <button
          className="button"
          onClick={runAlgorithm}
          disabled={isRunning || rectangles.length === 0}
        >
          {isRunning ? "Running..." : "Run Greedy Algorithm"}
        </button>
      </div>

      {rectangles.length === 0 && (
        <p className="error">
          Please add some rectangles before running the algorithm.
        </p>
      )}
    </div>
  );
};
