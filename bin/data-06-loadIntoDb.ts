import { Db, getDbInstance } from "../src/server/db";
import { dbCreateObject, dbCreateObjectTable } from "../src/server/db/generic";
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



async function go() {
    const db = await getDbInstance();
    await dbCreateObjectTable(db, 'rooms');
    await dbCreateObjectTable(db, 'roomDescriptions');
    await loadRooms(db, './data/5-json-mod/Rooms.json');
    await loadRoomDescriptions(db, './data/5-json-mod/Descriptions.json');
}

void go();

