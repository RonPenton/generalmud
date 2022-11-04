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

export type RoomEvents = Partial<{
    canEnter: (args: TwoRoomEvent) => boolean;
    hasEntered: (args: TwoRoomEvent) => void;

    canLeave: (args: TwoRoomEvent) => boolean;
    hasLeft: (args: TwoRoomEvent) => void;

    canLook: (args: TwoRoomEvent) => boolean;
    hasLooked: (args: TwoRoomEvent) => void;
}>