export interface GreedyElement {}

export interface GreedyState {
    isComplete(): boolean;
}

export interface OrderingStrategy<E extends GreedyElement> {
    order(elements: readonly E[]): readonly E[];
}

export interface GreedyExtender<E extends GreedyElement, S extends GreedyState> {
    extend(state: S, element: E): S;
}

export class GreedySolver<
    E extends GreedyElement,
    S extends GreedyState
> {
    ordering: OrderingStrategy<E>;
    extender: GreedyExtender<E, S>;

    constructor(ordering: OrderingStrategy<E>, extender: GreedyExtender<E, S>) {
        this.ordering = ordering;
        this.extender = extender;
    }

    solve(
        initialState: S,
        elements: readonly E[],
    ): S {

        let state = initialState;
        const orderedElements = this.ordering.order(elements); 
        for (const element of orderedElements) {
            if (state.isComplete()) break;
            state = this.extender.extend(state, element);
        }

        return state;
    }
}


