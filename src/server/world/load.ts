import { Db } from "../db";
import { dbCreateObject } from "../db/generic";
import { Tables } from '../db/types';
import { pagedLoad } from "../db/load";
import { WorldStorage } from "../models/world";
import { loadScripts } from "../scripts/loadScript";
import { time } from "../utils/timeFunction";
import { TableArrays, World } from "./world";

export async function loadWorld(db: Db): Promise<World> {
    const arrays: TableArrays = {} as any;

    await time(async () => {
        console.log(`Starting data load...`);

        for(const table of Tables) {
            arrays[table] = await pagedLoad(db, table) as any;

            // TEMP
            if(table == 'rooms') {
                const ts = arrays['rooms'].find(x => x.id == 10224);
                if(ts && !ts.events) {
                    ts.events = [{ name: 'announce-entry', parameters: { uppercase: true } }];
                }
            }

            await loadScripts(table, arrays[table]);
        }

        // make sure we have the world defined.
        if (arrays.worlds.length == 0) {
            const world: WorldStorage = {
                id: 1,
                time: 0,
                properties: {}
            };

            await dbCreateObject(db, 'worlds', world);
            arrays.worlds.push(world);
        }
    }, ms => {
        console.log(`Loaded database in ${ms}ms.`);
    });

    return new World(db, arrays);
}
