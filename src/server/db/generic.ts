import { ActorStorage } from "../models/actor";
import { RoomStorage } from "../models/room";
import { Db } from "./index";
import { ItemStorage } from "../models/item";
import { OptionalId } from "../models/sansId";
import { RoomDescription } from "../models/roomDescription";
import { WorldStorage } from "../models/world";
import { RoomEvents } from "../scripts/room";
import { ActorEvents } from "../scripts/actor";
import { ItemEvents } from "../scripts/item";
import { keysOf } from "tsc-utils";
import { typeArrayValidator } from "../utils/typeArrayValidator";

export type NoEvents = {};

export const Tables = ['worlds', 'rooms', 'actors', 'items', 'roomDescriptions'] as const;

export type TableMap = {
    'worlds': {
        storage: WorldStorage,
        events: NoEvents
    },
    'rooms': {
        storage: RoomStorage,
        events: RoomEvents
    },
    'actors': {
        storage: ActorStorage,
        events: ActorEvents
    },
    'items': {
        storage: ItemStorage,
        events: ItemEvents
    },
    'roomDescriptions': {
        storage: RoomDescription,
        events: NoEvents
    }
}
export type Table = typeof Tables[number];
export type TableType<T extends Table> = TableMap[T]['storage'];
export type EventsType<T extends Table> = TableMap[T]['events'];

export const TableLinkMap = {
    'room': 'rooms',
    'actor': 'actors',
    'roomDescription': 'roomDescriptions'
} satisfies Record<string, Table>;
export type TableLink = keyof typeof TableLinkMap;
export type LinkedType<T extends TableLink> = (typeof TableLinkMap)[T];
export const TableLinks = keysOf(TableLinkMap);

export const isTable = typeArrayValidator(Tables);
export const isTableLink = typeArrayValidator(TableLinks);

export type HasTableArrays = {
    [K in Table]?: number[];
}

export type HasLinks = {
    [K in TableLink]?: number;
}

export type HasId = { id: number; }

export type MemoryObject<T extends Table> = {
    [K in keyof TableType<T>]: K extends Table ? Set<number> : TableType<T>[K];
};

export type ProxyEvents<T extends Table> = {
    events: Required<EventsType<T>>
};

export const UnderlyingMemory = Symbol.for('UnderlyingMemory');

export type ProxyObject<T extends Table> = Omit<{
    [K in keyof TableType<T>]: K extends Table ? Set<ProxyObject<K>>
    : TableType<T>[K]
}, 'events'> & ProxyEvents<T> & {
    [UnderlyingMemory]: MemoryObject<T>
};

export type HasProxies = {
    [K in Table]?: Set<ProxyObject<K>>;
}

export type DbWrapper<T extends Table> = {
    id: number,
    data: TableType<T>
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
): Promise<TableType<T>[]> {
    const rooms = await db.manyOrNone<DbWrapper<T>>(`SELECT * from ${table} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`);
    return rooms.map(x => ({ ...x.data, id: x.id }));
}

export async function upsertDbObject<T extends Table>(
    db: Db,
    table: T,
    object: TableType<T>
): Promise<TableType<T>> {
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
    object: OptionalId<TableType<T>>
): Promise<TableType<T>> {
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
    object: TableType<T>
): Promise<TableType<T>> {
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
