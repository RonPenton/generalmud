import { EventDefinition } from "../scripts/base";

export interface WorldProperties { 

}

export interface WorldStorage {
    id: 1;
    time: number;
    properties: WorldProperties;
    events?: EventDefinition[];
}

