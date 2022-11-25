import { keysOf } from 'tsc-utils';
import { typeArrayValidator } from '../utils/typeArrayValidator';

export const DirectionDefinitions = {
    "north": { short: "n" },
    "south": { short: "s" },
    "east": { short: "e" },
    "west": { short: "w" },
    "northeast": { short: "ne" },
    "southwest": { short: "sw" },
    "northwest": { short: "nw" },
    "southeast": { short: "se" },
    "up": { short: "u", leaving: "upwards", entering: "from above" },
    "down": { short: "d", leaving: "downwards", entering: "from below" },
} as const;

const dd = DirectionDefinitions;

export type Direction = keyof typeof dd;
export type DirectionShort = typeof dd[Direction]['short'];

export const Directions = keysOf(dd);
export const DirectionsShort = keysOf(dd).map(x => dd[x].short);

export const isDirection = typeArrayValidator(Directions);
export const isShortDirection = typeArrayValidator(DirectionsShort);

const DirectionOpposites = new Map<Direction, Direction>(Directions.map((x, i) => {
    if (i % 2 == 0) {
        return [x, Directions[i + 1]];
    }
    else {
        return [x, Directions[i - 1]];
    }
}));

export function getShortDirection(d: Direction): DirectionShort {
    return dd[d].short;
}

export const getLeavingPhrase = (direction: Direction) => {
    const def = dd[direction];
    if ('leaving' in def) {
        return def.leaving;
    }
    return `to the ${direction}`;
}

export const getEnteringPhrase = (direction: Direction) => {
    const def = dd[direction];
    if ('entering' in def) {
        return def.entering;
    }
    return `from the ${direction}`;
}

export const getDirectionOpposite = (direction: Direction) => {
    return DirectionOpposites.get(direction)!;
}

export const directionReferences = (direction: Direction): string[] => {
    return [direction, getShortDirection(direction)];
}
