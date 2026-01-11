/**
 * Generic Greedy Algorithm Implementation
 * 
 * This implementation is completely generic and contains no problem-specific logic.
 * It can be applied to any optimization problem by providing appropriate:
 * - Selection strategy (how to choose next element)
 * - Feasibility check (whether a solution is valid)
 * - Solution construction (how to build the solution)
 */

export interface GreedyElement<T> {
  element: T;
  value: number; // For selection strategy comparison
}

export interface GreedyResult<T, S> {
  solution: S;
  selectedElements: T[];
  executionTime: number;
}

export interface SelectionStrategy<T> {
  /**
   * Selects the next best element from available candidates
   * @param candidates Available elements to choose from
   * @returns The selected element or null if none suitable
   */
  selectNext(candidates: GreedyElement<T>[]): GreedyElement<T> | null;
}

export interface FeasibilityChecker<T, S> {
  /**
   * Checks if adding an element to current solution is feasible
   * @param currentSolution Current partial solution
   * @param element Element to be added
   * @returns true if feasible, false otherwise
   */
  isFeasible(currentSolution: S, element: T): boolean;
}

export interface SolutionBuilder<T, S> {
  /**
   * Creates initial empty solution
   * @returns Initial solution state
   */
  createInitialSolution(): S;
  
  /**
   * Adds an element to the current solution
   * @param currentSolution Current solution
   * @param element Element to add
   * @returns Updated solution
   */
  addElement(currentSolution: S, element: T): S;
  
  /**
   * Converts elements to greedy elements with values for selection
   * @param elements Input elements
   * @returns Elements with selection values
   */
  prepareElements(elements: T[]): GreedyElement<T>[];
}

/**
 * Generic Greedy Algorithm
 * 
 * This class implements the greedy algorithm pattern without any knowledge
 * of the specific optimization problem it's solving.
 */
export class GenericGreedyAlgorithm<T, S> {
  constructor(
    private selectionStrategy: SelectionStrategy<T>,
    private feasibilityChecker: FeasibilityChecker<T, S>,
    private solutionBuilder: SolutionBuilder<T, S>
  ) {}

  /**
   * Executes the greedy algorithm
   * @param elements Input elements to process
   * @returns Greedy solution result
   */
  solve(elements: T[]): GreedyResult<T, S> {
    const startTime = performance.now();
    
    // Prepare elements for selection
    const candidates = this.solutionBuilder.prepareElements(elements);
    const remainingCandidates = [...candidates];
    const selectedElements: T[] = [];
    
    // Initialize solution
    let currentSolution = this.solutionBuilder.createInitialSolution();
    
    // Greedy selection loop
    while (remainingCandidates.length > 0) {
      // Select next best element according to strategy
      const selected = this.selectionStrategy.selectNext(remainingCandidates);
      
      if (!selected) {
        // No more selectable elements
        break;
      }
      
      // Remove selected element from candidates
      const index = remainingCandidates.indexOf(selected);
      remainingCandidates.splice(index, 1);
      
      // Check feasibility
      if (this.feasibilityChecker.isFeasible(currentSolution, selected.element)) {
        // Add to solution
        currentSolution = this.solutionBuilder.addElement(currentSolution, selected.element);
        selectedElements.push(selected.element);
      }
      // If not feasible, continue with next element
    }
    
    const endTime = performance.now();
    
    return {
      solution: currentSolution,
      selectedElements,
      executionTime: endTime - startTime
    };
  }
}