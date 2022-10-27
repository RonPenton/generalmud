import { Db } from ".";
import { dbGetObjects, fromStorage, GenericTableMap, GenericTableType, HasTables } from "./generic";

export async function pagedLoad<T extends GenericTableType>(db: Db, table: T, world: HasTables): Promise<Map<number, GenericTableMap[T]>> {
    const map = new Map<number, GenericTableMap[T]>();

    let page = 0;
    const pageSize = 50;
    while (true) {
        const data = await dbGetObjects(db, table, pageSize, page * pageSize);
        if (data.length == 0) {
            break;
        }
        data.forEach(x => map.set(x.id, fromStorage(table, world, x as any)));
        page++;
    }

    return map;
}
