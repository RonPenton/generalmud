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

export type EventPair<E> = { event: E, parameters: Record<string, any> };
export type AddEvents<T extends EventFunc, E> = (events: EventPair<E>[], args: Parameters<T>[0]) => ReturnType<T>;
export type EventsAggregate<T extends EventsObject> = {
    [K in keyof T]-?: AddEvents<T[K], T>
}

export type FunctionKeysExtending<T, E> = keyof {
    [K in keyof T as E extends T[K] ? K : never]: T[K];
}

export type CanFunction = (args: any) => boolean;
export function canAggregate<T, K extends FunctionKeysExtending<T, CanFunction>>(
    key: K
) {
    return (events: EventPair<T>[], args: any) => events.reduce(
        (acc, { event, parameters }) => (event as any)[key]({ ...args, parameters }) && acc,
        true
    );
}

export type HasFunction = (args: any) => void;
export function hasAggregate<T, K extends FunctionKeysExtending<T, HasFunction>>(
    key: K
) {
    return (events: EventPair<T>[], args: any) => events.forEach(
        ({ event, parameters }) => (event as any)[key]({ ...args, parameters })
    );
}

export type PreFunction = <T>(args: T) => T;
export function preAggregate<T, K extends FunctionKeysExtending<T, PreFunction>>(
    key: K
) {
    return (events: EventPair<T>[], args: any) => events.reduce(
        (acc, { event, parameters }) => (event as any)[key]({ ...args, ...acc, parameters }),
        args
    );
}

export type HasDescription = { description: string; }
export type DescribeFunction = (args: HasDescription) => string;
export function describeAggregate<T, K extends FunctionKeysExtending<T, DescribeFunction>>(
    key: K
) {
    return (events: EventPair<T>[], args: any) => events.reduce(
        (description, { event, parameters }) => (event as any)[key]({ ...args, description, parameters }),
        args.desription
    );
}

export type CommandFunction = (args: any) => boolean;
export function commandAggregate<T, K extends FunctionKeysExtending<T, CommandFunction>>(
    key: K
) {
    return (events: EventPair<T>[], args: any) => events.reduce(
        (acc, { event, parameters }) => acc || (event as any)[key]({ ...args, parameters }),
        false
    );
}
