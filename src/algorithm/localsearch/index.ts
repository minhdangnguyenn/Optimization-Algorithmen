// this is the strategy of neighborhood
export interface NeighborhoodStrategy<S extends State> {
  generateNeighbors(state: S): readonly S[];
}

// State means the state of the solution
export interface State {
  isCompleted(): boolean;
  evaluate(): number; // higher means better, my idea: get the utilization
}

export class LocalSearchSolver<S extends State> {
  private neighborhood: NeighborhoodStrategy<S>;
  private maxIterations: number;

  constructor(neighborhood: NeighborhoodStrategy<S>, maxIterations = 1000) {
    this.neighborhood = neighborhood;
    this.maxIterations = maxIterations;
  }

  solve(initialState: S): S {
    let currentState = initialState;
    let currentScore = currentState.evaluate();

    let iteration = 0;

    while (!currentState.isCompleted() && iteration < this.maxIterations) {
      const neighborStates = this.neighborhood.generateNeighbors(currentState);

      let bestState = currentState;
      let bestScore = currentScore;

      for (const state of neighborStates) {
        const score = state.evaluate();

        // the the current score and current state is better than the best then update the best
        if (score > bestScore) {
          bestState = state;
          bestScore = score;
        }
      }

      // no improvement then skip
      if (bestScore <= currentScore) {
        break;
      }

      // else if new result is better, keep tracking
      currentState = bestState;
      currentScore = bestScore;
      iteration++;
    }

    return currentState;
  }
}
