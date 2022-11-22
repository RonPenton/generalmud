import { EventDefinition } from "../scripts/base";

export interface RoomDescription {
    id: number;
    text: string;
    
    events?: EventDefinition[];
}
