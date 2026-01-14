// this is the strategy of neighborhood
export interface NeighborhoodStrategy<S extends State> {
  generateNeighbors(state: S): readonly S[];
}

// do the Geometrybased first
export interface Geometrybased<
  S extends State,
> extends NeighborhoodStrategy<S> {
  // geometry-specific parameters only
}

export interface Rulebased {}
export interface PartialOververlap {}

// State means the state of the solution
export interface State {
  isCompleted(): boolean;
  evaluate(): number; // lower means better
}

export class LocalSearchSolver<S extends State> {
  private neighborhood: NeighborhoodStrategy<S>;
  private maxIterations: number;

  constructor(neighborhood: NeighborhoodStrategy<S>, maxIterations = 1000) {
    this.neighborhood = neighborhood;
    this.maxIterations = maxIterations;
  }

  solve(initialState: S): S {
    let current = initialState;
    let currentScore = current.evaluate();

    let iteration = 0;

    while (!current.isCompleted() && iteration < this.maxIterations) {
      const neighbors = this.neighborhood.generateNeighbors(current);

      let bestNeighbor = current;
      let bestScore = currentScore;

      for (const n of neighbors) {
        const score = n.evaluate();
        if (score < bestScore) {
          bestNeighbor = n;
          bestScore = score;
        }
      }

      // no improvement
      if (bestScore >= currentScore) {
        break;
      }

      current = bestNeighbor;
      currentScore = bestScore;
      iteration++;
    }

    return current;
  }
}
