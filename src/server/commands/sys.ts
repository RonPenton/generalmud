import { keysOf } from 'tsc-utils';
import { isTable } from '../db/types';
import { Directions, getShortDirection } from '../models/direction';
import { loadScript } from '../scripts/loadScript';
import { falsePromise, installCommand, truePromise } from './base';

const teleports = {
    'silvermere': 12189,
    'newhaven': 12150,
    'rhudaur': 22519,
    'khazarad': 61249,
    'support': 10164
};

installCommand({
    type: 'generic',
    keywords: ["sys", "sysop"],
    helptext: "Invokes Sysop commands.",
    executeText: ({ player, world }) => {
        world.sendToPlayer(player, 'system', { text: 'Invalid Sysop Command!' });
    },
    subCommands: [
        {
            type: 'generic',
            keywords: ['go', 'goto'],
            helptext: 'Teleports user to an area',
            executeText: ({ tokens, player, world }) => {
                const place = tokens[0].toLowerCase().trim();

                if (!place) {
                    world.sendToPlayer(player, 'system', { text: `Valid locations are: ${keysOf(teleports).map(x => x.toUpperCase()).join(', ')}.` });
                    return truePromise;
                }

                const key = keysOf(teleports).find(x => x.startsWith(place));
                if (key) {
                    world.teleport(player, teleports[key]);
                    return truePromise;
                }
                else {
                    world.sendToPlayer(player, 'error', { text: `Sorry, I do not recognize "${tokens[0]}". Valid locations are: ${keysOf(teleports).map(x => x.toUpperCase()).join(', ')}.` });
                    return falsePromise;
                }
            }
        },
        {
            type: 'generic',
            keywords: ['reload'],
            helptext: 'Reloads a script. <type> <script>',
            executeText: async ({ tokens, player, world }) => {
                const [type, script] = tokens;

                if (!isTable(type)) {
                    world.sendToPlayer(player, 'error', { text: `Type ${type} is not a valid table type.` });
                    return true;
                }

                const result = await loadScript(type, script, true);
                if (result) {
                    world.sendToPlayer(player, 'system', { text: `Script ${type}::${script} has been reloaded.` });
                }
                else {
                    world.sendToPlayer(player, 'error', { text: `Script ${type}::${script} could not be loaded.` });
                }
                return true;
            }
        }
    ]
});

Directions.forEach(direction => {
    installCommand({
        type: 'move',
        keywords: [direction, getShortDirection(direction)],
        helptext: `Moves ${direction}.`,
        executeText: ({ player, world }) => {
            world.move(player, direction, 'queue');
        }
    })
});
