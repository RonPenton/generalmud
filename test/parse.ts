import { flattenLinePattern, matchPatterns, tokens } from "../src/server/utils/parse";

describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('flattens line patterns', () => {
        const patterns = flattenLinePattern(['open', 'door', ['ne', 'northeast']]);
        expect(patterns[0]).toStrictEqual(['open', 'door', 'ne']);
        expect(patterns[1]).toStrictEqual(['open', 'door', 'northeast']);
    });

    test('flattens multiple line patterns', () => {
        const patterns = flattenLinePattern(['open', 'door', ['ne', 'northeast'], 'for', ['monster', 'creep']]);
        expect(patterns[0]).toStrictEqual(['open', 'door', 'ne', 'for', 'monster']);
        expect(patterns[1]).toStrictEqual(['open', 'door', 'ne', 'for', 'creep']);
        expect(patterns[2]).toStrictEqual(['open', 'door', 'northeast', 'for', 'monster']);
        expect(patterns[3]).toStrictEqual(['open', 'door', 'northeast', 'for', 'creep']);
    });

    test('matches patterns', () => {
        const input = 'open door west';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['open', 'door?', ['w', 'west']]
        ]);

        expect(match).toBe(true);
    });

    test('matches missing patterns', () => {
        const input = 'open west';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['open', 'door?', ['w', 'west']]
        ]);

        expect(match).toBe(true);
    });

    test('matches missing patterns', () => {
        const input = 'open door';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['open', 'door?', ['w', 'west']],
            ['open', 'door']
        ]);

        expect(match).toBe(true);
    });

    test('doesnt match wrong patterns', () => {
        const input = 'open';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['open', 'door?', ['w', 'west']],
            ['open', 'door']
        ]);

        expect(match).toBe(false);
    });

    test('matches wildcard patterns', () => {
        const input = 'a m';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['attack*', 'blue?', ['missionary*']]
        ]);

        expect(match).toBe(true);
    });

    test('fails wildcard patterns', () => {
        const input = 'a o';
        const t = tokens(input);
        const match = matchPatterns(t, [
            ['attack*', 'blue?', ['missionary*']]
        ]);

        expect(match).toBe(false);
    });

});