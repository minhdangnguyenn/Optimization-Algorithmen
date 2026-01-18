import React, { useState } from "react";
import type { PackingResult, ComparisonResult } from "../types";
import {
    FirstFitPlacer,
    Rectangle,
    PackingSolution,
    BottomLeftPacking,
    GreedySolver,
    LocalSearchSolver,
} from "../algorithm";
import {
    AreaDescendingStrategy,
    HeightDescendingStrategy,
} from "../strategy/selectionStrategy";
import { GeometryBasedNeighborhood } from "../strategy/neighborhoodStrategy";
import {
    NeighborhoodAdapter,
    createBadInitialSolution,
} from "../algorithm/localsearch";
import { SelectionStrategy as GreedyStrategy } from "../types/strategy/greedy";
import { NeighborhoodType } from "../types/strategy/localsearch";

interface AlgorithmControlsProps {
    rectangles: Rectangle[];
    boxSize: number;
    onResult: (result: ComparisonResult | null) => void;
    onRunningStateChange: (isRunning: boolean) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
    rectangles,
    boxSize,
    onResult,
    onRunningStateChange,
}) => {
    const [isRunning, setIsRunning] = useState(false);
    const [strategy, setSortingCriteria] = useState<GreedyStrategy>();
    const [neighborhoodStrategy, setNeighborhoodStrategy] =
        useState<NeighborhoodType>(NeighborhoodType.GEOMETRY);

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
                sum +
                box.rectangles.reduce((boxSum, rect) => boxSum + rect.area, 0),
            0,
        );
        const totalBoxArea = solution.boxes.length * boxSize * boxSize;
        const utilization =
            totalBoxArea > 0 ? (usedArea / totalBoxArea) * 100 : 0;

        const result: PackingResult = {
            boxes: solution.boxes,
            totalBoxes: solution.boxes.length,
            utilization,
            algorithm: algorithmName,
            executionTime,
        };

        return result;
    };

    const runAlgorithms = async () => {
        if (rectangles.length === 0) return;

        setRunningState(true);
        onResult(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 100));

            let greedyResult: PackingResult | null = null;
            let localSearchResult: PackingResult | null = null;

            // Run Greedy algorithm
            try {
                const greedyStartTime = performance.now();
                const selectionStrategy =
                    strategy === GreedyStrategy.AREA
                        ? new AreaDescendingStrategy()
                        : new HeightDescendingStrategy();

                const packingStrategy = new BottomLeftPacking();
                const placer = new FirstFitPlacer(boxSize, packingStrategy);
                const solver = new GreedySolver(selectionStrategy, placer);

                const initialSolution = new PackingSolution(boxSize);
                const greedySolution = solver.solve(
                    initialSolution,
                    rectangles,
                );
                const greedyEndTime = performance.now();
                const greedyExecutionTime = greedyEndTime - greedyStartTime;

                greedyResult = convertSolutionToResult(
                    greedySolution,
                    `Greedy FFD`,
                    greedyExecutionTime,
                );
            } catch (error) {
                console.error("Error running Greedy algorithm:", error);
            }

            // Run Local Search algorithm
            try {
                const localSearchStartTime = performance.now();
                const neighborhoodType =
                    neighborhoodStrategy === NeighborhoodType.GEOMETRY
                        ? new GeometryBasedNeighborhood()
                        : new GeometryBasedNeighborhood();

                const adapter = new NeighborhoodAdapter(neighborhoodType);
                const localSearchSolver = new LocalSearchSolver(adapter, 1000);

                // Create a bad initial solution (one rectangle per box)
                const initialSolution = createBadInitialSolution(
                    rectangles,
                    boxSize,
                );
                // TODO: Fix this algorithm
                // now it has been temporary commented because it does
                // const localSearchSolution = localSearchSolver.solve(initialSolution, [] as never[]);
                const localSearchEndTime = performance.now();
                const localSearchExecutionTime =
                    localSearchEndTime - localSearchStartTime;

                localSearchResult = convertSolutionToResult(
                    initialSolution,
                    `Local Search`,
                    localSearchExecutionTime,
                );
            } catch (error) {
                console.error("Error running Local Search algorithm:", error);
            }

            const comparisonResult: ComparisonResult = {
                greedy: greedyResult,
                localSearch: localSearchResult,
            };

            onResult(comparisonResult);
        } catch (error) {
            console.error("Error running algorithms:", error);
        } finally {
            setRunningState(false);
        }
    };

    return (
        <div className="controls">
            <h3>Algorithm Controls</h3>

            <div className="input-group">
                <label>Greedy - Sorting Criteria:</label>
                <select
                    value={strategy}
                    onChange={(e) =>
                        setSortingCriteria(e.target.value as GreedyStrategy)
                    }
                    disabled={isRunning}
                >
                    <option value="area">Area Descending</option>
                    <option value="height">Height Descending</option>
                </select>
            </div>

            <div className="input-group">
                <label>Local Search - Neighborhood Strategy:</label>
                <select
                    value={neighborhoodStrategy}
                    onChange={(e) =>
                        setNeighborhoodStrategy(
                            e.target.value as NeighborhoodType,
                        )
                    }
                    disabled={isRunning}
                >
                    <option value="Geometry based">Geometry based</option>
                </select>
            </div>

            <div className="input-group">
                <button
                    className="button"
                    onClick={runAlgorithms}
                    disabled={isRunning || rectangles.length === 0}
                >
                    {isRunning
                        ? "Running Both Algorithms..."
                        : "Run Both Algorithms"}
                </button>
            </div>

            {rectangles.length === 0 && (
                <p className="error">
                    Please add some rectangles before running the algorithms.
                </p>
            )}
        </div>
    );
};
