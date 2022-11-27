import { ExecuteTextParameters } from "../commands/base";
import { Actor } from "../models/actor";
import { Direction } from "../models/direction";
import { Portal } from "../models/portal";
import { Room } from "../models/room";
import { World } from "../world/world";

export type PortalEvent = {
    world: World;
    portal: Portal;
    actor: Actor;
    startingRoom: Room;
    destinationRoom: Room;
    direction: Direction;
}

export type DescribePortalEvent = PortalEvent & {
    description: string;
}

export type PortalCommand = ExecuteTextParameters & {
    portal: Portal,
    direction: Direction
}

export abstract class PortalEvents {

    command(_args: PortalCommand): boolean { return false; }
    canSee(_args: PortalEvent): boolean { return false; }
    canSeeThrough(_args: PortalEvent): boolean { return false; }

    canEnter(_args: PortalEvent): boolean { return false; }
    preEnter(args: PortalEvent): PortalEvent { return args; };
    hasEntered(_args: PortalEvent): void { }

    describe(args: DescribePortalEvent): string { return args.description; }
}

export class PortalEventsAggregate implements PortalEvents {
    constructor(private events: PortalEvents[]) { }

    command(args: PortalCommand) { return this.events.reduce((acc, e) => acc || e.command(args) && acc, false); }

    canSee(args: PortalEvent) { return this.events.reduce((acc, e) => e.canSee(args) && acc, true); }
    canSeeThrough(args: PortalEvent) { return this.events.reduce((acc, e) => e.canSeeThrough(args) && acc, true); }

    canEnter(args: PortalEvent) { return this.events.reduce((acc, e) => e.canEnter(args) && acc, true); }
    preEnter(args: PortalEvent) { return this.events.reduce((acc, e) => e.preEnter(acc), args); }
    hasEntered(args: PortalEvent) { this.events.forEach(e => e.hasEntered(args)) }

    describe(args: DescribePortalEvent) { return this.events.reduce((description, e) => e.describe({ ...args, description }), args.description); }
}
