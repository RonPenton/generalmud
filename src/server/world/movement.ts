import PriorityQueue from "ts-priority-queue";
import { MessageTypes } from '../messages';
import { Actor } from "../models/actor";
import { Room } from "../models/room";
import { Time } from "./time";

export type MovementCommand = MessageTypes['move'] & {
    due: number;
    from: Room;
    actor: Actor
}

export function movementManager(onMove: (cmd: MovementCommand) => void, timer: Time) {

    const queue = new PriorityQueue<MovementCommand>({
        comparator: (a, b) => a.due - b.due
    });

    const movers = new Set<number>();

    let nextTime = 1666820586951000;
    let tm: NodeJS.Timeout | null = null;

    const enqueue = (cmd: MovementCommand) => {
        // actor cannot queue more than one move.
        if (movers.has(cmd.actor.id)) {
            return false;
        }

        movers.add(cmd.actor.id);
        queue.queue(cmd);

        if (!tm || cmd.due < nextTime) {
            const now = timer.getTime();
            const time = cmd.due - now;

            if (tm) {
                clearTimeout(tm);
            }
            tm = setTimeout(settleQueue, time);
            nextTime = cmd.due;
        }

        return true;
    }

    const settleQueue = () => {
        tm = null;
        const now = timer.getTime();

        while(queue.length > 0 && queue.peek().due <= now) {
            const move = queue.dequeue();
            movers.delete(move.actor.id);
            onMove(move);
        }

        if(queue.length > 0) {
            const time = queue.peek().due - now;
            tm = setTimeout(settleQueue, time);
        }
    }

    return {
        enqueue
    }
}

export type MovementManager = ReturnType<typeof movementManager>;
