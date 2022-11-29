import { ExecuteTextParameters } from "../commands/base";
import { Direction } from "../models/direction";
import { Portal } from "../models/portal";
import { canAggregate, commandAggregate, describeAggregate, EventsAggregate, hasAggregate, preAggregate } from "./base";
import { ActorMovementEvent } from "./room";

export type PortalEvent = Required<ActorMovementEvent>;

export type DescribePortalEvent = PortalEvent & {
    description: string;
}

export const PortalEventsBase = {

    command: (_args: ExecuteTextParameters & { portal: Portal, direction: Direction }) => false,

    canSee: (_args: PortalEvent) => true,
    canSeeThrough: (_args: PortalEvent) => true,

    canEnter: (_args: PortalEvent) => true,
    tryEnter: (_args: PortalEvent) => true,
    preEnter: (args: PortalEvent) => ({ destinationRoom: args.destinationRoom }),
    hasEntered: (_args: PortalEvent) => { },

    describe: (args: DescribePortalEvent) => args.description
}

export type PortalEvents = Partial<typeof PortalEventsBase>;

export const portalEventsAggregate: EventsAggregate<typeof PortalEventsBase> = {
    canEnter: canAggregate('canEnter'),
    tryEnter: canAggregate('tryEnter'),
    hasEntered: hasAggregate('hasEntered'),

    canSee: canAggregate('canSee'),
    canSeeThrough: canAggregate('canSeeThrough'),
    command: commandAggregate('command'),
    describe: describeAggregate('describe'),
    preEnter: preAggregate('preEnter')
}
