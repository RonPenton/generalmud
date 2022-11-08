import { keyMap } from 'tsc-utils';
import { EventsType, Table, Tables } from '../db/generic';

export const _scriptLibrary = keyMap<Table, {
    [K in Table]: Map<string, EventsType<K>>
}>(Tables, _ => new Map());

export function getScript<T extends Table>(type: T, name: string): EventsType<T> {

    const script = _scriptLibrary[type].get(name);
    if (!script) {
        console.log(`Script not loaded: ${type}::${name}`);
        return {};
    }

    return script;
}
