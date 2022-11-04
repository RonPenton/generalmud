import { RoomEvents } from './room';
import { keyMap } from 'tsc-utils';

export const ScriptableTypes = ['rooms'] as const;
export type ScriptableType = typeof ScriptableTypes[number];

export type ScriptableInterfaces = {
    'rooms': RoomEvents;
}

export type ScriptableInterface<T extends ScriptableType> = ScriptableInterfaces[T];

export function makeScriptProxy<T extends ScriptableType>(script: ScriptableInterface<T>): Required<ScriptableInterface<T>> {
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
    }) as Required<ScriptableInterface<T>>;
}

const library = keyMap<ScriptableType, {
    [K in ScriptableType]: Map<string, Required<ScriptableInterface<K>>>
}>(ScriptableTypes, _ => new Map());

export function getScript<T extends ScriptableType>(type: T, name: string): Required<ScriptableInterface<T>> {
    const script = library[type].get(name);
    if (!script) {
        console.log(`Script not found: ${type}::${name}`);
        return makeScriptProxy<T>({});
    }
    return script;
}

export async function loadScript<T extends ScriptableType>(type: T, name: string, reload = false) {

    if (!reload && library[type].has(name)) {
        return;
    }

    const module = await import(`./${type}/${name}.ts`);
    if (!module) {
        console.log(`Script not found: ${type}::${name}`);
        return;
    }

    const script = module.script as ScriptableInterface<T>;
    if (!script) {
        console.log(`Script malformed: ${type}::${name}`);
        return;
    }

    const proxy = makeScriptProxy(script);
    library[type].set(name, proxy);

    return proxy;
}


async function go() {
    await loadScript('rooms', 'announceEntry');
    const script = getScript('rooms', 'announceEntry');

    const world = {
        sendToRoom: (_actor: any, _name: any, msg: any) => {
            console.log(msg.text)
        }
    }

    script.hasEntered({ world, actor: { name: "Humperdinck" } } as any);
}

void go();