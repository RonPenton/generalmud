import { Actor } from "../models/actor";
import { Room } from "../models/room";
import { Db } from "./index";
import clone from 'clone';
import { Item } from "../models/item";
import { OptionalId } from "../models/sansId";

export const GenericTableTypes = ['rooms', 'actors', 'items'] as const;
export type GenericTableMap = {
    'rooms': Room,
    'actors': Actor,
    'items': Item
}
export type GenericTableType = typeof GenericTableTypes[number];

export type HasTables = {
    [K in GenericTableType]?: Map<number, GenericTableMap[K]>;
}

export type Storage<T> = {
    [K in keyof T]: K extends GenericTableType ? number[] : T[K]
}

export function toStorage<T extends GenericTableType>(_type: T, obj: GenericTableMap[T]): Storage<GenericTableMap[T]> {
    let c: any = clone(obj);
    for (const t of GenericTableTypes) {
        const map: Map<number, { id: string }> = c[t];
        if (!map)
            continue;
        c[t] = Array.from(map, ([_k, v]) => v.id);
    }
    return c;
}

export function fromStorage<T extends GenericTableType>(_type: T, world: HasTables, obj: Storage<GenericTableMap[T]>): GenericTableMap[T] {
    let c: any = clone(obj);
    for (const t of GenericTableTypes) {
        const array: Array<number> = c[t];
        const w = world[t];
        if (!array || !w)
            continue;
        c[t] = new Map(array.map(x => [x, w.get(x)]));
    }
    return c;
}

export type DbWrapper<T extends GenericTableType> = {
    id: number,
    data: Storage<GenericTableMap[T]>
};

export async function dbCreateObjectTable(db: Db, table: GenericTableType) {
    await db.none(`CREATE TABLE IF NOT EXISTS ${table} (
        id serial PRIMARY KEY,
        data jsonb NOT NULL
    );`);
}

export async function dbGetObjects<T extends GenericTableType>(
    db: Db,
    table: T,
    limit: number,
    offset: number
): Promise<Storage<GenericTableMap[T]>[]> {
    const rooms = await db.manyOrNone<DbWrapper<T>>(`SELECT * from ${table} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`);
    return rooms.map(x => ({ ...x.data, id: x.id }));
}

export async function upsertDbObject<T extends GenericTableType>(
    db: Db,
    table: T,
    object: Storage<GenericTableMap[T]>
): Promise<Storage<GenericTableMap[T]>> {
    const { data, id } = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (id, data) VALUES(\${id}, \${object})
        ON CONFLICT(id) DO UPDATE SET data=\${object:json}
        RETURNING *;
    `, { id: object.id, object });
    return { ...data, id };
}

export async function dbCreateObject<T extends GenericTableType>(
    db: Db,
    table: T,
    object: OptionalId<Storage<GenericTableMap[T]>>
): Promise<Storage<GenericTableMap[T]>> {
    const { id } = object;
    if (!id) {
        const { data } = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (data) VALUES(\${object})
        RETURNING *;
    `, { id: object.id, object });
        return data;
    }
    else {
        const { data, id } = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (id, data) VALUES(\${id}, \${object})
        RETURNING *;
    `, { id: object.id, object });
        return { ...data, id };
    }
}

export async function dbUpdateObject<T extends GenericTableType>(
    db: Db,
    table: T,
    object: Storage<GenericTableMap[T]>
): Promise<Storage<GenericTableMap[T]>> {
    const { id } = object;
    const { data } = await db.one<DbWrapper<T>>(`
        UPDATE ${table} SET data=\${object:json} 
        WHERE id=\${id}
        RETURNING *;
    `, { id, object });
    return data;
}

export async function dbDeleteObject(db: Db, table: GenericTableType, id: number): Promise<void> {
    await db.none(`DELETE FROM ${table} WHERE id=\${id}`, { id });
}
