import { World } from "../world/world";
import { MessageName, MessagePacket } from "../messages";
import { PlayerActor } from "../models/actor";
import { split } from "../utils/parse";

export type ExecuteTextParameters = {
    command: string;
    parameters: string;
    player: PlayerActor;
    world: World;
}

export type ExecuteMessageParameters<T extends MessageName> = {
    packet: MessagePacket<T>,
    player: PlayerActor,
    world: World
}

export type ExecuteTextFunction = (params: ExecuteTextParameters) => (Promise<boolean> | void);
export type ExecuteMessageFunction<T extends MessageName> = (params: ExecuteMessageParameters<T>) => (Promise<boolean> | void);

export interface CommandReference {
    keywords: string[];
    helptext: string;
}


export interface Command<T extends MessageName> extends CommandReference {
    type: T;
    executeText?: ExecuteTextFunction;
    executeMessage?: ExecuteMessageFunction<T>;
    subCommands?: Command<T>[];
}

export interface FilledCommand<T extends MessageName> extends CommandReference {
    type: T;
    executeText: ExecuteTextFunction;
    executeMessage: ExecuteMessageFunction<T>;
    subCommands: FilledCommand<T>[];
}

export const getCommandReference = (command: Command<any>): CommandReference => {
    const { keywords, helptext } = command;
    return { keywords, helptext };
}

export const falsePromise = new Promise<boolean>(resolve => resolve(false));
export const truePromise = new Promise<boolean>(resolve => resolve(true));

export const RootCommands: Command<any>[] = [];

function wrapCommand<T extends MessageName>(args: Command<T>): FilledCommand<T> {
    const { keywords, helptext, executeText, type, executeMessage, subCommands = [] } = args;

    const subs = subCommands.map(wrapCommand);

    const cmd: FilledCommand<T> = {
        type,
        keywords,
        helptext,
        executeText: async (args) => {
            const { command, parameters, world, player } = args;
            if (keywords.includes(command)) {

                const { head, tail } = split(parameters);
                for (const sub of subs) {
                    const result = await sub.executeText({ command: head, parameters: tail, world, player });
                    if (result) {
                        return result;
                    }
                }

                if (executeText) {
                    return executeText(args) ?? truePromise;
                }
            }

            return falsePromise;
        },
        executeMessage: (args) => {
            const { packet } = args;
            if (!executeMessage || packet.type != type) return falsePromise;
            return executeMessage(args as any) ?? truePromise;
        },
        subCommands: subs
    };

    return cmd;
}

export function installCommand<T extends MessageName = 'generic'>(args: Command<T>) {
    const command = wrapCommand(args);
    RootCommands.push(command);
}

export async function executeCommand<T extends MessageName>(
    world: World,
    player: PlayerActor,
    packet: MessagePacket<T>,
    commands: Command<any>[] = RootCommands
) {
    for (const command of commands) {
        if (command.executeMessage) {
            const handled = await command.executeMessage({ packet, player, world });
            if (handled)
                return true;
        }
    }

    if (packet.type == 'text-input' && 'text' in packet.message) {
        const { head, tail } = split(packet.message.text);
        for (const command of commands) {
            if (command.executeText) {
                const handled = await command.executeText({ command: head, parameters: tail, player, world });
                if (handled)
                    return true;
            }
        }

        // no commands picked up, default to talking. 
        world.say(player, packet.message.text);
        return true;
    }

    return false;
}
