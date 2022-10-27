import { getEnv } from '../environment';
import pgPromise from 'pg-promise';

const env = getEnv();

async function createdb() {
    const connectionString = env.POSTGRES_CONNECTION_STRING;

    const opts = {
        query: (e: pgPromise.IEventContext) => {
            console.log(e.query);
        }
    };

    const pgp = pgPromise(opts);
    const types = pgp.pg.types;
    types.setTypeParser(types.builtins.DATE, val => val);
    types.setTypeParser(types.builtins.TIMESTAMPTZ, val => (new Date(val)).toISOString());
    types.setTypeParser(types.builtins.TIMESTAMP, val => (new Date(val)).toISOString());
    const db = pgp(connectionString);
    return db;
}

/* eslint-disable @typescript-eslint/ban-types */
export type Db = pgPromise.IDatabase<{}> | pgPromise.ITask<{}>;
let dbinstance: Db;

export async function getDbInstance(opts: { forceNew?: boolean } = {}) {
    const { forceNew } = opts;
    if (!dbinstance || forceNew) {
        dbinstance = await createdb();
    }

    return dbinstance;
}
