export interface Neighborhood {}

// do the Geometrybased first
export interface Geometrybased { }


export interface Rulebased {}
export interface PartialOververlap {}

export interface State {
    isCompleted(): boolean;
}

export class LocalSearchSolver <
    E extends Neighborhood,
    S extends State
> {
  neigborhoodType:
}
