import { getPlayerReference } from '../models/actor';
import { split } from '../utils/parse';
import { installCommand } from './base';

installCommand({
    type: 'talk-global',
    keywords: ["chat", "ch"],
    helptext: "Initiates a global chat command that will be seen by everyone on the server.",
    executeText: ({ parameters, player, world }) => {
        world.sendToAll('talk-global', { from: getPlayerReference(player), message: parameters.trim() });
    }
});

installCommand({
    type: 'say',
    keywords: "say",
    helptext: "Speaks text to the people in your current location.",
    executeText: ({ parameters, player, world }) => {
        world.say(player, parameters);
    },
    executeMessage: ({ message, player, world }) => {
        world.say(player, message.message.text);
    }
});

installCommand({
    type: 'generic',
    keywords: ["whisper", "wh"],
    helptext: "Sends a private communication to a person on the server.",
    executeText: ({ parameters, player, world }) => {
        const { head, tail } = split(parameters);
        world.whisper(player, head, tail);
    }
});
