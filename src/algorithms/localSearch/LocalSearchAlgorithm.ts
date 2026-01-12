/**
 * Generic Local Search Algorithm Implementation
 * 
 */

export interface LocalSearchElement<T> {
  element: T;
  value: number; // base on selection strategy -- geometry based, rule based, overlapped
}

export interface LocalSearchResult<T, S> {
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
  selectNext(candidates: LocalSearchElement<T>[]): LocalSearchElement<T> | null;
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
  prepareElements(elements: T[]): LocalSearchElement<T>[];
}

/**
 * Generic Local Search Algorithm
 * 
 * This class implements the local search algorithm pattern without any knowledge
 * of the specific optimization problem it's solving.
 */
export class LocalSearchAlgorithm<T, S> {
  constructor(
    private selectionStrategy: SelectionStrategy<T>,
    private solutionBuilder: SolutionBuilder<T, S>
  ) {}

  /**
   * Executes the greedy algorithm
   * @param elements Input elements to process
   * @returns Greedy solution result
   */
  solve(elements: T[]): LocalSearchResult<T, S> {
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
      currentSolution = this.solutionBuilder.addElement(currentSolution, selected.element);
      selectedElements.push(selected.element);
    }
    
    const endTime = performance.now();
    
    return {
      solution: currentSolution,
      selectedElements,
      executionTime: endTime - startTime
    };
  }
}