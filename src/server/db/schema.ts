import { Db } from ".";
import { dbCreateObjectTable } from "./generic";

export async function createSchema(db: Db) {
    await dbCreateObjectTable(db, 'items');
    await dbCreateObjectTable(db, 'rooms');
    await dbCreateObjectTable(db, 'actors');
}
