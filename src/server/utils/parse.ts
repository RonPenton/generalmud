export const tokens = (str: string) => str.split(/\s+/gi);

export const split = (str: string) => {
    const match = /(\w+)\s*(.*)/gi.exec(str) || [];
    return {
        head: match.length > 1 ? match[1] : "",
        tail: match.length > 2 ? match[2] : ""
    };
}

export type TokenPattern = string | string[];
export type LinePattern = TokenPattern[];

const n = (s: string) => s.toLowerCase();

export const matchPatterns = (tokens: string[], patterns: LinePattern[]) => {
    const p = patterns.flatMap(flattenLinePattern);
    return p.some(x => matchLine(tokens, x));
}

export function flattenLinePattern(linePattern: LinePattern): string[][] {
    let patterns: string[][] = [[]];
    for(const token of linePattern) {
        const t = [token].flat();
        patterns = patterns.flatMap(x => t.map(y => [...x, y]));
    }
    return patterns;
}

function matchLine(tokens: string[], pattern: string[]) {
    let cPattern = Array.from(pattern);
    let cTokens = Array.from(tokens);
    let p = cPattern.shift();
    let t = cTokens.shift();

    while(p !== undefined) {
        if(t === undefined) return false;   // tokens ran out before pattern matched. 

        const r = matchIndividualPattern(t, p);
        if(r == 'match-consume') {
            p = cPattern.shift();
            t = cTokens.shift();
        }
        else if(r == 'match-skip') {
            p = cPattern.shift();
        }
        else if(r == 'no-match') {
            return false;
        }
    }

    //TODO: What do do if tokens haven't run out but command is understood?

    return true;
}

function matchIndividualPattern(token: string, pattern: string): MatchResult {
    const { value, op } = getOp(pattern);
    if(op == 'equals') {
        if(n(value) == n(token))
            return 'match-consume';
        return 'no-match';
    }
    else if(op == 'optional') {
        if(n(value) == n(token))
            return 'match-consume';
        return 'match-skip';
    }
    else if(op == 'wildcard') {
        if(n(value).startsWith(n(token))) 
            return 'match-consume';
        return 'no-match';
    }
    throw new Error('logic error');
}

type CompareOperation = 'optional' | 'wildcard' | 'equals';

function getOp(pattern: string): { value: string, op: CompareOperation } {
    const last = pattern[pattern.length - 1];
    if (last == '?') {
        return { value: pattern.substring(0, pattern.length - 1), op: 'optional' };
    }
    if (last == '*') {
        return { value: pattern.substring(0, pattern.length - 1), op: 'wildcard' };
    }
    return { value: pattern, op: 'equals' }
}

type MatchResult = 'match-consume' | 'match-skip' | 'no-match';