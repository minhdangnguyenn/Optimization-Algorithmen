import React, { useState } from 'react';
import { Rectangle } from '../types';

interface RectangleInputProps {
  onAddRectangle: (rectangle: Omit<Rectangle, 'id'>) => void;
  onAddMultipleRectangles: (rectangles: Omit<Rectangle, 'id'>[]) => void;
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
  onBoxSizeChange
}) => {
  const [instanceCount, setInstanceCount] = useState<string>('1000');
  const [minSideLength, setMinSideLength] = useState<string>('5');
  const [maxSideLength, setMaxSideLength] = useState<string>('100');
  const [instanceBoxSize, setInstanceBoxSize] = useState<string>('100');

  const generateRandomInstance = () => {
    const count = parseInt(instanceCount);
    const minSide = parseInt(minSideLength);
    const maxSide = parseInt(maxSideLength);
    const newBoxSize = parseInt(instanceBoxSize);
    
    // Validation
    if (count <= 0 || count > 10000) return;
    if (minSide <= 0 || maxSide <= 0) return;
    if (minSide > maxSide) return;
    if (newBoxSize <= 0) return;
    if (maxSide > newBoxSize) return;

    // Update box size if different from current
    if (newBoxSize !== boxSize) {
      onBoxSizeChange(newBoxSize);
    }

    // Generate all rectangles at once with proper unique IDs
    const rectanglesToAdd = [];
    for (let i = 0; i < count; i++) {
      // Generate random integer dimensions between minSide and maxSide
      const randomWidth = Math.floor(Math.random() * (maxSide - minSide + 1)) + minSide;
      const randomHeight = Math.floor(Math.random() * (maxSide - minSide + 1)) + minSide;
      
      rectanglesToAdd.push({
        width: randomWidth,
        height: randomHeight,
        originalWidth: randomWidth,
        originalHeight: randomHeight,
        rotated: false
      });
    }

    // Add all rectangles at once to ensure unique IDs
    onAddMultipleRectangles(rectanglesToAdd);
  };

  return (
    <div className="controls">
      <p style={{ marginBottom: '10px' }}>0 &lt; Number of Rectangles &lt;= 1000</p>
      <p style={{ marginBottom: '10px' }}>0 &lt; Box size length &lt;= 2000</p>
      <div className="input-group">
        <p style={{margin: "10px"}}>Random Instance Generator:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label>Number of rectangles:</label>
            <input
              type="number"
              value={instanceCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceCount(e.target.value)}
              min="1"
              max="10001"
              placeholder="Count"
            />
          </div>
          <div>
            <label>Box size (L×L):</label>
            <input
              type="number"
              value={instanceBoxSize}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceBoxSize(e.target.value)}
              min="10"
              max="2000"
              placeholder="Box size"
            />
          </div>
          <div>
            <label>Min rectangle side length:</label>
            <input
              type="number"
              value={minSideLength}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinSideLength(e.target.value)}
              min="1"
              max="1001"
              placeholder="Min"
            />
          </div>
          <div>
            <label>Max rectangle side length:</label>
            <input
              type="number"
              value={maxSideLength}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxSideLength(e.target.value)}
              min="1"
              max="1001"
              placeholder="Max"
            />
          </div>
        </div>
        <button 
          className="button secondary" 
          onClick={generateRandomInstance}
          disabled={
            parseInt(instanceCount) <= 0 || parseInt(instanceCount) > 5000 ||
            parseInt(minSideLength) <= 0 || parseInt(maxSideLength) <= 0 ||
            parseInt(minSideLength) > parseInt(maxSideLength) ||
            parseInt(instanceBoxSize) <= 0 || parseInt(instanceBoxSize) > 2000  ||
            parseInt(maxSideLength) > parseInt(instanceBoxSize)
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