import { directionReferences } from '../../models/direction';
import { matchPatterns } from '../../utils/parse';
import { makeScript } from '../base';

declare module '../../models/portal' {
    interface PortalProperties {
        doorOpen?: boolean;
    }
}

export const script = makeScript<'portals'>(
    {
        command: async ({ command, parameters, world, player, portal, direction }) => {

            const tokens = [command, ...parameters]
            const directions = directionReferences(direction);
            if (matchPatterns(tokens, [
                ['open', 'door?', directions],
                ['open', 'door']
            ])) {
                if (portal.properties.doorOpen)
                    return false;
                portal.properties.doorOpen = true;
                world.sendTextToActorsRoom(player, {
                    secondPerson: `You open the door to the ${direction}.`,
                    thirdPerson: `${player.name} opens the door to the ${direction}.`
                });
                return true;
            }
            else if (matchPatterns(tokens, [
                ['close', 'door?', directions],
                ['close', 'door']
            ])) {
                if (!portal.properties.doorOpen)
                    return false;
                portal.properties.doorOpen = false;
                world.sendTextToActorsRoom(player, {
                    secondPerson: `You close the door to the ${direction}.`,
                    thirdPerson: `${player.name} closes the door to the ${direction}.`
                });
                return true;
            }

            return false;
        },

        describe: ({ description, portal }) => {

            let state = 'closed';
            if (portal.properties.doorOpen) {
                state = 'open';
            }
            return `${state} door ${description}`;
        },

        canSeeThrough: ({ portal }) => {
            return !!portal.properties.doorOpen;
        },

        canEnter: ({ portal }) => {
            return !!portal.properties.doorOpen;
        }
    }
);