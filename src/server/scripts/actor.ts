import { Actor } from "../models/actor";
import { BaseEvent } from "./base";

export type BaseActorEvent = BaseEvent & {
    actor: Actor;
}

// export type ActorEvents = Partial<{}>;
