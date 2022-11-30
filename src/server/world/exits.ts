import { keysOf } from "tsc-utils";
import { Actor } from "../models/actor";
import { Direction, Directions } from "../models/direction";
import { ExitData, ExitSummary } from "../models/exit";
import { Room } from "../models/room";
import { World } from "./world";

export interface ExitProperties {
    world: World,
    actor: Actor,
    direction: Direction,
    exit: ExitData
}

export function canSeeExit({
    world,
    actor,
    direction,
    exit
}: ExitProperties) {
    if (exit.portal) {
        const portal = world.get('portals', exit.portal);
        const destinationRoom = world.get('rooms', exit.exitRoom);
        return portal.events.canSee({ world, actor, direction, exit, portal, startingRoom: actor.room, destinationRoom });
    }

    return true;
}

export function describeExit({
    world,
    actor,
    direction,
    exit
}: ExitProperties) {
    if (exit.portal) {
        const portal = world.get('portals', exit.portal);
        const destinationRoom = world.get('rooms', exit.exitRoom);
        return portal.events.describe({ world, actor, direction, portal, startingRoom: actor.room, destinationRoom, exit, description: direction });
    }

    return direction;
}

export function listExits(world: World, room: Room, actor: Actor): ExitSummary[] {
    const directions = keysOf(room.exits);
    return Directions
        .filter(direction => directions.includes(direction))
        .filter(direction => canSeeExit({ world, actor, direction, exit: room.exits[direction]! }))
        .map(direction => ({
            name: describeExit({ world, actor, direction, exit: room.exits[direction]! }),
            direction,
            exitRoom: room.exits[direction]!.exitRoom
        }));
}
