import { Db } from "./index";
import { OptionalId } from "../models/sansId";
import { DbWrapper, Table, TableType } from "./types";

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
