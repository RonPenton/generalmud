import { PartialRecord } from "tsc-utils"

export interface MmudRoomRaw {
    MapNumber: number
    RoomNumber: number
    Name: string
    Desc0: string
    Desc1: string
    Desc2: string
    Desc3: string
    Desc4: string
    Desc5: string
    Desc6: string
    AnsiMap: string
    Type: number
    ShopNumber: number
    GangHouseNumber: number
    MonType: number
    MinIndex: number
    MaxIndex: number
    MaxRegen: number
    MaxArea: number
    ControlRoom: number
    Light: number
    Runic: number
    Platinum: number
    Gold: number
    Silver: number
    Copper: number
    InvisRunic: number
    InvisPlatinum: number
    InvisGold: number
    InvisSilver: number
    InvisCopper: number
    Attributes: number
    DeathRoom: number
    ExitRoom: number
    CommandText: number
    Delay: number
    PermNPC: number
    Spell: number
    Exit0: number
    Type0: number
    Para10: number
    Para20: number
    Para30: number
    Para40: number
    Exit1: number
    Type1: number
    Para11: number
    Para21: number
    Para31: number
    Para41: number
    Exit2: number
    Type2: number
    Para12: number
    Para22: number
    Para32: number
    Para42: number
    Exit3: number
    Type3: number
    Para13: number
    Para23: number
    Para33: number
    Para43: number
    Exit4: number
    Type4: number
    Para14: number
    Para24: number
    Para34: number
    Para44: number
    Exit5: number
    Type5: number
    Para15: number
    Para25: number
    Para35: number
    Para45: number
    Exit6: number
    Type6: number
    Para16: number
    Para26: number
    Para36: number
    Para46: number
    Exit7: number
    Type7: number
    Para17: number
    Para27: number
    Para37: number
    Para47: number
    Exit8: number
    Type8: number
    Para18: number
    Para28: number
    Para38: number
    Para48: number
    Exit9: number
    Type9: number
    Para19: number
    Para29: number
    Para39: number
    Para49: number
    RoomItem0: number
    RoomItem0USES: number
    RoomItem0QTY: number
    RoomItem1: number
    RoomItem1USES: number
    RoomItem1QTY: number
    RoomItem2: number
    RoomItem2USES: number
    RoomItem2QTY: number
    RoomItem3: number
    RoomItem3USES: number
    RoomItem3QTY: number
    RoomItem4: number
    RoomItem4USES: number
    RoomItem4QTY: number
    RoomItem5: number
    RoomItem5USES: number
    RoomItem5QTY: number
    RoomItem6: number
    RoomItem6USES: number
    RoomItem6QTY: number
    RoomItem7: number
    RoomItem7USES: number
    RoomItem7QTY: number
    RoomItem8: number
    RoomItem8USES: number
    RoomItem8QTY: number
    RoomItem9: number
    RoomItem9USES: number
    RoomItem9QTY: number
    RoomItem10: number
    RoomItem10USES: number
    RoomItem10QTY: number
    RoomItem11: number
    RoomItem11USES: number
    RoomItem11QTY: number
    RoomItem12: number
    RoomItem12USES: number
    RoomItem12QTY: number
    RoomItem13: number
    RoomItem13USES: number
    RoomItem13QTY: number
    RoomItem14: number
    RoomItem14USES: number
    RoomItem14QTY: number
    RoomItem15: number
    RoomItem15USES: number
    RoomItem15QTY: number
    RoomItem16: number
    RoomItem16USES: number
    RoomItem16QTY: number
    HiddenItem0: number
    HiddenItem0USES: number
    HiddenItem0QTY: number
    HiddenItem1: number
    HiddenItem1USES: number
    HiddenItem1QTY: number
    HiddenItem2: number
    HiddenItem2USES: number
    HiddenItem2QTY: number
    HiddenItem3: number
    HiddenItem3USES: number
    HiddenItem3QTY: number
    HiddenItem4: number
    HiddenItem4USES: number
    HiddenItem4QTY: number
    HiddenItem5: number
    HiddenItem5USES: number
    HiddenItem5QTY: number
    HiddenItem6: number
    HiddenItem6USES: number
    HiddenItem6QTY: number
    HiddenItem7: number
    HiddenItem7USES: number
    HiddenItem7QTY: number
    HiddenItem8: number
    HiddenItem8USES: number
    HiddenItem8QTY: number
    HiddenItem9: number
    HiddenItem9USES: number
    HiddenItem9QTY: number
    HiddenItem10: number
    HiddenItem10USES: number
    HiddenItem10QTY: number
    HiddenItem11: number
    HiddenItem11USES: number
    HiddenItem11QTY: number
    HiddenItem12: number
    HiddenItem12USES: number
    HiddenItem12QTY: number
    HiddenItem13: number
    HiddenItem13USES: number
    HiddenItem13QTY: number
    HiddenItem14: number
    HiddenItem14USES: number
    HiddenItem14QTY: number
    PlacedItem0: number
    PlacedItem1: number
    PlacedItem2: number
    PlacedItem3: number
    PlacedItem4: number
    PlacedItem5: number
    PlacedItem6: number
    PlacedItem7: number
    PlacedItem8: number
    PlacedItem9: number
    CurrentRoomMon0: number
    CurrentRoomMon1: number
    CurrentRoomMon2: number
    CurrentRoomMon3: number
    CurrentRoomMon4: number
    CurrentRoomMon5: number
    CurrentRoomMon6: number
    CurrentRoomMon7: number
    CurrentRoomMon8: number
    CurrentRoomMon9: number
    CurrentRoomMon10: number
    CurrentRoomMon11: number
    CurrentRoomMon12: number
    CurrentRoomMon13: number
    CurrentRoomMon14: number
}


export const DirectionNames = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'up', 'down'] as const;
export type Direction = typeof DirectionNames[number];

export const ExitTypes = ['normal', 'UNSUPPORTED-spell', 'UNSUPPORTED-key', 'UNSUPPORTED-item', 'UNSUPPORTED-toll',
    'UNSUPPORTED-show-message', 'UNSUPPORTED-hidden', 'UNSUPPORTED-door',
    'UNSUPPORTED-map-change', 'UNSUPPORTED-trap', 'UNSUPPORTED-text', 'UNSUPPORTED-gate',
    'UNSUPPORTED-remote-action', 'UNSUPPORTED-class',
    'UNSUPPORTED-race', 'UNSUPPORTED-level', 'UNSUPPORTED-timed', 'UNSUPPORTED-ticket',
    'UNUSED-user-count', 'UNSUPPORTED-block-guard', 'UNSUPPORTED-alignment',
    'UNUSED-delay', 'UNSUPPORTED-cast', 'UNSUPPORTED-ability', 'UNSUPPORTED-spell-trap'] as const;
export type ExitType = typeof ExitTypes[number];

export type NormalExit = { type: 'normal' };
// export type KeyExit = { type: 'key', keyRequired: number, pickDifficulty: number, openTimeSeconds: number };
// export type ItemExit = { type: 'item', itemRequired: number, failedPassageMessageBlock: number, passageMessageBlock: number };

// check if exitNameMessage is ever anything other than 0 or 1.
// export const HiddenExitTypes = ['UNUSED', 'passable', 'search'] as const;
// export type HiddenExitType = typeof HiddenExitTypes[number];
// export type HiddenExit = { type: 'hidden', exitType: HiddenExitType, visibilityMessage?: number, exitNameMessage?: number }

// export type DoorExit = { type: 'door', chanceToPickBash: number, messageOnPassage: number, messageOnFail: number }
// export type GateExit = { type: 'gate', chanceToPickBash: number, messageOnPassage: number, messageOnFail: number }
// export type MapChangeExit = { type: 'map-change', newMap: number }

export type ExitDetails = NormalExit;

export type ExitData = {
    exitRoom: number;
} & ExitDetails;

export const RoomTypes = ['normal', 'UNSUPPORTED-shop', 'UNSUPPORTED-arena', 'UNSUPPORTED-lair', 'UNSUPPORTED-hotel', 'UNSUPPORTED-colliseum', 'UNSUPPORTED-jail', 'UNSUPPORTED-library'] as const;
export type RoomType = typeof RoomTypes[number];
export const MonsterTypes = ['lair', 'wanderer', 'npc', 'living', 'random', 'guard'] as const;
export type MonsterType = typeof MonsterTypes[number];


export const DirectionNos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type DirectionNo = typeof DirectionNos[number];
export type MMudRoomExitFixed = {
    Exit: number,
    Type: number,
    Para1: number,
    Para2: number,
    Para3: number,
    Para4: number
};

export type MMudRoomExit<T extends DirectionNo> = {
    [K in keyof MMudRoomExitFixed as `${K}${T}`]: MMudRoomExitFixed[K];
}

export function getMMudRoomExit<T extends DirectionNo>(direction: T, room: MmudRoomRaw): MMudRoomExitFixed {
    let output: any = {};
    output['Exit'] = room[`Exit${direction}`];
    output['Type'] = room[`Type${direction}`];
    output['Para1'] = room[`Para1${direction}`];
    output['Para2'] = room[`Para2${direction}`];
    output['Para3'] = room[`Para3${direction}`];
    output['Para4'] = room[`Para4${direction}`];
    return output;
}

export interface Description {
    id: number;
    text: string;
}

export interface MmudRoom {
    id: number;
    Name: string;
    Desc: number;
    Type: RoomType;
    Light: number;
    Exits: PartialRecord<Direction, ExitData>;
}
