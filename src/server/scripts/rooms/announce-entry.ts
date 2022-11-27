import { RoomEvents } from "../room";

export default class AnnounceEntry extends RoomEvents {
    constructor(private args: { uppercase: boolean }) {

    }

        hasEntered: ({ world, actor, parameters }) => {
            if (uppercase) {
                world.sendToRoom(actor, 'system', { text: `An announcer shouts "${actor.name.toUpperCase()} HAS ENTERED THE TOWN SQUARE".` });
            }
            else {
                world.sendToRoom(actor, 'system', { text: `An announcer shouts "${actor.name} has entered the Town Square".` });
            }
        }
    }
);