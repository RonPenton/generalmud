import { keysOf } from 'tsc-utils';
import { Directions, getShortDirection } from '../models/direction';
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
    keywords: ["sys"],
    helptext: "Invokes Sysop commands.",
    executeText: ({ player, world }) => {
        world.sendToPlayer(player, 'system', { text: 'Invalid Sysop Command!' });
    },
    subCommands: [
        {
            type: 'generic',
            keywords: ['go', 'goto'],
            helptext: 'Teleports user to an area',
            executeText: ({ parameters, player, world }) => {
                const place = parameters.toLowerCase().trim();

                if(!place) {
                    world.sendToPlayer(player, 'system', { text: `Valid locations are: ${keysOf(teleports).map(x => x.toUpperCase()).join(', ')}.` });
                    return truePromise;
                }

                const key = keysOf(teleports).find(x => x.startsWith(place));
                if(key) {
                    world.teleport(player, teleports[key]);
                    return truePromise;
                }
                else {
                    world.sendToPlayer(player, 'error', { text: `Sorry, I do not recognize "${parameters}". Valid locations are: ${keysOf(teleports).map(x => x.toUpperCase()).join(', ')}.` });
                    return falsePromise;
                }
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
