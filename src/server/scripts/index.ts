import { keyMap, notEmpty } from 'tsc-utils';
import { EventsType, Table, Tables } from '../db/generic';
import { EventDefinition } from './base';
import * as Throttle from 'promise-parallel-throttle';

type Events<T extends Table> = Required<EventsType<T>>;

export function makeScriptProxy<T extends Table>(script: EventsType<T>): Required<EventsType<T>> {
    return new Proxy(script, {
        get(target, key, receiver) {
            const val = Reflect.get(target, key, receiver);
            if (val) {
                return val;
            }

            if (typeof key === 'string' && key.startsWith('can')) {
                return () => true;
            }

            if (typeof key === 'string' && key.startsWith('has')) {
                return () => undefined;
            }
        }
    }) as Required<EventsType<T>>;
}

const library = keyMap<Table, {
    [K in Table]: Map<string, Events<K>>
}>(Tables, _ => new Map());

export function getScript<T extends Table>(type: T, name: string): Events<T> {

    const script = library[type].get(name);
    if (!script) {
        console.log(`Script not loaded: ${type}::${name}`);
        return makeScriptProxy<T>({});
    }

    return script;
}

export async function loadScript<T extends Table>(type: T, name: string, reload = false) {

    if (!reload && library[type].has(name)) {
        return;
    }

    const location = `./${type}/${name}.ts`;

    if (reload === true) {
        // forcing a reload, so delete the old script from the require cache.
        delete require.cache[require.resolve(location)]
    }

    const module = await import(location);
    if (!module) {
        console.log(`Script not found: ${type}::${name}`);
        return;
    }

    const script = module.script as EventsType<T>;
    if (!script) {
        console.log(`Script malformed: ${type}::${name}`);
        return;
    }

    const proxy = makeScriptProxy<T>(script);
    library[type].set(name, proxy);

    return proxy;
}

type HasEvents = {
    events?: EventDefinition[]
}

export async function loadScripts<K extends Table>(type: K, array: HasEvents[]) {
    const tasks = array.flatMap(x => x.events)
        .filter(notEmpty)
        .map(x => () => loadScript(type, x.name));
    await Throttle.all(tasks, { maxInProgress: 5 });
}

// async function go() {
//     await loadScript('rooms', 'announceEntry');
//     const script = getScript('rooms', 'announceEntry');

//     const world = {
//         sendToRoom: (_actor: any, _name: any, msg: any) => {
//             console.log(msg.text)
//         }
//     }

//     script.hasEntered({ world, actor: { name: "Humperdinck" }, parameters: { uppercase: true } } as any);
// }

// void go();