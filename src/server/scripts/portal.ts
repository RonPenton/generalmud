import { ExecuteTextParameters } from "../commands/base";
import { Actor } from "../models/actor";
import { Direction } from "../models/direction";
import { Portal } from "../models/portal";
import { Room } from "../models/room";
import { World } from "../world/world";
import { canAggregate, commandAggregate, describeAggregate, EventsAggregateConstructor, hasAggregate, preAggregate } from "./base";

export type PortalEvent = {
    world: World;
    portal: Portal;
    actor: Actor;
    startingRoom: Room;
    destinationRoom: Room;
    direction: Direction;
}

export type DescribePortalEvent = PortalEvent & {
    description: string;
}

export const PortalEventsBase = {

    command: (_args: ExecuteTextParameters & { portal: Portal, direction: Direction }) => false,

    canSee: (_args: PortalEvent) => true,
    canSeeThrough: (_args: PortalEvent) => true,

    canEnter: (_args: PortalEvent) => true,
    preEnter: (args: PortalEvent) => args,
    hasEntered: (_args: PortalEvent) => { },

    describe: (args: DescribePortalEvent) => args.description
}

export type PortalEvents = Partial<typeof PortalEventsBase>;

export const constructPortalEventsAggregate: EventsAggregateConstructor<'portals'> = (events) => {

    return {
        canEnter: canAggregate(events, 'canEnter'),   
        hasEntered: hasAggregate(events, 'hasEntered'),
        canSee: canAggregate(events, 'canSee'),
        canSeeThrough: canAggregate(events, 'canSeeThrough'),
        command: commandAggregate(events, 'command'),
        describe: describeAggregate(events, 'describe'),
        preEnter: preAggregate(events, 'preEnter')
    }
}
