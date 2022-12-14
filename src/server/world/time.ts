import { ProxyObject } from "../db/types";

export function startTimer(world: ProxyObject<'worlds'>) {

    const offset = Date.now() - world.time;

    return {
        getTime: function () {
            return Date.now() - offset;
        }
    }
}

export type Time = ReturnType<typeof startTimer>;
