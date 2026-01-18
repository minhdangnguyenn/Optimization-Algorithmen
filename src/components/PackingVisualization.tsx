import React from "react";
import { ComparisonResult } from "../types";
import { SolveResult } from "./SolveResult";

interface PackingVisualizationProps {
    result: ComparisonResult | null;
    boxSize: number;
    isRunning?: boolean;
}

export const PackingVisualization: React.FC<PackingVisualizationProps> = ({
    result,
    boxSize,
    isRunning = false,
}) => {
    if (isRunning) {
        return (
            <div className="visualization">
                <h3>Packing Visualization</h3>
                <p>🔄 Running both algorithms... Please wait.</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="visualization">
                <h3>Packing Visualization</h3>
                <p>Run the algorithms to see the packing visualization.</p>
            </div>
        );
    }

    const hasGreedy = result.greedy !== null;
    const hasLocalSearch = result.localSearch !== null;

    if (!hasGreedy && !hasLocalSearch) {
        return (
            <div className="visualization">
                <h3>Packing Visualization</h3>
                <p style={{ color: "#d32f2f" }}>
                    Both algorithms failed to produce results.
                </p>
            </div>
        );
    }

    return (
        <div className="visualization">
            <h3>Algorithm Comparison</h3>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "20px",
                }}
            >
                {hasGreedy && (
                    <SolveResult
                        result={result.greedy!}
                        boxSize={boxSize}
                        title="Greedy Algorithm"
                    />
                )}
                {hasLocalSearch && (
                    <SolveResult
                        result={result.localSearch!}
                        boxSize={boxSize}
                        title="Local Search Algorithm"
                    />
                )}
            </div>

            {hasGreedy && hasLocalSearch && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "8px",
                        border: "1px solid #90caf9",
                    }}
                >
                    <h4 style={{ marginTop: "0" }}>Comparison Summary</h4>
                    <div
                        style={{
                            display: "flex",
                            gap: "30px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <strong>Boxes:</strong> Greedy:{" "}
                            {result.greedy!.totalBoxes} | Local Search:{" "}
                            {result.localSearch!.totalBoxes} |{" "}
                            {result.greedy!.totalBoxes <
                            result.localSearch!.totalBoxes
                                ? "Greedy wins"
                                : result.greedy!.totalBoxes >
                                    result.localSearch!.totalBoxes
                                  ? "Local Search wins"
                                  : "Tie"}
                        </div>
                        <div>
                            <strong>Utilization:</strong> Greedy:{" "}
                            {result.greedy!.utilization.toFixed(2)}% | Local
                            Search: {result.localSearch!.utilization.toFixed(2)}
                            % |{" "}
                            {result.greedy!.utilization >
                            result.localSearch!.utilization
                                ? "Greedy better"
                                : result.greedy!.utilization <
                                    result.localSearch!.utilization
                                  ? "Local Search better"
                                  : "Equal"}
                        </div>
                        <div>
                            <strong>Execution Time:</strong> Greedy:{" "}
                            {result.greedy!.executionTime.toFixed(2)}ms | Local
                            Search:{" "}
                            {result.localSearch!.executionTime.toFixed(2)}ms |{" "}
                            {result.greedy!.executionTime <
                            result.localSearch!.executionTime
                                ? "Greedy faster"
                                : result.greedy!.executionTime >
                                    result.localSearch!.executionTime
                                  ? "Local Search faster"
                                  : "Equal"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
