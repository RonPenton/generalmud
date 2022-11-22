import { ProxyObject } from "../db/types";
import { EventDefinition } from "../scripts/base";
import { Wallet } from "./wallet";


export interface PlayerData {
    uniqueName: string;
    passwordHash: string;
    created: string;
    lastLogin: string;
    suspendedUntil?: string;
    suspensionReason?: string;
}

export interface ActorStorage {
    id: number;
    name: string;
    wallet: Wallet;

    playerData?: PlayerData;

    room: number;

    events?: EventDefinition[];
}

export type Actor = ProxyObject<'actors'>;

export type ActorReference = {
    name: string;
    id: number;
}

export type PlayerReference = ActorReference & {
    uniqueName: string;
}

export const getActorReference = (actor: Actor): ActorReference => {
    const { name, id } = actor;
    return { name, id };
}

export type PlayerActor = Omit<Actor, 'playerData'> & { playerData: PlayerData };

export function isPlayer(actor: Actor): actor is PlayerActor {
    return !!actor.playerData;
}

export const getPlayerReference = (player: PlayerActor): PlayerReference => {
    const { name, id, playerData: { uniqueName } } = player;
    return { name, id, uniqueName };
}

export const isInvalidName = (name: string): boolean => {
    return name.match(/[^A-Za-z]/g) !== null;
}

export const getCanonicalName = (name: string): string => {
    return name.toLowerCase();
}

const name = (actor: Actor) => {
    return isPlayer(actor) ? actor.playerData.uniqueName : getCanonicalName(actor.name);
}

export function findActorMatch<T extends Actor>(partialName: string, actors: T[]): T | undefined {
    const partial = getCanonicalName(partialName);

    return actors.find(x => name(x) == partial)          // match exact names first.
        ?? actors.find(x => name(x).startsWith(partial)) // then partials if none found.
}