import { Db } from ".";
import { deserializeDecimals, serializeDecimals } from "../utils/serializeDecimals";
import { dbGetObjects, dbUpdateObject } from "./generic";
import { Table, TableType } from "./types";
import cloneDeep from 'clone-deep';

export async function pagedLoad<T extends Table>(db: Db, table: T): Promise<TableType<T>[]> {
    const arr: TableType<T>[] = [];

    let page = 0;
    const pageSize = 50;
    while (true) {
        const data = await dbGetObjects(db, table, pageSize, page * pageSize);
        if (data.length == 0) {
            break;
        }
        data.forEach(x => deserializeDecimals(x));
        data.forEach(x => arr.push(x));
        page++;
    }

    return arr;
}

export async function saveDbObject<T extends Table>(db: Db, table: T, obj: TableType<T>) {
    const storage = cloneDeep(obj); // clone object so we don't overwrite anything in use.
    serializeDecimals(storage);
    await dbUpdateObject(db, table, storage);
}
