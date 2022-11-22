import DeepProxy from 'proxy-deep';
import Decimal from 'decimal.js';
import { AnyTableLinkingTo, isTable, isTableLink, MemoryObject, ProxyObject, SetupLinkSets, Table, TableLinkKeys, TableLinkMap, Tables, TableSymbolMap, UnderlyingMemory } from '../db/types';
import { World } from '../world/world';
import { makeScriptProxy } from '../scripts/makeScriptProxy';
import { keysOf } from 'tsc-utils';


export function getProxyObject<T extends Table>(type: T, world: World, obj: MemoryObject<T>): ProxyObject<T> {

    const eventsProxy = makeScriptProxy(type, obj);

    return new DeepProxy<ProxyObject<T>>(obj as any, {
        set(target, key, value, receiver) {

            if (key === UnderlyingMemory || key == SetupLinkSets) {
                throw new Error('You cannot set this value.');
            }


            // Not necessary?
            // const lastPath = this.path[this.path.length - 1];
            // if (
            //     Array.isArray(target) &&
            //     Tables.find(x => x == lastPath) &&
            //     (
            //         (typeof key === 'string' && !isNaN(parseInt(key)))
            //         || typeof key === 'number'
            //     )
            // ) {
            //     Reflect.set(target, key, value.id, receiver);
            //     return value;
            // }

            if (value instanceof Decimal) {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return value;
            }
            else if (isTableLink(key) && key in target) {
                if (value === null) {
                    Reflect.set(target, key, null, receiver);
                    return value;
                }
                else if ('id' in value && typeof value.id === 'number') {
                    Reflect.set(target, key, value.id, receiver);
                    return value;
                }

                throw new Error('Invalid set attempt');
            }
            else if (Array.isArray(target) && key == 'length') {
                Reflect.set(target, key, value, receiver);
                return value;
            }
            else if (typeof value === 'object' && value !== null) {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return this.nest({})
            } else {
                Reflect.set(target, key, value, receiver);
                world.setDirty(type, obj.id);
                return true;
            }
        },

        get(target, key, receiver) {

            if (key == UnderlyingMemory) {
                return obj;
            }
            if (key == SetupLinkSets) {
                return () => {
                    const o: any = obj;
                    const links = Object.keys(o).filter(isTableLink);
                    for (const link of links) {
                        const otherTable: any = TableLinkMap[link];
                        const id: number | null = o[link];
                        if (id !== null) {
                            const other = world.get(otherTable, id);
                            const set = getSet(type, otherTable, other[UnderlyingMemory]);

                        }
                    }
                }
            }
            if (key == 'events') {
                return eventsProxy;
            }

            const val: any = Reflect.get(target, key, receiver);

            const lastPath = this.path[this.path.length - 1];
            if (target instanceof Set && isTable(lastPath)) {
                if (key == 'values') {
                    return function (...args: any[]): IterableIterator<any> {
                        const internalIterator: IterableIterator<number> = val.apply(target, args);

                        let iterator: Iterator<any> = {
                            next: () => {
                                const n = internalIterator.next();
                                if (n.done) { return n };
                                return {
                                    done: false,
                                    value: world.get(lastPath, n.value)
                                }
                            }
                        };
                        let o: any = iterator;
                        o[Symbol.iterator] = () => iterator;
                        return o;
                    }
                }
                else if (key == 'has') {
                    return function (object: { id: number }) {
                        return val.apply(target, [object.id]);
                    }
                }
                else if (key == 'add') {
                    return function (object: { id: number }) {
                        world.setDirty(type, obj.id);
                        return val.apply(target, [object.id]);
                    }
                }
                else if (key == 'delete') {
                    return function (object: { id: number }): IterableIterator<any> {
                        world.setDirty(type, obj.id);
                        return val.apply(target, [object.id]);
                    }
                }
            }
            else if (val instanceof Decimal) {
                return val;
            }
            else if (target instanceof Set && isTable(lastPath)) {
            }
            else if (typeof val === 'object' && val !== null) {
                return this.nest(val)
            }

            return val
        }
    });
}

function getSet<T extends Table>(_type: T, key: AnyTableLinkingTo<T>, obj: MemoryObject<T>): Set<number> {
    const symbol = TableSymbolMap[key];
    const o: any = obj;
    let set: Set<number> | undefined = o[symbol];
    if (!set) {
        set = new Set<number>();
        o[symbol] = set;
    }

    return set;
}
