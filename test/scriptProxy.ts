import { makeScriptProxy } from "../src/server/scripts";
import { RoomEvents } from "../src/server/scripts/room";

const script: RoomEvents = {
    
}

describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('proxy catches changes to basic properties.', () => {

        const scr = makeScriptProxy(script);

        expect(scr.canEnter({} as any)).toBe(true);
        expect(scr.canLeave({} as any)).toBe(true);
        expect(scr.canLook({} as any)).toBe(true);
        expect(scr.hasEntered).not.toBeUndefined();
        expect(scr.hasLeft).not.toBeUndefined();
        expect(scr.hasLooked).not.toBeUndefined();
    });
});