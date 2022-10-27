import { MessageName, MessagePacket } from "../../server/messages";
import { ActorReference } from "../../server/models/actor";
import { GameContext, Player } from "../App";

export type ExecuteFunction<T extends MessageName> = (message: MessagePacket<T>, context: GameContext) => (Promise<boolean> | void);

export type ClientCommand<T extends MessageName> = {
    name: T,
    execute: ExecuteFunction<T>
}

const commands = new Map<string, ClientCommand<any>>();
const installClientCommand = <T extends MessageName>(command: ClientCommand<T>) => {
    commands.set(command.name, command);
}

export const createClientCommand = <T extends MessageName>(name: T, execute: ExecuteFunction<T>): ClientCommand<T> => {
    const command = { name, execute };
    installClientCommand(command);
    return command;
}

export const getClientCommand = <T extends MessageName>(name: T): ClientCommand<T> | null => {
    const command = commands.get(name);
    return command ?? null;
}

export function isMe(actor: ActorReference) {
    return Player.id == actor.id;
}

export function isNotMe(actor: ActorReference) {
    return !isMe(actor);
}
