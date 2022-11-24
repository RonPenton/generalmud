import Decimal from "decimal.js";
import { findIterable } from "tsc-utils";
import { ProxyObject, SetupLinkSets, Table, Tables, TableType, UnderlyingObject } from "../src/server/db/types";
import { ActorStorage } from "../src/server/models/actor";
import { ItemStorage } from "../src/server/models/item";
import { RoomStorage } from "../src/server/models/room";
import { RoomDescription } from "../src/server/models/roomDescription";
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
    actor: 32,
    room: null,
    properties: { myProperty: 20 }
});

const getShield = (): ItemStorage => ({
    id: 35,
    name: "Shield",
    desc: "Protects 'n stuff.",
    cost: new Decimal(50),
    actor: 23,
    room: null,
    properties: {}
});

const getHero = (): ActorStorage => ({
    id: 32,
    name: "Hero",
    room: 45,
    wallet: {}
});

const getVillain = (): ActorStorage => ({
    id: 23,
    name: "Villain",
    room: 45,
    wallet: {}
});

const room = (): RoomStorage => ({
    id: 45,
    name: 'Storage Room',
    exits: {},
    light: 100,
    money: {},
    hiddenMoney: {},
    roomDescription: 1
});

const roomDescription = (): RoomDescription => ({
    id: 1,
    text: "This is a storage room."
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
            acc[type] = new Map(storage[type].map(x => [x.id, getProxyObject(type, world, x)])) as any;
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

        // now that all objects are loaded we can stitch everything together in memory. 
        Tables.flatMap(x => objects[x]).flatMap(x => [...x.values()]).forEach(x => x[SetupLinkSets]());

        return world as World;
    }

    test('proxy catches changes to basic properties.', () => {

        const sword = getSword()

        const world = getWorld({
            'items': [sword],
            'actors': [getHero()],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
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
            'actors': [getHero()],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
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
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
        });

        const actor = world.get('actors', hero.id);

        actor.items

        const items = Array.from(actor.items.values());

        expect(items.length).toBe(1);
        expect(items[0].name).toBe('Sword!');
        expect(changes.length).toBe(0);
    });

    test('proxy returns mapped child types - direct', () => {

        const swordStorage = getSword();
        const heroStorage = getHero();

        const world = getWorld({
            'items': [swordStorage],
            'actors': [heroStorage],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
        });

        const hero = world.get('actors', heroStorage.id);
        const sword = world.get('items', swordStorage.id);

        const has = hero.items.has(sword);

        expect(has).toBe(true);
        expect(changes.length).toBe(0);
    });

    test('proxy sets mapped child types', () => {

        const swordStorage = getSword();
        const shieldStorage = getShield();
        const heroStorage = getHero();

        const world = getWorld({
            'items': [swordStorage, shieldStorage],
            'actors': [heroStorage, getVillain()],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
        });

        const hero = world.get('actors', heroStorage.id);
        const shield = world.get('items', shieldStorage.id);

        let hasShield = hero.items.has(shield);
        expect(hasShield).toBe(false);
        expect(changes.length).toBe(0);

        shield.actor = hero;
        
        hasShield = hero.items.has(shield);
        expect(hasShield).toBe(true);
        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'items', id: shield.id });

        // const heroMemory: TableType<'actors'> = hero[UnderlyingMemory];
        // expect(heroMemory[TableSymbolMap.items]?.size).toBe(2);
        // expect(heroMemory[TableSymbolMap.items]?.has(shield.id)).toBe(true);
    });

    test('proxy sets mapped child types and monitors changes', () => {

        const swordStorage = getSword();
        const shieldStorage = getShield();
        const heroStorage = getHero();

        const world = getWorld({
            'items': [swordStorage, shieldStorage],
            'actors': [heroStorage, getVillain()],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
        });

        const hero = world.get('actors', heroStorage.id);

        let hasShield = hero.items.has(world.get('items', shieldStorage.id));
        expect(hasShield).toBe(false);
        expect(changes.length).toBe(0);

        const shield = world.get('items', shieldStorage.id);
        shield.actor = hero;

        hasShield = hero.items.has(world.get('items', shieldStorage.id));
        expect(hasShield).toBe(true);
        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'items', id: shieldStorage.id });

        const item = findIterable(hero.items.values(), x => x.name == shieldStorage.name);
        expect(item).not.toBeUndefined();

        item!.cost = new Decimal(30);
        expect(changes.length).toBe(2);
        expect(changes[1]).toStrictEqual({ table: 'items', id: shieldStorage.id });
        expect(shieldStorage.cost.eq(30)).toBe(true);
    });

    test('proxy deletes mapped child types', () => {

        const swordStorage = getSword();
        const shieldStorage = getShield();
        const heroStorage = getHero();

        const world = getWorld({
            'items': [swordStorage, shieldStorage],
            'actors': [heroStorage, getVillain()],
            'rooms': [room()],
            'roomDescriptions': [roomDescription()],
            'worlds': []
        });

        const hero = world.get('actors', heroStorage.id);
        const sword = world.get('items', swordStorage.id);
        const shield = world.get('items', shieldStorage.id);

        shield.actor = hero;
        var hasShield = hero.items.has(shield);
        expect(hasShield).toBe(true);
        expect(changes.length).toBe(1);
        expect(changes[0]).toStrictEqual({ table: 'items', id: shield.id });

        shield.actor = null;
        hasShield = hero.items.has(shield);
        expect(hasShield).toBe(false);
        expect(changes.length).toBe(2);
        expect(changes[1]).toStrictEqual({ table: 'items', id: shield.id });

        sword.actor = null;
        var hasSword = hero.items.has(sword);
        expect(hasSword).toBe(false);
        expect(changes.length).toBe(3);
        expect(changes[2]).toStrictEqual({ table: 'items', id: sword.id });

        const items = Array.from(hero.items.values());
        expect(items.length).toBe(0);

        // const heroMemory = actor[UnderlyingMemory];
        // expect(heroMemory[TableSymbolMap.items]?.size).toBe(0);
    });

});