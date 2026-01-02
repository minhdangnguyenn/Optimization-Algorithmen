import { useState } from 'react';
import { Rectangle } from '../types';

interface RectangleInputProps {
  onAddRectangle: (rectangle: Omit<Rectangle, 'id'>) => void;
  onAddMultipleRectangles: (rectangles: Omit<Rectangle, 'id'>[]) => void;
  onClearRectangles: () => void;
  rectangles: Rectangle[];
  boxSize: number;
}

export const RectangleInput: React.FC<RectangleInputProps> = ({
  onAddRectangle,
  onAddMultipleRectangles,
  onClearRectangles,
  rectangles,
  boxSize
}) => {
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [instanceCount, setInstanceCount] = useState<string>('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const w = parseInt(width);
    const h = parseInt(height);
    
    if (w > 0 && h > 0 && w <= boxSize && h <= boxSize) {
      onAddRectangle({
        width: w,
        height: h,
        originalWidth: w,
        originalHeight: h,
        rotated: false
      });
      setWidth('');
      setHeight('');
    }
  };

  const handleAddPreset = (preset: { width: number; height: number }[]) => {
    const rectangleData = preset.map(rect => ({
      width: rect.width,
      height: rect.height,
      originalWidth: rect.width,
      originalHeight: rect.height,
      rotated: false
    }));
    onAddMultipleRectangles(rectangleData);
  };

  const generateRandomInstance = () => {
    const count = parseInt(instanceCount);
    if (count <= 0 || count > 500) return;

    // Generate all rectangles at once with proper unique IDs
    const rectanglesToAdd = [];
    for (let i = 0; i < count; i++) {
      // Generate random integer dimensions between 5 and boxSize (but max 1000)
      const maxDimension = Math.min(boxSize, 1000);
      const minDimension = Math.min(5, maxDimension);
      
      const randomWidth = Math.floor(Math.random() * (maxDimension - minDimension + 1)) + minDimension;
      const randomHeight = Math.floor(Math.random() * (maxDimension - minDimension + 1)) + minDimension;
      
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

  const presets = {
    small: [
      { width: 20, height: 30 },
      { width: 25, height: 15 },
      { width: 30, height: 20 },
      { width: 15, height: 25 },
      { width: 35, height: 10 }
    ],
    medium: [
      { width: 40, height: 60 },
      { width: 50, height: 30 },
      { width: 35, height: 45 },
      { width: 60, height: 25 },
      { width: 45, height: 40 },
      { width: 30, height: 50 }
    ],
    large: [
      { width: 80, height: 60 },
      { width: 70, height: 90 },
      { width: 90, height: 50 },
      { width: 60, height: 80 },
      { width: 100, height: 40 }
    ],
    mixed: [
      { width: 20, height: 30 },
      { width: 50, height: 40 },
      { width: 80, height: 20 },
      { width: 30, height: 70 },
      { width: 60, height: 35 },
      { width: 25, height: 45 },
      { width: 90, height: 15 },
      { width: 40, height: 60 }
    ]
  };

  return (
    <div className="controls">
      <h3>Add Rectangles</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Width:</label>
          <input
            type="number"
            value={width}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
            min="1"
            max={boxSize}
            placeholder="Enter width"
          />
          
          <label>Height:</label>
          <input
            type="number"
            value={height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
            min="1"
            max={boxSize}
            placeholder="Enter height"
          />
          
          <button type="submit" className="button">
            Add Rectangle
          </button>
        </div>
      </form>

      {/* <div className="input-group">
        <label>Quick Presets:</label>
        <button 
          className="button secondary" 
          onClick={() => handleAddPreset(presets.small)}
        >
          Small Rectangles
        </button>
        <button 
          className="button secondary" 
          onClick={() => handleAddPreset(presets.medium)}
        >
          Medium Rectangles
        </button>
        <button 
          className="button secondary" 
          onClick={() => handleAddPreset(presets.large)}
        >
          Large Rectangles
        </button>
        <button 
          className="button secondary" 
          onClick={() => handleAddPreset(presets.mixed)}
        >
          Mixed Sizes
        </button>
      </div> */}

      <div className="input-group">
        <label>Random Instance Generator:</label>
        <input
          type="number"
          value={instanceCount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstanceCount(e.target.value)}
          min="1"
          max="500"
          placeholder="Number of rectangles"
        />
        <button 
          className="button secondary" 
          onClick={generateRandomInstance}
          disabled={parseInt(instanceCount) <= 0 || parseInt(instanceCount) > 500}
        >
          Generate {instanceCount} Random Rectangles
        </button>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Generates rectangles with random integer dimensions (5-{Math.min(boxSize, 1000)})
        </span>
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