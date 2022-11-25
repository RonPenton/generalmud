import { ExecuteTextWith } from "../commands/base";
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

export type PortalEvents = {

    command?: ExecuteTextWith<{ portal: Portal, direction: Direction }>;

    canSee?: (args: PortalEvent) => boolean;
    canSeeThrough?: (args: PortalEvent) => boolean;

    canEnter?: (args: PortalEvent) => boolean;
    preEnter?: (args: PortalEvent) => PortalEvent;
    hasEntered?: (args: PortalEvent) => void;

    describe?: (args: DescribePortalEvent) => string;
}
