import { Box, PackingResult } from '../types';
import React from 'react';

interface PackingVisualizationProps {
  result: PackingResult | null;
  boxSize: number;
  isRunning?: boolean;
}

const VisualizationPanel: React.FC<{
  result: PackingResult;
  boxSize: number;
  title: string;
}> = ({ result, boxSize, title }) => {
  const scale = Math.min(1000 / boxSize, 2);
  const visualBoxSize = boxSize * scale;

  return (
    <div style={{ flex: 1, borderRight: '2px solid #ddd', paddingRight: '20px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h4>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '10px',
        fontSize: '14px'
      }}>
        <div><strong>Boxes:</strong> {result.totalBoxes}</div>
        <div><strong>Utilization:</strong> {result.utilization.toFixed(1)}%</div>
        <div><strong>Execution Time:</strong> {result.executionTime.toFixed(2)}ms</div>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {result.boxes.map((box: Box, boxIndex: number) => (
          <div key={box.id} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>
              Box {boxIndex + 1}
            </div>
            <div
              className="box"
              style={{
                width: `${visualBoxSize}px`,
                height: `${visualBoxSize}px`,
                position: 'relative',
                margin: '5px',
                border: '2px solid #353131',
                background: '#fff'
              }}
            >
              {box.rectangles.map((rect, rectIndex) => (
                <div
                  key={`${rect.id}-${rectIndex}`}
                  className="rectangle"
                  style={{
                    left: `${rect.x * scale}px`,
                    top: `${rect.y * scale}px`,
                    width: `${rect.width * scale}px`,
                    height: `${rect.height * scale}px`,
                    backgroundColor: rect.rotated ? 'red' : '#240defdc',
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#eae3e3',
                    fontWeight: 'bold',
                    flexDirection: 'column',
                    border: "1px solid #060606",
                    gap: '2px'
                  }}
                >
                  <div>R{rect.id}</div>
                  <div>
                    {rect.width}×{rect.height}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '15px'}}>
              <p>Number of rectangles: {box.rectangles.length}</p>
              <p>Util: {((box.rectangles.reduce((sum, r) => sum + r.width * r.height, 0) / (boxSize * boxSize)) * 100).toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PackingVisualization: React.FC<PackingVisualizationProps> = ({
  result,
  boxSize,
  isRunning = false
}) => {
  if (isRunning) {
    return (
      <div className="visualization">
        <h3>Packing Visualization</h3>
        <p>🔄 Running algorithms... Please wait.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="visualization">
        <h3>Packing Visualization</h3>
        <p>Run algorithms to see the packing visualization.</p>
      </div>
    );
  }

  const isComparison = result.comparisonResult !== undefined;

  if (isComparison && result.comparisonResult) {
    const { greedy, localSearch } = result.comparisonResult;
    return (
      <div className="visualization">
        <h3>Algorithm Comparison - Side by Side</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          margin: '20px',
          background: '#f9f9f9',
          padding: '15px',
          borderRadius: '4px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>GREEDY Algorithm</strong>
            </div>
            <div style={{ fontSize: '13px', marginTop: '5px' }}>
              <span style={{ display: 'inline-block', marginRight: '20px' }}><strong>{greedy.totalBoxes} boxes</strong></span>
              <span style={{ display: 'inline-block' }}><strong>{greedy.utilization.toFixed(1)}%</strong></span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>LOCAL SEARCH Algorithm</strong>
            </div>
            <div style={{ fontSize: '13px', marginTop: '5px' }}>
              <span style={{ display: 'inline-block', marginRight: '20px' }}><strong>{localSearch.totalBoxes} boxes</strong></span>
              <span style={{ display: 'inline-block' }}><strong>{localSearch.utilization.toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <VisualizationPanel result={greedy} boxSize={boxSize} title="Greedy (FFD)" />
          <VisualizationPanel result={localSearch} boxSize={boxSize} title="Local Search" />
        </div>
      </div>
    );
  }

  // Single algorithm result
  const scale = Math.min(300 / boxSize, 2);
  const visualBoxSize = boxSize * scale;

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

      <div className="boxes-container" style={{ maxHeight: "600px", overflowY: "auto", border: "1px solid #ddd", padding: "10px", margin: "20px" }}>
        {result.boxes.map((box: Box, boxIndex: number) => (
          <div key={box.id} style={{ marginBottom: '20px' }}>
            <div
              className="box"
              style={{
                width: `${visualBoxSize}px`,
                height: `${visualBoxSize}px`,
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
                    backgroundColor:"#0f38ee",
                    fontSize: `${Math.max(8, Math.min(12, scale * 8))}px`
                  }}
                >
                  {rect.id}
                  {rect.rotated}
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', margin: '5px' }}>
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