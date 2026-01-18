import { Candidate } from "./candidate";
import { State } from "./state";

export interface Extender<E extends Candidate, S extends State> {
    extend(state: S, element: E): S;
}
