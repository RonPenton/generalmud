// This file converts the raw MMUD data into GeneralMUD format. 

import fs from 'fs';
import { hashText } from '../src/server/utils/hashText';
import {
    Description,
    DirectionNames,
    DirectionNos,
    ExitTypes,
    getMMudRoomExit,
    MmudRoom,
    MmudRoomRaw,
    RoomTypes
} from './mmud-room';
import { readLines } from './readline';
import { getRoomId } from './utils';

function joinLines(...lines: string[]) {
    return lines.map(x => x.trim()).join(' ').trim();
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
                    case 'map-change':
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

void convertRooms('./data/4-json/Rooms.json', './data/5-json-mod/Rooms.json', './data/5-json-mod/Descriptions.json');
