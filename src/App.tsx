import React, { useState } from "react";
import { ComparisonResult } from "./types";
import { Rectangle } from "./algorithm/rectangle";
import { RectangleInput } from "./components/RectangleInput";
import { RectangleList } from "./components/RectangleList";
import { AlgorithmControls } from "./components/AlgorithmControls";
import { PackingVisualization } from "./components/PackingVisualization";

function App(): React.ReactElement {
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [boxSize, setBoxSize] = useState<number>(200);
    const [boxSizeInput, setBoxSizeInput] = useState<string>("100");
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [isAlgorithmRunning, setIsAlgorithmRunning] =
        useState<boolean>(false);

    const addRectangle = (id: number, width: number, height: number): void => {
        const newRectangle = new Rectangle(id, width, height);
        setRectangles((prev: Rectangle[]) => [...prev, newRectangle]);
        setResult(null); // Clear previous results
    };

    const addMultipleRectangles = (
        rectangleData: Array<{ id: number; width: number; height: number }>,
    ): void => {
        const newRectangles: Rectangle[] = rectangleData.map(
            (data) => new Rectangle(data.id, data.width, data.height),
        );
        setRectangles((prev: Rectangle[]) => [...prev, ...newRectangles]);
        setResult(null); // Clear previous results
    };

    const removeRectangle = (index: number): void => {
        setRectangles((prev: Rectangle[]) =>
            prev.filter((_, i) => i !== index),
        );
        setResult(null); // Clear previous results
    };

    const clearRectangles = (): void => {
        setRectangles([]);
        setResult(null);
    };

    const handleBoxSizeChangeFromInput = (newSize: number): void => {
        setBoxSize(newSize);
        setBoxSizeInput(newSize.toString());
        setResult(null);
    };

    const handleResult = (newResult: ComparisonResult | null): void => {
        setResult(newResult);
    };

    const handleRunningStateChange = (isRunning: boolean): void => {
        setIsAlgorithmRunning(isRunning);
    };

    return (
        <div className="container">
            <div className="header">
                <h1>2D Rectangle Packing Optimizer</h1>
                <p>
                    Solve the rectangle packing problem using greedy and local
                    search algorithms. Minimize the number of boxes needed to
                    pack all rectangles.
                </p>
            </div>

            <RectangleInput
                onAddRectangle={addRectangle}
                onAddMultipleRectangles={addMultipleRectangles}
                onClearRectangles={clearRectangles}
                rectangles={rectangles}
                boxSize={boxSize}
                onBoxSizeChange={handleBoxSizeChangeFromInput}
            />

            <div className="controls-wrapper">
                <RectangleList
                    rectangles={rectangles}
                    onRemoveRectangle={removeRectangle}
                />

                <AlgorithmControls
                    rectangles={rectangles}
                    boxSize={boxSize}
                    onResult={handleResult}
                    onRunningStateChange={handleRunningStateChange}
                />
            </div>

            <PackingVisualization
                result={result}
                boxSize={boxSize}
                isRunning={isAlgorithmRunning}
            />
        </div>
    );
}

export default App;
