import { getPlayerReference } from '../models/actor';
import { installCommand } from './base';

installCommand({
    type: 'talk-global',
    keywords: ["chat", "ch", "gos", "gossip"],
    helptext: "Initiates a global chat command that will be seen by everyone on the server.",
    executeText: ({ tokens, player, world }) => {
        world.sendToAll('talk-global', { from: getPlayerReference(player), message: tokens.join(' ') });
    }
});

installCommand({
    type: 'say',
    keywords: ["say"],
    helptext: "Speaks text to the people in your current location.",
    executeText: ({ tokens, player, world }) => {
        world.say(player, tokens.join(' '));
    },
    executeMessage: ({ packet, player, world }) => {
        world.say(player, packet.message.text);
    }
});

installCommand({
    type: 'generic',
    keywords: ["whisper", "wh"],
    helptext: "Sends a private communication to a person on the server.",
    executeText: ({ tokens, player, world }) => {
        const [target, ...text] = tokens;
        world.whisper(player, target, text.join(' '));
    }
});
