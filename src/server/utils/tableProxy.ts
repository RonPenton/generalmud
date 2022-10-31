import DeepProxy from 'proxy-deep';
import Decimal from 'decimal.js';
import { isTable, MemoryObject, ProxyObject, Table, Tables } from '../db/generic';
import { World } from '../world/world';

export function getProxyObject<T extends Table>(type: T, world: World, obj: MemoryObject<T>): ProxyObject<T> {
    return new DeepProxy(obj, {
        set(target, key, value, receiver) {

            const lastPath = this.path[this.path.length - 1];
            if (
                Array.isArray(target) &&
                Tables.find(x => x == lastPath) &&
                (
                    (typeof key === 'string' && !isNaN(parseInt(key)))
                    || typeof key === 'number'
                )
            ) {
                Reflect.set(target, key, value.id, receiver);
                return value;
            }

            Reflect.set(target, key, value, receiver);
            if (value instanceof Decimal) {
                world.setDirty(type, obj.id);
                //console.log(`SET path: ${this.path}  key: ${String(key)}  value: ${value}`);
                return value;
            }
            else if (Array.isArray(target) && key == 'length') {
                return value;
            }
            else if (typeof value === 'object' && value !== null) {
                world.setDirty(type, obj.id);
                return this.nest({})
            } else {
                world.setDirty(type, obj.id);
                return true;
            }
        },
        get(target, key, receiver) {
            const val = Reflect.get(target, key, receiver);
            console.log({ val, target, key, path: this.path });

            const lastPath = this.path[this.path.length - 1];
            // if (Array.isArray(target) && Tables.find(x => x == lastPath)) {
            //     if (typeof key === 'string' && isNaN(parseInt(key))) {
            //         return val;
            //     }
            //     else if (isTable(lastPath)) {
            //         console.log(`LOOKUP ${lastPath}`);
            //         return world.get(lastPath, val);
            //     }
            // }
            // if (val instanceof Set) {
            //     console.log('=========== SET');
            //     return val;
            // }
            if (val instanceof Decimal) {
                return val;
            }
            else if (target instanceof Set && isTable(lastPath)) {
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
                    return function (object: { id: number }): IterableIterator<any> {
                        return val.apply(target, [object.id]);
                    }
                }
                else if(key == 'add') {
                    return function (object: { id: number }): IterableIterator<any> {
                        world.setDirty(type, obj.id);
                        return val.apply(target, [object.id]);
                    }
                }
            }
            // else if (Array.isArray(target)) {
            //     return val;
            // }
            else if (typeof val === 'object' && val !== null) {
                return this.nest(val)
            } else {
                return val
            }
        }
    }) as ProxyObject<T>;
}
