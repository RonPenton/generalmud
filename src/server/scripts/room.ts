import { ExecuteTextParameters } from "../commands/base";
import { Actor } from "../models/actor";
import { Direction } from "../models/direction";
import { ExitData } from "../models/exit";
import { Portal } from "../models/portal";
import { Room } from "../models/room";
import { World } from "../world/world";
import { BaseActorEvent } from "./actor";
import { canAggregate, commandAggregate, EventsAggregate, hasAggregate, preAggregate } from "./base";

export type BaseRoomEvent = BaseActorEvent & {
    room: Room;
}

export type ActorMovementEvent = {
    world: World;
    actor: Actor;
    startingRoom: Room;
    destinationRoom: Room;
    direction: Direction;
    exit: ExitData;
    portal?: Portal;
}

export const RoomEventsBase = {
    command: (_args: ExecuteTextParameters & { room: Room }) => false,

    canLeave: (_args: ActorMovementEvent) => true,
    tryLeave: (_args: ActorMovementEvent) => true,
    preLeave: (args: ActorMovementEvent) => ({ destinationRoom: args.destinationRoom }),
    hasLeft: (_args: ActorMovementEvent) => { },

    canEnter: (_args: ActorMovementEvent) => true,
    tryEnter: (_args: ActorMovementEvent) => true,
    preEnter: (args: ActorMovementEvent) => ({ destinationRoom: args.destinationRoom }),
    hasEntered: (_args: ActorMovementEvent) => { },

    canLook: (_args: ActorMovementEvent) => true,
    hasLooked: (_args: ActorMovementEvent) => { }
}

export type RoomEvents = Partial<typeof RoomEventsBase>;

export const roomEventsAggregate: EventsAggregate<typeof RoomEventsBase> = {

    command: commandAggregate('command'),

    canLeave: canAggregate('canLeave'),
    tryLeave: canAggregate('tryLeave'),
    preLeave: preAggregate('preLeave'),
    hasLeft: hasAggregate('hasLeft'),

    canEnter: canAggregate('canEnter'),
    tryEnter: canAggregate('tryEnter'),
    preEnter: preAggregate('preEnter'),
    hasEntered: hasAggregate('hasEntered'),

    canLook: canAggregate('canLook'),
    hasLooked: hasAggregate('hasLooked')
}
