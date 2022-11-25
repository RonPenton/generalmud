import { ProxyObject } from "../db/types";
import { EventDefinition } from "../scripts/base";

export type PortalStorage = {
    id: number;
    
    properties: PortalProperties;

    events?: EventDefinition[];
}

export interface PortalProperties {

}

export type Portal = ProxyObject<'portals'>;

