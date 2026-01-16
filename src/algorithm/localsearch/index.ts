import { Algorithm } from "..";
import type { Candidate, State } from "../../types";

// this is the strategy of neighborhood
export interface LocalPacker<C extends Candidate> {
    search(candidate: C): readonly C[];
}

export { NeighborhoodAdapter } from "./NeighborhoodAdapter";
export { createBadInitialSolution } from "./initialSolution";

export class LocalSearchSolver<S extends State> implements Algorithm<never, S> {
    private neighborhood: LocalPacker<S>;
    private maxIterations: number;

    constructor(neighborhood: LocalPacker<S>, maxIterations = 1000) {
        this.neighborhood = neighborhood;
        this.maxIterations = maxIterations;
    }

    solve(initialState: S, _candidates: readonly never[]): S {
        let currentState = initialState;
        const initialEvaluate = currentState.evaluate?.() ?? -Infinity;
        let currentScore = initialEvaluate;

        let iteration = 0;

        while (!currentState.isCompleted() && iteration < this.maxIterations) {
            const neighborStates = this.neighborhood.search(currentState);

            let bestState = currentState;
            let bestScore = currentScore;

            for (const state of neighborStates) {
                const score = state.evaluate?.() ?? -Infinity;

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
