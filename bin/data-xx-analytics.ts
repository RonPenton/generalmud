// This file converts the raw MMUD data into GeneralMUD format. 

import { keysOf } from 'tsc-utils';
import { getDirectionOpposite } from '../src/server/models/direction';
import {
    DirectionNames,
    DirectionNos,
    ExitTypes,
    getMMudRoomExit,
    MmudRoom,
    MmudRoomRaw,
    MmudTextblockRaw,
    RoomTypes,
} from './mmud-room';
import { readLines } from './readline';
import { getRoomId } from './utils';

const map = new Map<number, MmudRoom>();

async function analyzeRooms(input: string) {

    let count = 0;

    await readLines(input, async line => {

        const obj: MmudRoomRaw = JSON.parse(line);

        const {
            MapNumber,
            RoomNumber,
            Type,
            Name,
        } = obj;

        const accumulator: MmudRoom['Exits'] = {};

        const exits = DirectionNos.reduce<MmudRoom['Exits']>((acc, dirno) => {

            const dir = DirectionNames[dirno];
            const exitData = getMMudRoomExit(dirno, obj);

            if (exitData.Exit > 0) {

                let exitType = ExitTypes[exitData.Type];
                if (exitType == 'UNSUPPORTED-door') {
                    acc[dir] = { type: 'door', exitRoom: getRoomId(MapNumber, exitData.Exit) };

                    //console.log(JSON.stringify({ MapNumber, RoomNumber, dir, exit: exitData.Exit }));
                    count++;
                }
            }

            return acc;
        }, accumulator);

        if (Object.keys(exits).length > 0) {

            let newRoom: MmudRoom = {
                id: getRoomId(MapNumber, RoomNumber),
                Name,
                Type: RoomTypes[Type].startsWith('UNSUPPORTED') ? 'normal' : RoomTypes[Type],
                Desc: 1,
                Light: 1,
                Exits: exits
            };

            map.set(newRoom.id, newRoom);
        }

    });
    console.log(count);

    for(const room of map.values()) {
        for(const dir of keysOf(room.Exits)) {
            const opp = getDirectionOpposite(dir);
            const exit = room.Exits[dir]!;

            const otherRoom = map.get(exit.exitRoom);
            if(!otherRoom) {
                console.log(`Can't find room. From: ${room.id}, dir: ${dir}, to: ${exit.exitRoom}`);
            }
        }
    }
}

async function analyzeTextblocks(input: string) {

    const set = new Set<number>();

    await readLines(input, async line => {

        const obj: MmudTextblockRaw = JSON.parse(line);
        const {
            data,
        } = obj;

        const reg = /teleport (\d+) (\d+)/i;
        const res = reg.exec(data);
        if(res) {
            const room = getRoomId(parseInt(res[2]), parseInt(res[1]));
            set.add(room);
        }
    });

    const arr = Array.from(set.values());
    arr.sort((a, b) => a - b);
    console.log(arr.join(', '));
}


//void analyzeRooms('./data/4-json/Rooms.json');

void analyzeTextblocks('./data/3-jsonraw/Textblocks.json');
