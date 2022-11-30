import React from 'react';

import { keysOf } from "tsc-utils";

const splitReg = /(\[(?:b|i|u|\/b|\/i|\/u|sm|md|lg|c|bg|\/c|\/bg)(?:=(?:#?[0-9a-z]+))?\])/i;
const codeReg = /\[(b|i|u|\/b|\/i|\/u|sm|md|lg|c|bg|\/c|\/bg)(?:=(#?[0-9a-z]+))?\]/i;

type RichStyle = {
    bold: 'b' | 'nb';
    italic: 'i' | 'ni';
    underline: 'u' | 'nu';
    size: 'sm' | 'md' | 'lg';
    color: string;
    background: string;
}

type RichStyleRun = {
    style: RichStyle;
    text: string;
}

const defaultStyles: RichStyle = {
    bold: 'nb',
    italic: 'ni',
    underline: 'nu',
    size: 'md',
    color: 'white',
    background: 'black'
};

function calculateToken(text: string): string | Partial<RichStyle> {
    const res = codeReg.exec(text);
    if (res) {
        const code = res[1];
        switch (code) {
            case 'b': return { bold: 'b' };
            case '/b': return { bold: 'nb' };
            case 'u': return { underline: 'u' };
            case '/u': return { underline: 'nu' };
            case 'i': return { italic: 'i' };
            case '/i': return { italic: 'ni' };
            case 'c': return { color: res[2] ?? defaultStyles.color };
            case '/c': return { color: defaultStyles.color };
            case 'bg': return { background: res[2] ?? defaultStyles.background };
            case '/bg': return { background: defaultStyles.background };
            case 'md':
            case 'sm':
            case 'lg':
                return { size: code };
        }
    }

    return text;
}

function calculateRuns(text: string): RichStyleRun[] {

    const split = text.split(splitReg).filter(x => x.length > 0);
    const runs: RichStyleRun[] = [];
    let style = { ...defaultStyles };

    for (const s of split) {
        const token = calculateToken(s);
        if (typeof token === 'string') {
            runs.push({ style, text: token });
        }
        else {
            style = { ...style, ...token };
        }
    }

    return runs;
}

function css(style: RichStyle) {
    return keysOf(style)
        .filter(x => x != 'color' && x != 'background')
        .map(key => style[key])
        .join(' ');
}

export const RichText: React.FC<{ text: string }> = ({ text }) => {

    const runs = calculateRuns(text);
    return <span className="rich-text">{
        runs.map(({ style, text }) => {
            const { color, background } = style;
            return <span className={css(style)} style={{ color, background }}>{text}</span>
        })
    }</span>
}
