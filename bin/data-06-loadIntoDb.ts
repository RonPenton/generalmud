import { Db, getDbInstance } from "../src/server/db";
import { dbCreateObject, dbCreateObjectTable } from "../src/server/db/generic";
import { PortalStorage } from "../src/server/models/portal";
import { RoomStorage } from "../src/server/models/room";
import { RoomDescription } from "../src/server/models/roomDescription";
import { Description, MmudRoom } from "./mmud-room";
import { readLines } from "./readline";

async function loadRooms(db: Db, input: string) {

    await readLines(input, async line => {
        const {
            id,
            Name,
            Desc,
            Exits,
            Light
        }: MmudRoom = JSON.parse(line);

        const room: RoomStorage = {
            id,
            name: Name,
            roomDescription: Desc,
            exits: Exits,
            light: Light,
            money: {},
            hiddenMoney: {}
        };

        await dbCreateObject(db, 'rooms', room);
    });
}

async function loadRoomDescriptions(db: Db, input: string) {
    await readLines(input, async line => {
        const {
            id,
            text
        }: Description = JSON.parse(line);

        const desc: RoomDescription = { id, text };
        await dbCreateObject(db, 'roomDescriptions', desc);
    });
}

async function loadPortals(db: Db, input: string) {
    await readLines(input, async line => {
        const portal: PortalStorage = JSON.parse(line);
        await dbCreateObject(db, 'portals', portal);
    });
}

async function go() {
    const db = await getDbInstance();
    await dbCreateObjectTable(db, 'rooms');
    await dbCreateObjectTable(db, 'roomDescriptions');
    await loadRooms(db, './data/5-json-mod/Rooms.json');
    await loadRoomDescriptions(db, './data/5-json-mod/Descriptions.json');
    await loadPortals(db, './data/5-json-mod/Portals.json');
}

void go();

