import React, { useState } from 'react';
import { Rectangle, PackingResult } from './types';
import { RectangleInput } from './components/RectangleInput';
import { RectangleList } from './components/RectangleList';
import { AlgorithmControls } from './components/AlgorithmControls';
import { PackingVisualization } from './components/PackingVisualization';

function App(): React.ReactElement {
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [boxSize, setBoxSize] = useState<number>(100);
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

  const handleBoxSizeChange = (value: string): void => {
    setBoxSizeInput(value);
    const newSize = parseInt(value);
    if (!isNaN(newSize) && newSize >= 10 && newSize <= 500) {
      setBoxSize(newSize);
      setResult(null); // Clear previous results when box size changes
    }
  };

  const handleBoxSizeBlur = (): void => {
    const newSize = parseInt(boxSizeInput);
    if (isNaN(newSize) || newSize < 10) {
      setBoxSizeInput('10');
      setBoxSize(10);
    } else if (newSize > 500) {
      setBoxSizeInput('500');
      setBoxSize(500);
    }
    setResult(null);
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

      {/* <div className="controls">
        <h3>Box Configuration</h3>
        <div className="input-group">
          <label>Box Size (L × L):</label>
          <input
            type="number"
            value={boxSizeInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBoxSizeChange(e.target.value)}
            onBlur={handleBoxSizeBlur}
            min="10"
            max="500"
            placeholder="Enter box size"
          />
          <span>Current box: {boxSize} × {boxSize} (Area: {boxSize * boxSize})</span>
        </div>
      </div> */}

      <RectangleInput
        onAddRectangle={addRectangle}
        onAddMultipleRectangles={addMultipleRectangles}
        onClearRectangles={clearRectangles}
        rectangles={rectangles}
        boxSize={boxSize}
        onBoxSizeChange={handleBoxSizeChangeFromInput}
      />

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

      <PackingVisualization
        result={result}
        boxSize={boxSize}
        isRunning={isAlgorithmRunning}
      />

      {/* <div className="controls">
        <h3>Algorithm Information</h3>
        <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
          <h4>Greedy Algorithm (First Fit Decreasing):</h4>
          <ul>
            <li>Sorts rectangles by selected criteria in descending order:</li>
            <ul>
              <li><strong>Area-based:</strong> Sorts by width × height (default)</li>
              <li><strong>Width-based:</strong> Sorts by width dimension</li>
              <li><strong>Height-based:</strong> Sorts by height dimension</li>
            </ul>
            <li>Places each rectangle in the first box where it fits</li>
            <li>Creates new boxes when necessary</li>
            <li>Fast execution but may not find optimal solution</li>
            <li>Different sorting criteria can lead to different packing results</li>
          </ul>
          
          <h4>Local Search Algorithm:</h4>
          <ul>
            <li>Starts with greedy solution as initial state</li>
            <li>Applies local search operations: swap, rotate, move, consolidate</li>
            <li>Uses simulated annealing to escape local optima</li>
            <li>Iteratively improves solution quality</li>
            <li>Better solutions but longer execution time</li>
          </ul>
          
          <h4>Objective:</h4>
          <p>Minimize the number of boxes while maximizing space utilization. All rectangles can be rotated 90° if beneficial.</p>
        </div>
      </div> */}
    </div>
  );
}

export default App;