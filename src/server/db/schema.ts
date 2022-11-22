import { Db } from ".";
import { dbCreateObjectTable } from "./generic";
import { Tables } from "./types";

export async function createSchema(db: Db) {
    for (const table of Tables) {
        await dbCreateObjectTable(db, table);
    }
}
