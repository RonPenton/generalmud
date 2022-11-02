import { Directions, getShortDirection } from '../models/direction';
import { installCommand } from './base';

installCommand({
    type: 'move',
    keywords: ["move"],
    helptext: "Moves in a direction.",
    executeMessage: ({ packet, player, world }) => {
        world.move(player, packet.message.direction, 'queue');
    }
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
