import React, { useState } from 'react';
import { Rectangle, PackingResult } from './types';
import { RectangleInput } from './components/RectangleInput';
import { RectangleList } from './components/RectangleList';
import { AlgorithmControls } from './components/AlgorithmControls';
import { PackingVisualization } from './components/PackingVisualization';

function App(): React.ReactElement {
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [boxSize, setBoxSize] = useState<number>(200);
  const [boxSizeInput, setBoxSizeInput] = useState<string>('100');
  const [result, setResult] = useState<PackingResult | null>(null);
  const [nextId, setNextId] = useState<number>(1);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState<boolean>(false);

  const addRectangle = (rectData: Omit<Rectangle, 'id'>): void => {
    const newRectangle: Rectangle = {
      ...rectData,
      id: nextId
    };
    setRectangles((prev: Rectangle[]) => [...prev, newRectangle]);
    setNextId((prev: number) => prev + 1);
    setResult(null); // Clear previous results
  };

  const addMultipleRectangles = (rectangleDataArray: Omit<Rectangle, 'id'>[]): void => {
    const newRectangles: Rectangle[] = rectangleDataArray.map((rectData, index) => ({
      ...rectData,
      id: nextId + index
    }));
    setRectangles((prev: Rectangle[]) => [...prev, ...newRectangles]);
    setNextId((prev: number) => prev + rectangleDataArray.length);
    setResult(null); // Clear previous results
  };

  const removeRectangle = (id: number): void => {
    setRectangles((prev: Rectangle[]) => prev.filter((rect: Rectangle) => rect.id !== id));
    setResult(null); // Clear previous results
  };

  const clearRectangles = (): void => {
    setRectangles([]);
    setResult(null);
    setNextId(1);
  };

  const handleBoxSizeChangeFromInput = (newSize: number): void => {
    setBoxSize(newSize);
    setBoxSizeInput(newSize.toString());
    setResult(null);
  };

  const handleResult = (newResult: PackingResult | null): void => {
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
          Solve the rectangle packing problem using greedy and local search algorithms.
          Minimize the number of boxes needed to pack all rectangles.
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