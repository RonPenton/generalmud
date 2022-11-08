import { Item } from "../models/Item";
import { BaseEvent } from "./base";

export type BaseItemEvent = BaseEvent & {
    item: Item;
}

export type ItemEvents = Partial<{}>;
