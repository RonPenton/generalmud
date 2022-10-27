import { ActorReference, PlayerReference } from "../models/actor";
import { Direction } from "../models/direction";
import { RoomExits } from "../models/room";
import { HasPlayer } from "./common";

export interface MessageTypes {
    /* input */
    'generic': {},
    'text-input': { text: string },
    'look': { brief?: boolean }
    'say': { text: string },
    'move': { direction: Direction },

    /* output */
    'talk-global': { from: PlayerReference, message: string },
    'talk-room': { from: ActorReference, message: string },
    'talk-private': { from: ActorReference, message: string },
    'actor-moved': { from: ActorReference, entered: boolean, direction?: Direction },
    'room-description': { id: number, name: string, description?: string, exits: RoomExits, actors: ActorReference[], inRoom: boolean }
    'error': { text: string },
    'system': { text: string },
    'connected': HasPlayer,
    'disconnected': HasPlayer,
}

export type MessageName = keyof MessageTypes;

export type MessagePacket<T extends MessageName> = {
    type: T;
    time: number;
    message: MessageTypes[T];
}
