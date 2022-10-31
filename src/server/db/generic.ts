import { ActorStorage } from "../models/actor";
import { RoomStorage } from "../models/room";
import { Db } from "./index";
import { ItemStorage } from "../models/item";
import { OptionalId } from "../models/sansId";
import { RoomDescription } from "../models/roomDescription";

export const Tables = ['rooms', 'actors', 'items', 'roomDescriptions'] as const;
export type TableMap = {
    'rooms': RoomStorage,
    'actors': ActorStorage,
    'items': ItemStorage,
    'roomDescriptions': RoomDescription
}
export type Table = typeof Tables[number];
export type TableType<T extends Table> = TableMap[T];

export function isTable(name: any): name is Table {
    return Tables.includes(name);
}

export type HasTableArrays = {
    [K in Table]?: number[];
}

export type HasId = { id: number; }

export type MemoryObject<T extends Table> = {
    [K in keyof TableType<T>]: K extends Table ? Set<number> : TableType<T>[K];
};

export type ProxyObject<T extends Table> = {
    [K in keyof TableType<T>]: K extends Table ? Set<ProxyObject<K>> : TableType<T>[K];
};

export type HasProxies = {
    [K in Table]?: Set<ProxyObject<K>>;
}

export type DbWrapper<T extends Table> = {
    id: number,
    data: TableMap[T]
};

export async function dbCreateObjectTable(db: Db, table: Table) {
    await db.none(`CREATE TABLE IF NOT EXISTS ${table} (
        id serial PRIMARY KEY,
        data jsonb NOT NULL
    );`);
}

export async function dbGetObjects<T extends Table>(
    db: Db,
    table: T,
    limit: number,
    offset: number
): Promise<TableMap[T][]> {
    const rooms = await db.manyOrNone<DbWrapper<T>>(`SELECT * from ${table} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`);
    return rooms.map(x => ({ ...x.data, id: x.id }));
}

export async function upsertDbObject<T extends Table>(
    db: Db,
    table: T,
    object: TableMap[T]
): Promise<TableMap[T]> {
    const { data, id } = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (id, data) VALUES(\${id}, \${object})
        ON CONFLICT(id) DO UPDATE SET data=\${object:json}
        RETURNING *;
    `, { id: object.id, object });
    return { ...data, id };
}

export async function dbCreateObject<T extends Table>(
    db: Db,
    table: T,
    object: OptionalId<TableMap[T]>
): Promise<TableMap[T]> {
    if (!object.id) {
        const { id, data } = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (data) VALUES(\${object})
        RETURNING *;
    `, { object });
        return { ...data, id };
    }
    else {
        const wrapper = await db.one<DbWrapper<T>>(`
        INSERT INTO ${table} (id, data) VALUES(\${id}, \${object})
        RETURNING *;
    `, { id: object.id, object });
        return { ...wrapper.data, id: wrapper.id };
    }
}

export async function dbUpdateObject<T extends Table>(
    db: Db,
    table: T,
    object: TableMap[T]
): Promise<TableMap[T]> {
    const { id } = object;
    const { data } = await db.one<DbWrapper<T>>(`
        UPDATE ${table} SET data=\${object:json} 
        WHERE id=\${id}
        RETURNING *;
    `, { id, object });
    return data;
}

export async function dbDeleteObject(db: Db, table: Table, id: number): Promise<void> {
    await db.none(`DELETE FROM ${table} WHERE id=\${id}`, { id });
}
