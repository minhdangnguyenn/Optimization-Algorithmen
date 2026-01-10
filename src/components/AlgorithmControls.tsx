import React, { useState } from 'react';
import { Rectangle, PackingResult } from '../types';
import { GreedyPacker, WidthBasedGreedyPacker, HeightBasedGreedyPacker } from '../algorithms/greedyPacking';
import { LocalSearchPacker } from '../algorithms/localSearch';

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
  const [maxIterations, setMaxIterations] = useState(100);
  const [greedyCriteria, setGreedyCriteria] = useState<'area' | 'width' | 'height'>('area');
  const [neighborhoodType, setNeighborhoodType] = useState<'geometry' | 'rule' | 'overlap'>('geometry');

  const setRunningState = (running: boolean) => {
    setIsRunning(running);
    onRunningStateChange(running);
  };

  const getGreedyPacker = (boxSize: number) => {
    switch (greedyCriteria) {
      case 'width':
        return new WidthBasedGreedyPacker(boxSize);
      case 'height':
        return new HeightBasedGreedyPacker(boxSize);
      case 'area':
      default:
        return new GreedyPacker(boxSize);
    }
  };

  const runGreedyAlgorithm = async () => {
    if (rectangles.length === 0) return;
    
    setRunningState(true);
    
    // Reset visualization first
    onResult(null);
    
    try {
      // Add small delay to show loading state and reset
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const packer = getGreedyPacker(boxSize);
      const result = packer.pack(rectangles);
      
      // Update algorithm name to include criteria
      const criteriaName = greedyCriteria === 'area' ? 'Area' : 
                          greedyCriteria === 'width' ? 'Width' : 'Height';
      onResult({
        ...result,
        algorithm: `Greedy First Fit Decreasing (${criteriaName}-based)`
      });
    } catch (error) {
      console.error('Error running greedy algorithm:', error);
    } finally {
      setRunningState(false);
    }
  };

  const runLocalSearchAlgorithm = async () => {
    if (rectangles.length === 0) return;
    
    setRunningState(true);
    
    // Reset visualization first
    onResult(null);
    
    try {
      // Add small delay to show loading state and reset
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const packer = new LocalSearchPacker(boxSize, neighborhoodType);
      const result = packer.pack(rectangles, maxIterations);
      
      const neighborhoodName = neighborhoodType === 'geometry' ? 'Geometry-Based' :
                              neighborhoodType === 'rule' ? 'Rule-Based' :
                              neighborhoodType === 'overlap' ? 'Overlap-Based' :
                              'Mixed (All)';
      
      onResult({
        ...result,
        algorithm: `Local Search - ${neighborhoodName} (${result.totalBoxes} boxes, ${result.utilization.toFixed(1)}%)`
      });
    } catch (error) {
      console.error('Error running local search algorithm:', error);
    } finally {
      setRunningState(false);
    }
  };

  const runComparison = async () => {
    if (rectangles.length === 0) return;
    
    setRunningState(true);
    
    // Reset visualization first
    onResult(null);
    
    try {
      // Add small delay to show loading state and reset
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const greedyPacker = getGreedyPacker(boxSize);
      const localSearchPacker = new LocalSearchPacker(boxSize, neighborhoodType);
      
      const greedyResult = greedyPacker.pack(rectangles);
      const localSearchResult = localSearchPacker.pack(rectangles, maxIterations);
      
      // Show the better result
      const betterResult = localSearchResult.totalBoxes < greedyResult.totalBoxes ||
        (localSearchResult.totalBoxes === greedyResult.totalBoxes && localSearchResult.utilization > greedyResult.utilization)
        ? localSearchResult
        : greedyResult;
      
      const criteriaName = greedyCriteria === 'area' ? 'Area' : 
                          greedyCriteria === 'width' ? 'Width' : 'Height';
      const neighborhoodName = neighborhoodType === 'geometry' ? 'Geometry-Based' :
                              neighborhoodType === 'rule' ? 'Rule-Based' :
                              'Overlap-Based';
      
      onResult({
        ...betterResult,
        algorithm: `Comparison: Greedy ${criteriaName} (${greedyResult.totalBoxes} boxes, ${greedyResult.utilization.toFixed(1)}%) vs LS-${neighborhoodName} (${localSearchResult.totalBoxes} boxes, ${localSearchResult.utilization.toFixed(1)}%)`
      });
    } catch (error) {
      console.error('Error running comparison:', error);
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
          onChange={(e) => setGreedyCriteria(e.target.value as 'area' | 'width' | 'height')}
          disabled={isRunning}
        >
          <option value="area">Area Descending (Default)</option>
          <option value="width">Width Descending</option>
          <option value="height">Height Descending</option>
        </select>
      </div>

      <div className="input-group">
        <label>Max Iterations (Local Search):</label>
        <input
          type="number"
          value={maxIterations}
          onChange={(e) => setMaxIterations(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          max="1000"
          disabled={isRunning}
        />
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
          onClick={runGreedyAlgorithm}
          disabled={isRunning || rectangles.length === 0}
        >
          {isRunning ? 'Running...' : 'Run Greedy Algorithm'}
        </button>
        
        <button 
          className="button" 
          onClick={runLocalSearchAlgorithm}
          disabled={isRunning || rectangles.length === 0}
        >
          {isRunning ? 'Running...' : 'Run Local Search'}
        </button>
        
        <button 
          className="button" 
          onClick={runComparison}
          disabled={isRunning || rectangles.length === 0}
        >
          {isRunning ? 'Running...' : 'Compare Algorithms'}
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