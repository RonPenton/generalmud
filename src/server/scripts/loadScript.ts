import { notEmpty } from "tsc-utils";
import { _scriptLibrary } from ".";
import { EventsType, Table } from "../db/types";
import { EventDefinition } from "./base";
import * as Throttle from 'promise-parallel-throttle';

export async function loadScript<T extends Table>(type: T, name: string, reload = false): Promise<boolean> {

    if (!reload && _scriptLibrary[type].has(name)) {
        return true;
    }

    const location = `./${type}/${name}.ts`;

    if (reload === true) {
        // forcing a reload, so delete the old script from the require cache.
        delete require.cache[require.resolve(location)]
    }

    const module = await import(location);
    if (!module) {
        console.log(`Script not found: ${type}::${name}`);
        return false;
    }

    const script = module.script as EventsType<T>;
    if (!script) {
        console.log(`Script malformed: ${type}::${name}`);
        return false;
    }

    _scriptLibrary[type].set(name, script);
    return true;
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
