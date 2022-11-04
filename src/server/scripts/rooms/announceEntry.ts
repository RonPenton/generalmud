import { RoomEvents } from '../room';

export const script: RoomEvents = {
    hasEntered: ({ world, actor }) => {
        world.sendToRoom(actor, 'system', { text: `An announcer shouts "${actor.name.toUpperCase()} HAS ENTERED THE TOWN SQUARE".` });
    }
}