import { getScript } from ".";
import { EventsType, MemoryObject, Table } from "../db/generic";


export function makeScriptProxy<T extends Table>(type: T, object: MemoryObject<T>): Required<EventsType<T>> {
    return new Proxy({}, {
        get(_target, key, _receiver) {

            if (typeof key === 'string') {
                const defs = object.events ?? [];
                const events = defs
                    .map(x => ({ events: getScript(type, x.name) as Record<string, Function>, parameters: x.parameters }))
                    .filter(x => !!x.events[key])
                    .map(({ events, parameters }) => ({ func: events[key], parameters }))

                if (key.startsWith('can')) {
                    return (...args: any[]) => {
                        const [first, ...rest] = args;
                        // call func before && so that we hit every can<X> call without
                        // short circuiting.
                        return events.reduce<boolean>(
                            (acc, { func, parameters }) => Reflect.apply(func, undefined, [{ ...first, parameters }, ...rest]) && acc,
                            true
                        );
                    }
                }

                if (key.startsWith('has')) {
                    return (...args: any[]) => {
                        const [first, ...rest] = args;
                        events.forEach(({func, parameters}) => Reflect.apply(func, undefined, [{...first, parameters }, ...rest]));
                    }
                }
            }

            return undefined;
        }
    }) as Required<EventsType<T>>;
}
