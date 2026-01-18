import React, { useState } from "react";
import { Rectangle } from "../algorithm/rectangle";
import {
    TestInstanceGenerator,
    TestInstanceParams,
} from "../testInstance/instance";

interface RectangleInputProps {
    onAddRectangle: (rectangle: Rectangle) => void;
    onAddMultipleRectangles: (
        rectangles: Array<{ width: number; height: number }>,
    ) => void;
    onClearRectangles: () => void;
    rectangles: Rectangle[];
    boxSize: number;
    onBoxSizeChange: (newBoxSize: number) => void;
}

export const RectangleInput: React.FC<RectangleInputProps> = ({
    onAddMultipleRectangles,
    onClearRectangles,
    rectangles,
    boxSize,
    onBoxSizeChange,
}) => {
    const [instanceCount, setInstanceCount] = useState<string>("1000");
    const [minWidth, setMinWidth] = useState<string>("5");
    const [maxWidth, setMaxWidth] = useState<string>("100");
    const [minHeight, setMinHeight] = useState<string>("5");
    const [maxHeight, setMaxHeight] = useState<string>("100");
    const [instanceBoxSize, setInstanceBoxSize] = useState<string>("100");

    const parseInputInt = () => {
        const count = parseInt(instanceCount);
        const minW = parseInt(minWidth);
        const maxW = parseInt(maxWidth);
        const minH = parseInt(minHeight);
        const maxH = parseInt(maxHeight);
        const newBoxSize = parseInt(instanceBoxSize);

        // Validation
        if (count <= 0) return;
        if (minW <= 0 || maxW <= 0 || minH <= 0 || maxH <= 0) return;
        if (minW > maxW || minH > maxH) return;
        if (newBoxSize <= 0) return;
        if (maxW > newBoxSize || maxH > newBoxSize) return;

        let instanceParams: TestInstanceParams = {
            numRectangles: count,
            minWidth: minW,
            maxWidth: maxW,
            minHeight: minH,
            maxHeight: maxH,
            boxLength: newBoxSize,
        };

        const instanceGenerator = new TestInstanceGenerator();
        const generatedRectangles = instanceGenerator.generate(instanceParams);

        // Update box size if different from current
        if (newBoxSize !== boxSize) {
            onBoxSizeChange(newBoxSize);
        }

        // Add all rectangles at once to ensure unique IDs
        onAddMultipleRectangles(generatedRectangles);
    };

    return (
        <div className="controls">
            <p style={{ marginBottom: "10px" }}>
                0 &lt; Number of Rectangles &lt;= 1000
            </p>
            <p style={{ marginBottom: "10px" }}>
                0 &lt; Box size length &lt;= 1000
            </p>
            <div className="input-group">
                <p style={{ margin: "10px" }}>Random Instance Generator:</p>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <div>
                        <label>Number of rectangles:</label>
                        <input
                            type="number"
                            value={instanceCount}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setInstanceCount(e.target.value)}
                            min="1"
                            placeholder="Count"
                        />
                    </div>
                    <div>
                        <label>Box size (L×L):</label>
                        <input
                            type="number"
                            value={instanceBoxSize}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setInstanceBoxSize(e.target.value)}
                            min="10"
                            placeholder="Box size"
                        />
                    </div>
                    <div>
                        <label>Min width:</label>
                        <input
                            type="number"
                            value={minWidth}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setMinWidth(e.target.value)}
                            min="1"
                            placeholder="Min width"
                        />
                    </div>
                    <div>
                        <label>Max width:</label>
                        <input
                            type="number"
                            value={maxWidth}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setMaxWidth(e.target.value)}
                            min="1"
                            placeholder="Max width"
                        />
                    </div>
                    <div>
                        <label>Min height:</label>
                        <input
                            type="number"
                            value={minHeight}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setMinHeight(e.target.value)}
                            min="1"
                            placeholder="Min height"
                        />
                    </div>
                    <div>
                        <label>Max height:</label>
                        <input
                            type="number"
                            value={maxHeight}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) => setMaxHeight(e.target.value)}
                            min="1"
                            placeholder="Max height"
                        />
                    </div>
                </div>
                <button
                    className="button secondary"
                    onClick={parseInputInt}
                    disabled={
                        parseInt(instanceCount) <= 0 ||
                        parseInt(minWidth) <= 0 ||
                        parseInt(maxWidth) <= 0 ||
                        parseInt(minHeight) <= 0 ||
                        parseInt(maxHeight) <= 0 ||
                        parseInt(minWidth) > parseInt(maxWidth) ||
                        parseInt(minHeight) > parseInt(maxHeight) ||
                        parseInt(instanceBoxSize) <= 0 ||
                        parseInt(maxWidth) > parseInt(instanceBoxSize) ||
                        parseInt(maxHeight) > parseInt(instanceBoxSize)
                    }
                >
                    Generate Instance
                </button>
            </div>

            <div className="input-group">
                <button
                    className="button secondary"
                    onClick={onClearRectangles}
                    disabled={rectangles.length === 0}
                >
                    Clear All Rectangles
                </button>
            </div>
        </div>
    );
};
