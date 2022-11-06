import { Db } from ".";
import { dbCreateObjectTable, Tables } from "./generic";

export async function createSchema(db: Db) {
    for (const table of Tables) {
        await dbCreateObjectTable(db, table);
    }
}
