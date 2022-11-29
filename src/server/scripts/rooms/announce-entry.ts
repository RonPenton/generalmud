import { makeScript } from '../base';

export const script = makeScript<'rooms', { uppercase: boolean }>(
    {
        hasEntered: ({ world, actor, parameters: { uppercase } }) => {
            if (uppercase) {
                world.sendToRoom(actor, 'system', { text: `The announcer shouts "${actor.name.toUpperCase()} HAS ENTERED THE TOWN SQUARE".` });
            }
            else {
                world.sendToRoom(actor, 'system', { text: `The announcer shouts "${actor.name} has entered the Town Square".` });
            }
        }
    }
);