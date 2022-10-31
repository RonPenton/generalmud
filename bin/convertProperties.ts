import fs from 'fs';
import { PartialRecord } from 'tsc-utils';
import { hashText } from '../src/server/utils/hashText';
import {
    Description,
    Direction,
    DirectionNames,
    DirectionNos,
    ExitData,
    ExitType,
    ExitTypes,
    getMMudRoomExit,
    MmudRoom,
    MmudRoomRaw,
    MonsterTypes,
    RoomTypes
} from './mmud-room';
import { readLines } from './readline';


async function convertProperties(input: string, output: string) {
    const out = fs.createWriteStream(output, { encoding: 'utf-8' });

    const writeLine = async (line: string) => {
        return new Promise(resolve => {
            out.write(line + '\n', resolve);
        });
    }

    await readLines(input, async line => {

        const obj = JSON.parse(line);
        let newObj: any = {};
        for (const key of Object.keys(obj)) {
            const newKey = key.replace(/\s/g, '');
            const val = obj[key];
            const test = (+val);
            if (isNaN(test) || val == '') {
                newObj[newKey] = obj[key];
            }
            else {
                newObj[newKey] = parseInt(val);
            }
        }
        await writeLine(JSON.stringify(newObj));
        return Promise.resolve();
    });

    out.close();
}

function joinLines(...lines: string[]) {
    return lines.map(x => x.trim()).join(' ').trim();
}

function getRoomId(mapNumber: number, roomNumber: number) {
    const str = `${mapNumber}${roomNumber.toString().padStart(4, '0')}`;
    return parseInt(str);
}

async function convertRooms(input: string, output: string, descriptionOutput: string) {
    const out = fs.createWriteStream(output, { encoding: 'utf-8' });
    const outDesc = fs.createWriteStream(descriptionOutput, { encoding: 'utf-8' });
    const descriptions = new Map<number, string>();

    const writeLine = async (line: string) => {
        return new Promise(resolve => {
            out.write(line + '\n', resolve);
        });
    }

    const writeDescriptionLine = async (line: string) => {
        return new Promise(resolve => {
            outDesc.write(line + '\n', resolve);
        });
    }

    await readLines(input, async line => {

        const obj: MmudRoomRaw = JSON.parse(line);

        const {
            MapNumber,
            RoomNumber,
            Name,
            Desc0,
            Desc1,
            Desc2,
            Desc3,
            Desc4,
            Desc5,
            Desc6,
            // AnsiMap: _ansi,
            Type,
            // MonType,
            Light,
            // // Runic: _r1, Platinum: _p1, Gold: _g1, Silver: _s1, Copper: _c1, InvisRunic: _r2, InvisPlatinum: _p2, InvisGold: _g2, InvisSilver: _s2, InvisCopper: _c2,
            // ...rest
        } = obj;

        const accumulator: MmudRoom['Exits'] = {};

        const exits = DirectionNos.reduce<MmudRoom['Exits']>((acc, dirno) => {
            const dir = DirectionNames[dirno];
            const exitData = getMMudRoomExit(dirno, obj);
            if (exitData.Exit > 0) {
                let exitType = ExitTypes[exitData.Type];
                if (exitType == 'UNSUPPORTED-remote-action') {
                    return acc; // don't support remote actions.
                }
                if (exitType.startsWith('UNSUPPORTED')) {
                    exitType = 'normal';
                }

                switch (exitType) {
                    case 'normal':
                        acc[dir] = { type: 'normal', exitRoom: getRoomId(MapNumber, exitData.Exit) };
                        break;
                    case 'UNSUPPORTED-map-change':
                        acc[dir] = { type: 'normal', exitRoom: getRoomId(exitData.Para1, exitData.Exit) }
                        break;
                }
            }

            return acc;
        }, accumulator);

        const desc = joinLines(Desc0, Desc1, Desc2, Desc3, Desc4, Desc5, Desc6);
        const descHash = hashText(desc);
        if (!descriptions.has(descHash)) {
            descriptions.set(descHash, desc);
            const description: Description = {
                id: descHash,
                text: desc
            };
            await writeDescriptionLine(JSON.stringify(description));
        }

        let newRoom: MmudRoom = {
            id: getRoomId(MapNumber, RoomNumber),
            Name,
            Type: RoomTypes[Type].startsWith('UNSUPPORTED') ? 'normal' : RoomTypes[Type],
            Desc: descHash,
            Light,
            Exits: exits
        };

        await writeLine(JSON.stringify(newRoom));
    });

    out.close();
}

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


//void convertProperties('./data/3-jsonraw/Rooms.json', './data/4-json/Rooms.json');
//void convertProperties('./data/3-jsonraw/Rooms.json', './data/4-json/Rooms.json'); 

void convertRooms('./data/4-json/Rooms.json', './data/5-json-mod/Rooms.json', './data/5-json-mod/Descriptions.json');


//void sortRooms('./data/4-json/Rooms.json', './data/4-json/Rooms-sorted.json')