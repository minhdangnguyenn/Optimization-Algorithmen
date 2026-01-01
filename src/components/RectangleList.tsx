import React from 'react';
import { Rectangle } from '../types';

interface RectangleListProps {
  rectangles: Rectangle[];
  onRemoveRectangle: (id: number) => void;
}

export const RectangleList: React.FC<RectangleListProps> = ({
  rectangles,
  onRemoveRectangle
}) => {
  const totalArea = rectangles.reduce((sum: number, rect: Rectangle) => sum + (rect.width * rect.height), 0);

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
            {rectangles.map((rect: Rectangle) => (
              <div key={rect.id} className="rectangle-item">
                <span>
                  Rectangle {rect.id}: {rect.width} × {rect.height} 
                  (Area: {rect.width * rect.height})
                  {rect.rotated && ' [Rotated]'}
                </span>
                <button 
                  className="button secondary"
                  onClick={() => onRemoveRectangle(rect.id)}
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