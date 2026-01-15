import React from "react";
import { PackingResult } from "../types";
import type { Box } from "../algorithm/box";

interface PackingVisualizationProps {
  result: PackingResult | null;
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
        <p>🔄 Running algorithm... Please wait.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="visualization">
        <h3>Packing Visualization</h3>
        <p>Run the algorithm to see the packing visualization.</p>
      </div>
    );
  }

  const scale = Math.min(400 / boxSize, 2);
  const visualBoxSize = boxSize * scale;

  return (
    <div className="visualization">
      <h3>Packing Visualization</h3>

      <div className="stats">
        <div className="stat-item">
          <strong>Algorithm:</strong> {result.algorithm}
        </div>
        <div className="stat-item">
          <strong>Summary:</strong> <b>{result.totalBoxes} boxes</b> used for{" "}
          {result.boxes.reduce(
            (total: number, box: Box) => total + box.rectangles.length,
            0,
          )}{" "}
          rectangles
        </div>
        <div className="stat-item">
          <strong>Utilization:</strong> {result.utilization.toFixed(2)}%
        </div>
        <div className="stat-item">
          <strong>Execution Time:</strong> {result.executionTime.toFixed(2)}ms
        </div>
      </div>

      <div
        className="boxes-container"
        style={{
          maxHeight: "600px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
          margin: "20px",
        }}
      >
        {result.boxes.map((box: Box, boxIndex: number) => (
          <div key={boxIndex} style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#333",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Box {box.id}
            </div>
            <div
              className="box"
              style={{
                width: `${visualBoxSize}px`,
                height: `${visualBoxSize}px`,
                position: "relative",
                margin: "10px",
                border: "2px solid #333",
                background: "white",
              }}
            >
              {box.rectangles.map((rect, rectIndex) => {
                const pos = rect.position;
                return (
                  <div
                    key={rectIndex}
                    className="rectangle"
                    style={{
                      position: "absolute",
                      left: `${(pos.x ?? 0) * scale}px`,
                      top: `${(pos.y ?? 0) * scale}px`,
                      width: `${rect.width * scale}px`,
                      height: `${rect.height * scale}px`,
                      backgroundColor: rect.rotated ? "#ff6b6b" : "#4dabf7",
                      border: "1px solid #000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: `${Math.max(8, Math.min(12, scale * 6))}px`,
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div>R{rect.id}</div>
                    <div>
                      {rect.width}×{rect.height}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: "12px", color: "#666", margin: "5px" }}>
              Rectangles: {box.rectangles.length} | Utilization:{" "}
              {box.utilization.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {result.boxes.length === 0 && (
        <p>
          No boxes created - all rectangles might be too large for the box size.
        </p>
      )}
    </div>
  );
};
