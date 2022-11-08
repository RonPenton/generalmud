import Decimal from "decimal.js";
import { ProxyObject } from "../db/generic";
import { EventDefinition } from "../scripts/base";

export type ItemStorage = {
    id: number;
    name: string;
    desc: string;
    cost: Decimal;
    room?: number;
    actor?: number;
    properties: ItemProperties;
    events?: EventDefinition[];
}

export interface ItemProperties {

}

export type Item = ProxyObject<'items'>;

