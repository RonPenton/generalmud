import { World } from "./world";
import fs from 'fs';
import path from 'path';
import { Direction } from "../models/direction";

export async function findUnreachableRooms(world: World) {

    const startPoints = [10001, 10164, 12189, 12150, 22519, 61249];

    const unreached = new Set(world.proxyMap.rooms.keys());
    startPoints.forEach(x => unreached.delete(x));
    const processing = Array.from(startPoints);
    const reached = new Set<number>(processing);

    while (processing.length > 0) {
        const roomId = processing.shift();
        const room = world.getRoom(roomId!);

        for (const dir in room.exits) {
            const exit = room.exits[dir as Direction]!;
            if (!reached.has(exit.exitRoom)) {
                reached.add(exit.exitRoom);
                processing.push(exit.exitRoom);
                unreached.delete(exit.exitRoom);
            }
        }
    }

    const left = Array.from(unreached.keys());
    left.sort((a, b) => a - b);
    const output = path.join(__dirname, '..', '..', '..', 'diagnostics', 'unreachable.json');
    const out = fs.createWriteStream(output, { encoding: 'utf-8' });

    const writeLine = async (line: string) => {
        return new Promise(resolve => {
            out.write(line + '\n', resolve);
        });
    }

    for (const id of left) {
        const map = Math.floor(id / 10000);
        const room = id - (map * 10000);
        await writeLine(JSON.stringify({ map, room, name: world.getRoom(id).name }));
    }
    out.close();
}