import React, { useState } from 'react';
import { Rectangle, PackingResult } from '../types';
import { GreedyPacker } from '../algorithms/greedyPacking';
import { LocalSearchPacker } from '../algorithms/localSearch';

interface AlgorithmControlsProps {
  rectangles: Rectangle[];
  boxSize: number;
  onResult: (result: PackingResult) => void;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  rectangles,
  boxSize,
  onResult
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [maxIterations, setMaxIterations] = useState(100);

  const runGreedyAlgorithm = async () => {
    if (rectangles.length === 0) return;
    
    setIsRunning(true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      /**
       * const packer = new WidthBasedGreedyPacker(boxSize);
       * const packer = new HeightBasedGreedyPacker(boxSize);
       */
      const packer = new GreedyPacker(boxSize);
      const result = packer.pack(rectangles);
      onResult(result);
    } catch (error) {
      console.error('Error running greedy algorithm:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runLocalSearchAlgorithm = async () => {
    if (rectangles.length === 0) return;
    
    setIsRunning(true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const packer = new LocalSearchPacker(boxSize);
      const result = packer.pack(rectangles, maxIterations);
      onResult(result);
    } catch (error) {
      console.error('Error running local search algorithm:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runComparison = async () => {
    if (rectangles.length === 0) return;
    
    setIsRunning(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const greedyPacker = new GreedyPacker(boxSize);
      const localSearchPacker = new LocalSearchPacker(boxSize);
      
      const greedyResult = greedyPacker.pack(rectangles);
      const localSearchResult = localSearchPacker.pack(rectangles, maxIterations);
      
      // Show the better result
      const betterResult = localSearchResult.totalBoxes < greedyResult.totalBoxes ||
        (localSearchResult.totalBoxes === greedyResult.totalBoxes && localSearchResult.utilization > greedyResult.utilization)
        ? localSearchResult
        : greedyResult;
      
      onResult({
        ...betterResult,
        algorithm: `Comparison: Greedy (${greedyResult.totalBoxes} boxes, ${greedyResult.utilization.toFixed(1)}%) vs Local Search (${localSearchResult.totalBoxes} boxes, ${localSearchResult.utilization.toFixed(1)}%)`
      });
    } catch (error) {
      console.error('Error running comparison:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="controls">
      <h3>Algorithm Controls</h3>
      
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