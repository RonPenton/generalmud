import { Direction } from "../models/direction";
import { ExitData } from "../models/exit";
import { Room } from "../models/room";
import { BaseActorEvent } from "./actor";
import { canAggregate, EventsAggregateConstructor, hasAggregate } from "./base";

export type BaseRoomEvent = BaseActorEvent & {
    room: Room;
}

export type TwoRoomEvent = BaseRoomEvent & {
    other: Room;
    direction?: Direction;
    exit?: ExitData;
    teleported?: boolean;
}
export const RoomEventsBase = {
    canEnter: (_args: TwoRoomEvent) => true,
    hasEntered: (_args: TwoRoomEvent) => { },

    canLeave: (_args: TwoRoomEvent) => true,
    hasLeft: (_args: TwoRoomEvent) => { },

    canLook: (_args: TwoRoomEvent) => true,
    hasLooked: (_args: TwoRoomEvent) => { }
}

export type RoomEvents = Partial<typeof RoomEventsBase>;

export const constructRoomEventsAggregate: EventsAggregateConstructor<'rooms'> = (events) => {

    return {
        canEnter: canAggregate(events, 'canEnter'),   
        hasEntered: hasAggregate(events, 'hasEntered'),
        canLeave: canAggregate(events, 'canLeave'),
        hasLeft: hasAggregate(events, 'hasLeft'),
        canLook: canAggregate(events, 'canLook'),
        hasLooked: hasAggregate(events, 'hasLooked')
    }
}
