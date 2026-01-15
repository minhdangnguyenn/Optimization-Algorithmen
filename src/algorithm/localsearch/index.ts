import { Algorithm } from "..";
import { State } from "../../interfaces/state";

// this is the strategy of neighborhood
export interface LocalPacker<S extends State> {
  generateNeighbors(state: S): readonly S[];
}

export class LocalSearchSolver<S extends State> implements Algorithm<never, S> {
  private neighborhood: LocalPacker<S>;
  private maxIterations: number;

  constructor(neighborhood: LocalPacker<S>, maxIterations = 1000) {
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
