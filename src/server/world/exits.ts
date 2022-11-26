import { Actor } from "models/actor";
import { Direction } from "models/direction";
import { ExitData } from "models/exit";
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
    if(exit.portal) {
        const portal = world.get('portals', exit.portal);
        const destinationRoom = world.get('rooms', exit.exitRoom);
        return portal.events.canSee({ world, actor, direction, portal, startingRoom: actor.room, destinationRoom });
    }

    return true;
}