// This file sorts the rooms so that they are in order.

import fs from 'fs';
import { readLines } from "./readline";

async function sortRooms(input: string, output: string) {
    const out = fs.createWriteStream(output, { encoding: 'utf-8' });

    const writeLine = async (line: string) => {
        return new Promise(resolve => {
            out.write(line + '\n', resolve);
        });
    }

    const sorted: Array<Array<any>> = [];


    await readLines(input, async line => {

        const obj: any = JSON.parse(line);

        const {
            MapNumber,
            RoomNumber,
        } = obj;

        let row = sorted[MapNumber];
        if (!row) {
            row = [];
            sorted[MapNumber] = row;
        }
        row[RoomNumber] = obj;

    });

    console.log('Sorting...');

    sorted.sort((a, b) => a.find(x => x !== undefined).MapNumber - b.find(x => x !== undefined).MapNumber);
    for (const row of sorted) {
        if (!row)
            continue;
        row.sort((a, b) => a.RoomNumber - b.RoomNumber);
    }

    console.log('Writing...');

    for (const row of sorted) {
        if (!row)
            continue;
        for (const room of row) {
            if (!room)
                continue;
            await writeLine(JSON.stringify(room))
        }
    }

    out.close();
}

void sortRooms('./data/4-json/Rooms.json', './data/4-json/Rooms-sorted.json')