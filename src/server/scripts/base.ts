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

export type EventsAggregate<T extends Table> = Required<EventsType<T>>;

export type EventsAggregateConstructor<T extends Table> = (events: Required<EventsType<T>>[]) => EventsAggregate<T>;

export type FunctionKeysExtending<T, E> = keyof {
    [K in keyof T as E extends T[K] ? K : never]: T[K];
}

export type CanFunction = (args: any) => boolean;
export function canAggregate<T, K extends FunctionKeysExtending<T, CanFunction>>(
    events: T[], key: K
) {
    return (args: any) => events.reduce((acc, e: any) => e[key](args) && acc, true);
}

export type HasFunction = (args: any) => void;
export function hasAggregate<T, K extends FunctionKeysExtending<T, HasFunction>>(
    events: T[], key: K
) {
    return (args: any) => events.forEach((e: any) => e[key](args));
}

export type PreFunction = <T>(args: T) => T;
export function preAggregate<T, K extends FunctionKeysExtending<T, PreFunction>>(
    events: T[], key: K
) {
    return (args: any) => events.reduce((acc, e: any) => e[key](acc), args);
}

export type HasDescription = { description: string; }
export type DescribeFunction = (args: HasDescription) => string;
export function describeAggregate<T, K extends FunctionKeysExtending<T, DescribeFunction>>(
    events: T[], key: K
) {
    return (args: any) => events.reduce((description, e: any) => e[key]({ ...args, description }), args.desription);
}

export type CommandFunction = (args: any) => boolean;
export function commandAggregate<T, K extends FunctionKeysExtending<T, CommandFunction>>(
    events: T[], key: K
) {
    return (args: any) => events.reduce((acc, e: any) => acc || e[key](args), false);
}
