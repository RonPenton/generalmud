import { Db, getDbInstance } from "../src/server/db";
import { dbCreateObject, dbCreateObjectTable } from "../src/server/db/generic";
import { Room } from "../src/server/models/room";
import { MmudRoom } from "./mmud-room";
import { readLines } from "./readline";
import { Storage } from '../src/server/db/generic';

async function loadRooms(db: Db, input: string) {

    const writeRoom = async (room: MmudRoom) => {
        return new Promise(resolve => {
            //out.write(line + '\n', resolve);
        });
    }

    await readLines(input, async line => {
        const {
            id,
            Name,
            Desc,
            Exits,
            Light
        }: MmudRoom = JSON.parse(line);

        const room: Storage<Room> = {
            id,
            name: Name,
            desc: Desc,
            exits: Exits,
            light: Light,
            actors: [],
            items: [],
            money: {},
            hiddenMoney: {}
        };

        await dbCreateObject(db, 'rooms', room);
    });
}


async function go() {
    const db = await getDbInstance();
    await dbCreateObjectTable(db, 'rooms');
    await loadRooms(db, './data/5-json-mod/Rooms.json');
}

void go();

