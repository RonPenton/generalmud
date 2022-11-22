import { Table, EventsType } from "../db/types";
import { World } from "../world/world"

export type BaseEvent = {
    world: World;
}

export type EventDefinition = {
    name: string;
    parameters?: Record<string, any>
}

export function makeScript<
    T extends Table,
    P extends Record<string, any> = {}
>(script: WrapWithParameters<EventsType<T>, P>): EventsType<T> {
    return script;
}

export type EventFunc = (...args: any) => any;
export type EventsObject = Record<string, EventFunc>;
export type AddParameter<T extends EventFunc, P extends Record<string, any>> = (args: Parameters<T>[0] & { parameters: P }) => ReturnType<T>;
export type WrapWithParameters<T extends EventsObject, P extends Record<string, any>> = {
    [K in keyof T]: AddParameter<T[K], P>;
}
