import { Direction } from "../models/direction";
import { ExitData } from "../models/exit";
import { Room } from "../models/room";
import { BaseActorEvent } from "./actor";

export type BaseRoomEvent = BaseActorEvent & {
    room: Room;
}

export type TwoRoomEvent = BaseRoomEvent & {
    other: Room;
    direction?: Direction;
    exit?: ExitData;
    teleported?: boolean;
}

export abstract class RoomEvents {
    canEnter(_args: TwoRoomEvent): boolean { return true; }
    hasEntered(_args: TwoRoomEvent): void { }

    canLeave(_args: TwoRoomEvent): boolean { return true; }
    hasLeft(_args: TwoRoomEvent): void { }

    canLook(_args: TwoRoomEvent): boolean { return true; }
    hasLooked(_args: TwoRoomEvent): void { }
}

export class RoomEventsAggregate implements RoomEvents {
    constructor(private events: RoomEvents[]) { }

    canEnter(args: TwoRoomEvent) { return this.events.reduce((acc, e) => e.canEnter(args) && acc, true); }
    hasEntered(args: TwoRoomEvent) { this.events.forEach(e => e.hasEntered(args)) }

    canLeave(args: TwoRoomEvent) { return this.events.reduce((acc, e) => e.canLeave(args) && acc, true); }
    hasLeft(args: TwoRoomEvent) { this.events.forEach(e => e.hasLeft(args)) }

    canLook(args: TwoRoomEvent) { return this.events.reduce((acc, e) => e.canLook(args) && acc, true); }
    hasLooked(args: TwoRoomEvent) { this.events.forEach(e => e.hasLooked(args)) }
}
