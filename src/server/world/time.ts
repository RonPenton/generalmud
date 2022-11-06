import { WorldStorage } from "models/world";

export function startTimer(world: WorldStorage) {

    const offset = Date.now() - world.time;

    return {
        getTime: function () {
            return Date.now() - offset;
        }
    }
}

export type Time = ReturnType<typeof startTimer>;
