import { Box, PackingResult } from '../types';

interface PackingVisualizationProps {
  result: PackingResult | null;
  boxSize: number;
  isRunning?: boolean;
}

export const PackingVisualization: React.FC<PackingVisualizationProps> = ({
  result,
  boxSize,
  isRunning = false
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
        <p>Run an algorithm to see the packing visualization.</p>
      </div>
    );
  }

  const scale = Math.min(300 / boxSize, 2); // Scale factor for visualization
  const visualBoxSize = boxSize * scale;

  // Generate colors for rectangles
  const generateColor = (id: number): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="visualization">
      <h3>Packing Visualization</h3>
      
      <div className="stats">
        <div className="stat-item">
          <strong>Algorithm:</strong> {result.algorithm}
        </div>
        <div className="stat-item">
          <strong>Summary:</strong> <b>{result.totalBoxes} boxes</b> used for {result.boxes.reduce((total, box) => total + box.rectangles.length, 0)} rectangles
        </div>
        <div className="stat-item">
          <strong>Utilization:</strong> {result.utilization.toFixed(1)}%
        </div>
        <div className="stat-item">
          <strong>Execution Time:</strong> {result.executionTime.toFixed(2)}ms
        </div>
      </div>

    <div className="boxes-container" style={{maxHeight: "600px", overflowY: "auto", border: "1px solid #ddd", padding: "10px"}}>
      {result.boxes.map((box: Box, boxIndex: number) => (
        <div key={box.id} style={{ marginBottom: '20px' }}>
        <div
          className="box"
          style={{
            width: `${visualBoxSize}px`,
            height: `${visualBoxSize}px`,
            position: 'relative',
            margin: '10px'
          }}
        >
          <div className="box-title">Box {boxIndex + 1}</div>
          
          {box.rectangles.map((rect, rectIndex) => (
            <div
            key={`${rect.id}-${rectIndex}`}
            className="rectangle"
            style={{
              left: `${rect.x * scale}px`,
              top: `${rect.y * scale}px`,
              width: `${rect.width * scale}px`,
              height: `${rect.height * scale}px`,
              backgroundColor: generateColor(rect.id),
              fontSize: `${Math.max(8, Math.min(12, scale * 8))}px`
            }}
            >
            {rect.id}
            {rect.rotated && '↻'}
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Rectangles: {box.rectangles.length} | 
          Utilization: {((box.rectangles.reduce((sum, r) => sum + r.width * r.height, 0) / (boxSize * boxSize)) * 100).toFixed(1)}%
        </div>
        </div>
      ))}
    </div>

      {result.boxes.length === 0 && (
        <p>No boxes needed - all rectangles might be too large for the box size.</p>
      )}
    </div>
  );
};