import { directionReferences } from '../../models/direction';
import { matchPatterns, split } from '../../utils/parse';
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