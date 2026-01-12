/**
 * Generic Local Search Algorithm Implementation
 * 
 * This implementation is completely generic and contains NO problem-specific logic.
 * It can be applied to ANY optimization problem.
 */

/**
 * Generic Neighborhood Interface
 * @template S - Solution type
 */
export interface Neighborhood<S> {
  getNeighbor(currentSolution: S): S;
  setIteration?(iteration: number): void;
}

/**
 * Generic Objective Function Interface
 * @template S - Solution type
 */
export interface ObjectiveFunction<S> {
  evaluate(solution: S): number;
  isBetter(solution1: S, solution2: S): boolean;
}

/**
 * Generic Acceptance Criterion Interface
 * @template S - Solution type
 */
export interface AcceptanceCriterion<S> {
  shouldAccept(
    currentSolution: S,
    newSolution: S,
    currentObjective: number,
    newObjective: number,
    iteration: number,
    maxIterations: number
  ): boolean;
}

/**
 * Generic Initial Solution Generator Interface
 * @template T - Element type
 * @template S - Solution type
 */
export interface InitialSolutionGenerator<T, S> {
  generate(elements: T[]): S;
}

/**
 * Local Search Result
 * @template S - Solution type
 */
export interface LocalSearchResult<S> {
  solution: S;
  objectiveValue: number;
  iterations: number;
  executionTime: number;
}

/**
 * Generic Local Search Algorithm
 * @template T - Element type (input data)
 * @template S - Solution type
 */
export class LocalSearchAlgorithm<T, S> {
  constructor(
    private neighborhood: Neighborhood<S>,
    private objectiveFunction: ObjectiveFunction<S>,
    private acceptanceCriterion: AcceptanceCriterion<S>,
    private initialSolutionGenerator: InitialSolutionGenerator<T, S>
  ) {}

  search(elements: T[], maxIterations: number = 100): LocalSearchResult<S> {
    const startTime = performance.now();
    
    let currentSolution = this.initialSolutionGenerator.generate(elements);
    let currentObjective = this.objectiveFunction.evaluate(currentSolution);
    
    let bestSolution = JSON.parse(JSON.stringify(currentSolution));
    let bestObjective = currentObjective;
    
    let iterationsWithoutImprovement = 0;
    const maxIterationsWithoutImprovement = Math.floor(maxIterations * 0.2);
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      if (this.neighborhood.setIteration) {
        this.neighborhood.setIteration(iteration);
      }
      
      const neighborSolution = this.neighborhood.getNeighbor(currentSolution);
      const neighborObjective = this.objectiveFunction.evaluate(neighborSolution);
      
      if (this.objectiveFunction.isBetter(neighborSolution, bestSolution)) {
        bestSolution = JSON.parse(JSON.stringify(neighborSolution));
        bestObjective = neighborObjective;
        iterationsWithoutImprovement = 0;
      } else {
        iterationsWithoutImprovement++;
      }
      
      if (this.acceptanceCriterion.shouldAccept(
        currentSolution,
        neighborSolution,
        currentObjective,
        neighborObjective,
        iteration,
        maxIterations
      )) {
        currentSolution = neighborSolution;
        currentObjective = neighborObjective;
      }
      
      if (iterationsWithoutImprovement > maxIterationsWithoutImprovement && 
          iteration > maxIterations * 0.5) {
        break;
      }
    }
    
    const endTime = performance.now();
    
    return {
      solution: bestSolution,
      objectiveValue: bestObjective,
      iterations: maxIterations,
      executionTime: endTime - startTime
    };
  }
}

/**
 * Simulated Annealing Acceptance Criterion
 */
export class SimulatedAnnealingAcceptance<S> implements AcceptanceCriterion<S> {
  shouldAccept(
    currentSolution: S,
    newSolution: S,
    currentObjective: number,
    newObjective: number,
    iteration: number,
    maxIterations: number
  ): boolean {
    if (newObjective < currentObjective) {
      return true;
    }
    
    const temperature = 1.0 - (iteration / maxIterations);
    const delta = newObjective - currentObjective;
    const probability = Math.exp(-delta / Math.max(0.1, temperature));
    
    return Math.random() < probability;
  }
}
