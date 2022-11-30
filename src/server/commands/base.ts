import { World } from "../world/world";
import { MessageName, MessagePacket } from "../messages";
import { PlayerActor } from "../models/actor";
import { keysOf } from "tsc-utils";
import { getTokens } from "../utils/parse";

export type ExecuteTextParameters = {
    tokens: string[];
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
export type ExecuteTextWith<T> = (params: ExecuteTextParameters & T) => (Promise<boolean> | void);


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
            const { tokens, world, player } = args;
            const [command, ...tail] = tokens;
            if (keywords.includes(command)) {

                for (const sub of subs) {
                    const result = await sub.executeText({ tokens: tail, world, player });
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
    packet: MessagePacket<T>
) {

    for (const command of RootCommands) {
        if (command.executeMessage) {
            const handled = await command.executeMessage({ packet, player, world });
            if (handled)
                return true;
        }
    }

    if (packet.type == 'text-input' && 'text' in packet.message) {
        const tokens = getTokens(packet.message.text);

        const args = { tokens, player, world };
        const room = player.room;

        // check room first. 
        let handled = room.events.command({ ...args, room: player.room });
        if (handled)
            return true;

        // next portals.
        handled = keysOf(room.exits)
            .map(direction => ({ direction, exit: room.exits[direction] }))
            .filter(x => !!x.exit?.portal)
            .map(({ direction, exit }) => ({ direction, portal: world.getPortal(exit!.portal!) }))
            .reduce((acc, { direction, portal }) => acc || portal.events.command({ ...args, direction, portal }), false);
        if (handled)
            return true;

        for (const command of RootCommands) {
            if (command.executeText) {
                const handled = await command.executeText(args);
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
