import { Candidate } from "../types/candidate";
import { State } from "../types/state";
import { Rectangle } from "./rectangle";
import { PackingSolution } from "./solution";
import { Box } from "./box";
import { BottomLeftPacking } from "./BottomLeftPacker";
import { FirstFitPlacer } from "./FirstFitPlacer";
import { GreedySolver } from "./greedy";
import { LocalSearchSolver } from "./localsearch";

export abstract class Algorithm<C extends Candidate, S extends State> {
    abstract solve(initialState: S, candidates: readonly C[]): S;
}

export {
    GreedySolver,
    LocalSearchSolver,
    BottomLeftPacking,
    FirstFitPlacer,
    Box,
    PackingSolution,
    Rectangle,
};
