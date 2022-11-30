import { EventsType } from '../../db/types';
import { directionReferences } from '../../models/direction';
import { matchPatterns } from '../../utils/parse';
import { WrapWithParameters } from '../base';

declare module '../../models/portal' {
    interface PortalProperties {
        doorOpen?: boolean;
    }
}

type DoorParameters = {};

type Door = WrapWithParameters<EventsType<'portals'>, DoorParameters>;

const describe: Door['describe'] = ({ description, portal }) => {

    let state = 'closed';
    if (portal.properties.doorOpen) {
        state = 'open';
    }
    return `${state} door ${description}`;
}

const command: Door['command'] = ({ command, parameters, world, player, portal, direction }) => {
    const tokens = [command, ...parameters]
    const directions = directionReferences(direction);
    if (matchPatterns(tokens, [
        ['open', 'door?', directions],
        ['open', 'door']
    ])) {
        if (portal.properties.doorOpen)
            return false;
        portal.properties.doorOpen = true;
        world.sendTextToActorsRoom(player, {
            secondPerson: `You open the door to the ${direction}.`,
            thirdPerson: `${player.name} opens the door to the ${direction}.`
        });
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
            secondPerson: `You close the door to the ${direction}.`,
            thirdPerson: `${player.name} closes the door to the ${direction}.`
        });
        return true;
    }

    return false;
};

const canSeeThrough: Door['canSeeThrough'] = ({ portal }) => {
    return !!portal.properties.doorOpen;
};

const canEnter: Door['canEnter'] = ({ portal }) => {
    return !!portal.properties.doorOpen;
};

const tryEnter: Door['tryEnter'] = ({ world, actor, portal, direction }) => {
    if (!portal.properties.doorOpen) {
        world.sendTextToActorsRoom(actor, {
            secondPerson: `You bump into the closed door to the ${direction}`,
            thirdPerson: `${actor.name} bumps into the closed door to the ${direction}`
        });
        return false;
    }

    return true;
};


export const script: Door = {
    describe,
    canEnter,
    tryEnter,
    canSeeThrough,
    command
}
