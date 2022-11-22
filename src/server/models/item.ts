import Decimal from "decimal.js";
import { ProxyObject } from "../db/types";
import { EventDefinition } from "../scripts/base";

export type ItemStorage = {
    id: number;
    name: string;
    desc: string;
    cost: Decimal;
    
    properties: ItemProperties;

    room: number | null;
    actor: number | null;

    events?: EventDefinition[];
}

export interface ItemProperties {

}

export type Item = ProxyObject<'items'>;

