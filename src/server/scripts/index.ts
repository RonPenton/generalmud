import { keyMap } from 'tsc-utils';
import { EventsType, Table, Tables } from '../db/types';

export const _scriptLibrary = keyMap<Table, {
    [K in Table]: Map<string, Required<EventsType<K>>>
}>(Tables, _ => new Map());

export function getScript<T extends Table>(type: T, name: string): EventsType<T> {

    const script = _scriptLibrary[type].get(name);
    if (!script) {
        console.log(`Script not loaded: ${type}::${name}`);
        return {};
    }

    return script;
}
