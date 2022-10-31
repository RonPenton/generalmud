import { Db } from ".";
import { deserializeDecimals } from "../utils/serializeDecimals";
import { dbGetObjects, Table, TableType, Tables, MemoryObject } from "./generic";

export async function pagedLoad<T extends Table>(db: Db, table: T): Promise<MemoryObject<T>[]> {
    const arr: MemoryObject<T>[] = [];

    let page = 0;
    const pageSize = 50;
    while (true) {
        const data = await dbGetObjects(db, table, pageSize, page * pageSize);
        if (data.length == 0) {
            break;
        }
        data.forEach(x => deserializeDecimals(x));
        data.forEach(x => arr.push(replaceTableArraysWithSets(table, x)));
        page++;
    }

    return arr;
}

/** 
 * Replaces arrays with sets. Note that this modifies the object in place to save on memory, and is not
 * a pure function as a result.
 */
export function replaceTableArraysWithSets<T extends Table>(_type: T, item: TableType<T>): MemoryObject<T> {
    let obj: any = item;
    for (const key in obj) {
        if (Tables.some(x => x == key) && Array.isArray(obj[key])) {
            obj[key] = new Set(obj[key]);
        }
    }
    return obj;
}

// /** 
//  * Replaces sets with arrays. Note that unlike replaceTableArraysWithSets, this function
//  * creates a new object for output and leaves the original unmodified.
//  */
// function replaceSetsWithTableArrays<T extends MemoryObject>(item: T): StorageObject<T> {
//     let obj: any = { ...item };
//     for (const key in obj) {
//         if (Tables.some(x => x == key) && obj[key] instanceof Set) {
//             obj[key] = Array.from(obj[key]);
//         }
//     }
//     return obj;
// }