import { getScript } from ".";
import { EventsType, Table, TableType } from "../db/types";
import { portalEventsAggregate } from "./portal";
import { roomEventsAggregate } from "./room";

const eventAggregates: Record<Table, any> = {
    'rooms': roomEventsAggregate,
    'portals': portalEventsAggregate,
    'items': {},
    'actors': {},
    'roomDescriptions': {},
    'worlds': {},
}

export function makeScriptProxy<T extends Table>(type: T, object: TableType<T>): Required<EventsType<T>> {

    const aggregates = eventAggregates[type];

    return new Proxy({}, {
        get(_target, key, _receiver) {

            if (typeof key === 'string' && key in aggregates) {
                const defs = object.events ?? [];
                const events = defs.map(x => ({
                    event: getScript(type, x.name) as Record<string, Function>,
                    parameters: x.parameters
                }));

                return (...args: any[]) => {
                    return aggregates[key](events, args[0]);
                }
            }

            return undefined;
        }
    }) as Required<EventsType<T>>;
}
