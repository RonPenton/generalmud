import { Direction } from "./direction";

export type ExitData = {
    exitRoom: number;
    portal?: number;
}

/**
 * A structure used to communicate with the client about an exit.
 */
export type ExitSummary = {
    name: string;
    exitRoom: number;
    direction: Direction
}
