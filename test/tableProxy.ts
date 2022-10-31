import Decimal from "decimal.js";
import { findIterable } from "tsc-utils";
import { MemoryObject, ProxyObject, Table, Tables, TableType } from "../src/server/db/generic";
import { replaceTableArraysWithSets } from "../src/server/db/load";
import { ActorStorage } from "../src/server/models/actor";
import { ItemStorage } from "../src/server/models/item";
import { RoomStorage } from "../src/server/models/room";
import { getProxyObject } from "../src/server/utils/tableProxy";
import { ProxyMap, World } from "../src/server/world/world";

export type StorageMap = {
    [K in Table]: TableType<K>[];
}

declare module '../src/server/models/item' {
    interface ItemProperties {
        myProperty?: number;
    }
}

const getSword = (): ItemStorage => ({
    id: 1,
    name: "Sword!",
    desc: "This is a swoooooooord!",
    cost: new Decimal(100),
    actor: 1,
    properties: { myProperty: 20 }
});

const getShield = (): ItemStorage => ({
    id: 35,
    name: "Shield",
    desc: "Protects 'n stuff.",
    cost: new Decimal(50),
    actor: 1,
    properties: {}
});

const getHero = (): ActorStorage => ({
    id: 32,
    name: "Hero",
    items: [1],
    room: 45,
    wallet: {}
});


let changes: { table: Table, id: number }[] = [];

describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        changes = [];
    });

    const getWorld = (
        storage: StorageMap
    ) => {
        let world: any = {
            changes,
            setDirty: (table: Table, id: number) => {
                changes.push({ table, id });
            }
        };


        const objects = Tables.reduce<ProxyMap>((acc, type) => {
            acc[type] = new Map(storage[type].map(x => [x.id, getProxyObject(type, world, replaceTableArraysWithSets(type, x))])) as any;
            return acc;
        }, {} as ProxyMap);

        const get = <T extends Table>(table: T, id: number): ProxyObject<T> => {
            const item = objects[table].get(id);
            if (!item) {
                throw new Error(`Cannot find ${table}: ${id}`);
            }
            return item;
        }

        world.get = get;

        return world as World;
    }

    test('proxy catches changes to basic properties.', () => {

        const sword = getSword()

        const world = getWorld({
            'items': [sword],
            'actors': [],
            'rooms': [],
            'roomDescriptions': []
        });

        const item = world.get('items', sword.id);

        item.name = "Mega Swoooord!";

        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'items', id: sword.id });
        expect(item.name).toBe("Mega Swoooord!");
        expect(sword.name).toBe("Mega Swoooord!");
    });

    test('proxy catches changes to nested properties.', () => {

        const sword = getSword()

        const world = getWorld({
            'items': [sword],
            'actors': [],
            'rooms': [],
            'roomDescriptions': []
        });

        const item = world.get('items', sword.id);

        item.properties.myProperty = 42;

        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'items', id: sword.id });
        expect(item.properties.myProperty).toBe(42);
        expect(sword.properties.myProperty).toBe(42);
    });

    test('proxy returns mapped child types - iterator', () => {

        const sword = getSword();
        const hero = getHero();

        const world = getWorld({
            'items': [sword],
            'actors': [hero],
            'rooms': [],
            'roomDescriptions': []
        });

        const actor = world.get('actors', hero.id);

        const items = Array.from(actor.items.values());

        expect(items.length).toBe(1);
        expect(items[0].name).toBe('Sword!');
        expect(changes.length).toBe(0);
    });

    test('proxy returns mapped child types - direct', () => {

        const sword = getSword();
        const hero = getHero();

        const world = getWorld({
            'items': [sword],
            'actors': [hero],
            'rooms': [],
            'roomDescriptions': []
        });

        const actor = world.get('actors', hero.id);

        const has = actor.items.has(sword);

        expect(has).toBe(true);
        expect(changes.length).toBe(0);
    });

    test('proxy sets mapped child types', () => {

        const sword = getSword();
        const shield = getShield();
        const hero = getHero();

        const world = getWorld({
            'items': [sword, shield],
            'actors': [hero],
            'rooms': [],
            'roomDescriptions': []
        });

        const actor = world.get('actors', hero.id);

        let hasShield = actor.items.has(world.get('items', shield.id));
        expect(hasShield).toBe(false);
        expect(changes.length).toBe(0);

        actor.items.add(world.get('items', shield.id));
        hasShield = actor.items.has(world.get('items', shield.id));
        expect(hasShield).toBe(true);
        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'actors', id: hero.id });

        const heroMemory: MemoryObject<'actors'> = hero as any;
        expect(heroMemory.items.size).toBe(2);
        expect(heroMemory.items.has(shield.id)).toBe(true);
    });

    test('proxy sets mapped child types and monitors changes', () => {

        const sword = getSword();
        const shield = getShield();
        const hero = getHero();

        const world = getWorld({
            'items': [sword, shield],
            'actors': [hero],
            'rooms': [],
            'roomDescriptions': []
        });

        const actor = world.get('actors', hero.id);

        let hasShield = actor.items.has(world.get('items', shield.id));
        expect(hasShield).toBe(false);
        expect(changes.length).toBe(0);

        actor.items.add(world.get('items', shield.id));
        hasShield = actor.items.has(world.get('items', shield.id));
        expect(hasShield).toBe(true);
        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'actors', id: hero.id });

        const item = findIterable(actor.items.values(), x => x.name == shield.name);
        expect(item).not.toBeUndefined();

        item!.cost = new Decimal(30);
        expect(changes.length).toBe(2);
        expect(changes[1]).toStrictEqual({ table: 'items', id: shield.id });
        expect(shield.cost.eq(30)).toBe(true);
    });


});