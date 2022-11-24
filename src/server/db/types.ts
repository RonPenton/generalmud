import { keysOf } from "tsc-utils";
import { ActorStorage } from "../models/actor";
import { ItemStorage } from "../models/item";
import { RoomStorage } from "../models/room";
import { RoomDescription } from "../models/roomDescription";
import { WorldStorage } from "../models/world";
import { ActorEvents } from "../scripts/actor";
import { ItemEvents } from "../scripts/item";
import { RoomEvents } from "../scripts/room";
import { typeArrayValidator } from "../utils/typeArrayValidator";
import { DbSet } from "./dbset";

/**
 * An object that defines no events.
 */
export type NoEvents = {};

/**
 * A list of all table names defined in the system.
 */
export const Tables = ['worlds', 'rooms', 'actors', 'items', 'roomDescriptions'] as const;

/**
 * A mapping of table names to the storage type and the event type for each.
 */
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

/**
 * A mapping of singular table names to their plural canonical name.
 * It is important that every table is mapped or else the types break down.
 * Could probably generate this automatically using template literal types and removing the 's',
 * but that falls apart in the future if there are any plurals that are complex.
 * Additionally, we need an in-memory array so we'd need to define an array anyways and that
 * has the same flaw, so here we are.
 */
export const TableLinkMap = {
    'room': 'rooms',
    'actor': 'actors',
    'roomDescription': 'roomDescriptions',
    'world': 'worlds',
    'item': 'items'
} satisfies Record<string, Table>;

/**
 * A type describing the names of every table.
 */
export type Table = typeof Tables[number];

/**
 * A type used to extract the storage type for the specified table. 
 * ie
 *      type RoomStorage = TableType<'rooms'>;
 */
export type TableType<T extends Table> = TableMap[T]['storage'];

/**
 * A type used to extract the events type for the specified table.
 * ie
 *      type RoomEvents = EventsType<'rooms'>;
 */
export type EventsType<T extends Table> = TableMap[T]['events'];

/**
 * The type of the table links. ie 'room' | 'item' | 'actor', etc. 
 */
export type TableLink = keyof typeof TableLinkMap;

/**
 * Determines the database table for a link name.
 * ie
 *      type R = LinkedType<'room'>; // R = 'rooms'
 */
export type LinkedType<T extends TableLink> = (typeof TableLinkMap)[T];

/**
 * The array of table link names, used for validation and iteration. 
 */
export const TableLinks = keysOf(TableLinkMap);

/**
 * TLM = verbosity destroyer.
 * TableLinkForTable is a utility type that determines the link name for
 * a given table. So the opposite of LinkedType<T>.
 * ie
 *      type R = TableLinkForTable<'rooms'>;  // R = 'room'
 */
type TLM = typeof TableLinkMap;
export type TableLinkForTable<T extends Table> = Extract<keyof {
    [K in keyof TLM as TLM[K] extends T ? K : never]: never
}, TableLink>;

/**
 * A type that describes a table that links to the given resource.
 * ie 
 *      HasLink<'rooms'> = {
 *          room: number | null
 *       }
 * 
 * This type can then be used to test via extends.
 */
type HasLink<T extends Table> = {
    [K in T as TableLinkForTable<T> extends never ? never : TableLinkForTable<T>]: number | null;
}

/**
 * Determines the names of any table linking to the specified table.
 * ie
 *      AnyTableLinkingTo<'rooms'> = 'items' | 'actors'
 *      AnyTableLinkingTo<'actors'> = 'items'
 */
export type AnyTableLinkingTo<T extends Table> = Extract<keyof {
    [K in Table as TableType<K> extends HasLink<T> ? K : never]: never;
}, Table>;

/**
 * Calculates a partial type containing LinkSets to proxy objects for any table that links to the
 * specified table.
 * ie
 *      ProxyLinkSets<'rooms'> = {
 *          items: DbSet<'items'>,
 *          actors: DbSet<'actors'>
 *      }
 * 
 * This allows the game to be able to manage all items in a room using Set operations, for example.
 */
export type ProxyLinkSets<T extends Table> = {
    [K in AnyTableLinkingTo<T>]: DbSet<K>
};

/**
 * Used to extend a null type. 
 * ie
 *      ExtendsNull<number>         //  never
 *      ExtendsNull<number | null>  // null
 * 
 * use it to extend null when transforming types.
 * ie
 *      type x = Transform<MyObject['key']> | ExtendsNull<MyObject['key']>
 *
 * if MyObject['key'] is nullable, then type 'x' will be as well. 
 */
export type ExtendNull<T> = T extends null ? null : never;

/**
 * Extract the keys of a table that link to another table. 
 * ie
 *      TableLinkKeys<'items'> = 'actor' | 'room'
 *      TableLinkKeys<'actor'> = 'room
 */
export type TableLinkKeys<T extends Table> = Extract<keyof {
    [K in keyof TableType<T> as K extends TableLink ? K : never]: never
}, TableLink>;

/**
 * Calculates a partial type containing Links to proxy objects for any table that the specified
 * table links to.
 * ie
 *      ProxyLinks<'items'> = {
 *          room: Room | null,
 *          actor: Actor | null
 *      }
 */
export type ProxyLinks<T extends Table> = {
    [K in TableLinkKeys<T>]: ProxyObject<LinkedType<K>> | ExtendNull<TableType<T>[Extract<K, keyof TableType<T>>]>
}

/**
 * A valdiator that validates whether a string is a table reference. 
 * ie
 *      isTable('rooms') // true
 *      isTable('roms') // false
 */
export const isTable = typeArrayValidator(Tables);

/**
 * A validator that validates whether a string is a table link.
 * ie
 *      isTableLink('room') // true
 *      isTableLink('rom') // false
 */
export const isTableLink = typeArrayValidator(TableLinks);

/**
 * The proxified-version of the events type for the given table. 
 * All fields are marked as required because the proxy will automatically fill
 * in the actions with default functions if they are undefined. This allows
 * us to skip null checking in the vast majority of the code.
 */
export type ProxyEvents<T extends Table> = {
    events: Required<EventsType<T>>
};

/**
 * A symbol allowing the underlying memory object to be accessed from a table proxy object.
 * Mostly used for the database functions. Avoid using this if you can. 
 */
export const UnderlyingObject = Symbol();
export const SetupLinkSets = Symbol();

/**
 * Represents a database item proxy. The actual db representation of the objects
 * do not contain sets of linked items, rather the DbSet<>'s are generated at load time
 * and maintained by game logic. These allow us to operate on an object using a virual
 * proxy interface that allows us to say, for example, player.room.roomDescription, 
 * even though the underlying 'player.room' in memory is just a `number`. 
 */
export type ProxyObject<T extends Table> =
    Omit<TableType<T>, 'events' | TableLink>        // take out events and table links
    & ProxyLinkSets<T>                              // add in link sets, ie room.actors
    & ProxyLinks<T>                                 // add in links, ie actor.room
    & ProxyEvents<T>                                // add in proxified events
    & { 
        [UnderlyingObject]: TableType<T>,           // add in the underlying object. 
        [SetupLinkSets]: () => void                 // a function used to setup any object that this object points to.
    };      


/**
 * Objects are stored in JSONB columns named 'data', since we don't use the database
 * in real time, we just load it in memory (we're not MMO-scaling here) and write out
 * upon changes. DB Wrapper represents that. 
 */
export type DbWrapper<T extends Table> = {
    id: number,
    data: TableType<T>
};
