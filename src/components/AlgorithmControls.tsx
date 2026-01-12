import React, { useState } from 'react';
import { Rectangle, PackingResult } from '../types';
import { GreedyPacker } from '../algorithms/greedy/GreedyPacking';
import { LocalSearchPacker } from '../algorithms/localSearch/LocalSearchPacking';


interface AlgorithmControlsProps {
  rectangles: Rectangle[];
  boxSize: number;
  onResult: (result: PackingResult | null) => void;
  onRunningStateChange: (isRunning: boolean) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  rectangles,
  boxSize,
  onResult,
  onRunningStateChange
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [maxIterations, setMaxIterations] = useState(10000);
  const [greedyCriteria, setGreedyCriteria] = useState<'area' | 'height'>('area');
  const [neighborhoodType, setNeighborhoodType] = useState<'geometry' | 'rule' | 'overlap'>('geometry');

  const setRunningState = (running: boolean) => {
    setIsRunning(running);
    onRunningStateChange(running);
  };

  const runBothAlgorithms = async () => {
    if (rectangles.length === 0) return;
    
    setRunningState(true);
    
    // Reset visualization first
    onResult(null);
    
    try {
      // Add small delay to show loading state and reset
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const greedyPacker = new GreedyPacker(boxSize, greedyCriteria);
      const localSearchPacker = new LocalSearchPacker(boxSize, neighborhoodType);
      
      const greedyResult = greedyPacker.pack(rectangles);
      const localSearchResult = localSearchPacker.pack(rectangles, maxIterations);
      
      // Show the better result with comparison data
      const betterResult = localSearchResult.totalBoxes < greedyResult.totalBoxes ||
        (localSearchResult.totalBoxes === greedyResult.totalBoxes && localSearchResult.utilization > greedyResult.utilization)
        ? localSearchResult
        : greedyResult;
      
      const neighborhoodName = neighborhoodType === 'geometry' ? 'Geometry-Based' :
                              neighborhoodType === 'rule' ? 'Rule-Based' :
                              'Overlap-Based';
      
      onResult({
        ...betterResult,
        algorithm: `Comparison: Greedy ${greedyCriteria} (${greedyResult.totalBoxes} boxes, ${greedyResult.utilization.toFixed(1)}%) vs LS-${neighborhoodName} (${localSearchResult.totalBoxes} boxes, ${localSearchResult.utilization.toFixed(1)}%)`,
        comparisonResult: {
          greedy: greedyResult,
          localSearch: localSearchResult
        }
      });
    } catch (error) {
      console.error('Error running both algorithms:', error);
    } finally {
      setRunningState(false);
    }
  };

  return (
    <div className="controls">
      <h3>Algorithm Controls</h3>
      
      <div className="input-group">
        <label>Greedy Sorting Criteria:</label>
        <select
          value={greedyCriteria}
          onChange={(e) => setGreedyCriteria(e.target.value as 'area' | 'height')}
          disabled={isRunning}
        >
          <option value="area">Area Descending (Default)</option>
          <option value="height">Height Descending</option>
        </select>
      </div>

      <div className="input-group">
        <label>Local Search Neighborhood Type:</label>
        <select
          value={neighborhoodType}
          onChange={(e) => setNeighborhoodType(e.target.value as 'geometry' | 'rule' | 'overlap')}
          disabled={isRunning}
        >
          <option value="geometry">Geometry-Based (Move rectangles geometrically)</option>
          <option value="rule">Rule-Based (Modify rectangle permutations)</option>
          <option value="overlap">Overlap-Based (Allow partial overlaps)</option>
        </select>
      </div>

      <div className="input-group">
        <button 
          className="button" 
          onClick={runBothAlgorithms}
          disabled={isRunning || rectangles.length === 0}
        >
          {isRunning ? 'Running...' : 'Run Algorithms'}
        </button>
      </div>

      {rectangles.length === 0 && (
        <p className="error">
          Please add some rectangles before running algorithms.
        </p>
      )}
    </div>
  );
};