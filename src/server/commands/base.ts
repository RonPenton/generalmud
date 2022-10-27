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
    message: MessagePacket<T>,
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
    executeText: ExecuteTextFunction;
    executeMessage: ExecuteMessageFunction<T>;
}

export const getCommandReference = (command: Command<any>): CommandReference => {
    const { keywords, helptext } = command;
    return { keywords, helptext };
}

export const falsePromise = new Promise<boolean>(resolve => resolve(false));
export const truePromise = new Promise<boolean>(resolve => resolve(true));

const commands: Command<any>[] = [];

export function installCommand<T extends MessageName = 'generic'>(args: {
    keywords: string | string[],
    helptext: string,
    type: T,
    executeText?: ExecuteTextFunction,
    executeMessage?: ExecuteMessageFunction<T>
}
) {
    const { keywords, helptext, executeText, type, executeMessage } = args;
    const kw = [keywords].flat();
    const command: Command<T> = {
        type,
        keywords: kw,
        helptext,
        executeText: (args) => {
            const { command } = args;
            if (!executeText || !kw.includes(command))
                return falsePromise;
            return executeText(args) ?? truePromise;
        },
        executeMessage: (args) => {
            const { message } = args;
            if (!executeMessage || message.type != type) return falsePromise;
            return executeMessage(args as any) ?? truePromise;
        }
    };
    commands.push(command);
}

export async function executeCommand<T extends MessageName>(world: World, player: PlayerActor, message: MessagePacket<T>) {
    for (const command of commands) {
        const handled = await command.executeMessage({ message, player, world });
        if (handled)
            return true;
    }

    if (message.type == 'text-input' && 'text' in message.message) {
        const { head, tail } = split(message.message.text);
        for (const command of commands) {
            const handled = await command.executeText({ command: head, parameters: tail, player, world });
            if (handled)
                return true;
        }

        // no commands picked up, default to talking. 
        world.say(player, message.message.text);
    }

    return false;
}
