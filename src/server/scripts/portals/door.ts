import { EventsType } from '../../db/types';
import { directionReferences, getDirectionOpposite } from '../../models/direction';
import { matchPatterns } from '../../utils/parse';
import { WrapWithParameters } from '../base';

/**
 * Extend the PortalProperties structure to include a "doorOpen" property.
 * Remember, no properties are defined by default so make the property optional
 * such that the default state of the property is representable as undefined.
 * In this case, all doors are closed by default. 
 * We could experiment with the "parameters" option to configure a default, but
 * that's an experiment for a later time. 
 */
declare module '../../models/portal' {
    interface PortalProperties {
        doorOpen?: boolean;
    }
}

/**
 * By default door scripts have no parameters. This might change in the future. 
 * We may want to say Door({ defaultOpen: true }) in the future when attaching
 * the script to a room. 
 */
type DoorParameters = {};

/**
 * Use a type helper to wrap the default events object with our parameters.
 * In this case, nothing happens, but a more complex script would use this.
 */
type Door = WrapWithParameters<EventsType<'portals'>, DoorParameters>;

/**
 * How the script describes the portal. If not defined, the "direction" is used instead.
 * By default the "description" parameter contains the direction, which allows you to build
 * upon that.
 * @param param0 
 * @returns 
 */
const describe: Door['describe'] = ({ description, portal }) => {
    const state = portal.properties.doorOpen ? 'open' : 'closed';
    return `${state} door ${description}`;
}

/**
 * Attempts to interpret a string of input to see if the portal understands 
 * a command the user entered.
 * @param param0 
 * @returns 
 */
const command: Door['command'] = ({ tokens, world, player, portal, direction }) => {
    const directions = directionReferences(direction);
    const otherRoom = world.getRoom(player.room.exits[direction]?.exitRoom!);
    const opposite = getDirectionOpposite(direction);

    if (matchPatterns(tokens, [
        ['open', 'door?', directions],
        ['open', 'door']
    ])) {
        if (portal.properties.doorOpen)
            return false;
        portal.properties.doorOpen = true;
        world.sendTextToActorsRoom(player, {
            secondPerson: `[i]You open the door to the ${direction}.`,
            thirdPerson: `${player.name} opens the door to the ${direction}.`
        });
        world.sendToRoom(otherRoom, 'text', { text: `The door to the ${opposite} opens.` });
        return true;
    }
    else if (matchPatterns(tokens, [
        ['close', 'door?', directions],
        ['close', 'door']
    ])) {
        if (!portal.properties.doorOpen)
            return false;
        portal.properties.doorOpen = false;
        world.sendTextToActorsRoom(player, {
            secondPerson: `[i][sm]You close the door to the ${direction}.`,
            thirdPerson: `${player.name} closes the door to the ${direction}.`
        });
        world.sendToRoom(otherRoom, 'text', { text: `The door to the ${opposite} closes.` });
        return true;
    }

    return false;
};

/**
 * Determines if the actor can peek through a portal. Closed doors cannot be seen-through.
 * @param param0 
 * @returns 
 */
const canSeeThrough: Door['canSeeThrough'] = ({ portal }) => {
    return !!portal.properties.doorOpen;
};

/**
 * Determines if a portal can be entered, in an idempotent manner. No actions
 * should be taken in can* methods. These will potentially be used by pathfinders
 * to find a way through the realm.
 * @param param0 
 * @returns 
 */
const canEnter: Door['canEnter'] = ({ portal }) => {
    return !!portal.properties.doorOpen;
};

/**
 * Determines if a portal can be entered, and takes appropriate action
 * as if the actor has actually attempted to enter it.
 * @param param0  
 * @returns 
 */
const tryEnter: Door['tryEnter'] = ({ world, actor, portal, direction }) => {
    if (!portal.properties.doorOpen) {
        world.sendTextToActorsRoom(actor, {
            secondPerson: `[b][i]You bump into the closed door to the ${direction}`,
            thirdPerson: `${actor.name} bumps into the closed door to the ${direction}`
        });
        return false;
    }

    return true;
};

/**
 * Assemble the events into a script and export it. 
 */
export const script: Door = {
    describe,
    canEnter,
    tryEnter,
    canSeeThrough,
    command
}
