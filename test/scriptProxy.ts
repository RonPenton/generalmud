import { TableType } from "../src/server/db/types";
import { makeScriptProxy } from "../src/server/scripts/makeScriptProxy";

const room: TableType<'rooms'> = {
    
} as any;

describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('proxy catches changes to basic properties.', () => {

        const scr = makeScriptProxy('rooms', room);

        expect(scr.canEnter({} as any)).toBe(true);
        expect(scr.canLeave({} as any)).toBe(true);
        expect(scr.canLook({} as any)).toBe(true);
        expect(scr.hasEntered).not.toBeUndefined();
        expect(scr.hasLeft).not.toBeUndefined();
        expect(scr.hasLooked).not.toBeUndefined();
    });
});