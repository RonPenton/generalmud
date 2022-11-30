import { Db, getDbInstance } from "../src/server/db";
import { dbUpsertObject } from "../src/server/db/generic";
import { RoomStorage } from "../src/server/models/room";
import { MmudRoom } from "./mmud-room";
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

        await dbUpsertObject(db, 'rooms', room)
    });
}

async function go() {
    const db = await getDbInstance();
    await loadRooms(db, './data/5-json-mod/Rooms-patch.json');
}

void go();

