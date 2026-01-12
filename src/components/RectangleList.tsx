import React from 'react';
import { Rectangle } from '../algorithm/rectangle';

interface RectangleListProps {
  rectangles: Rectangle[];
  onRemoveRectangle: (index: number) => void;
}

export const RectangleList: React.FC<RectangleListProps> = ({
  rectangles,
  onRemoveRectangle
}) => {
  const totalArea = rectangles.reduce((sum: number, rect: Rectangle) => sum + rect.area, 0);

  return (
    <div className="rectangles-list">
      <h3>Rectangles ({rectangles.length})</h3>
      
      {rectangles.length === 0 ? (
        <p>No rectangles added yet. Add some rectangles to start packing!</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat-item">
              <strong>Total Area: {totalArea}</strong>
            </div>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {rectangles.map((rect: Rectangle, index: number) => (
              <div key={index} className="rectangle-item">
                <span>
                  Rectangle {index + 1}: {rect.width} × {rect.height} 
                  (Area: {rect.area})
                </span>
                <button 
                  className="button secondary"
                  onClick={() => onRemoveRectangle(index)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};