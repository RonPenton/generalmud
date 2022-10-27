import Decimal from "decimal.js";
import { PartialRecord } from "tsc-utils";

export const Currencies = ['runic', 'platinum', 'gold', 'silver', 'copper'] as const;
export type Currency = typeof Currencies[number];

export const conversion = {
    'copper': new Decimal(1),
    'silver': new Decimal(10),
    'gold': new Decimal(100),
    'platinum': new Decimal(10000),
    'runic': new Decimal(1000000)
} as const;// satisfies Record<Currency, Decimal>;

export type Wallet = PartialRecord<Currency, Decimal>;

function val(v: Decimal | number | undefined): Decimal {
    if (typeof v == 'number')
        return new Decimal(v);
    if (!v)
        return new Decimal(0);
    return v;
}

export function calculateWalletValue(wallet: Wallet): Decimal {
    return Currencies.reduce<Decimal>(
        (acc, c) => acc.add(conversion[c].mul(val(wallet[c]))),
        new Decimal(0)
    );
}

export function calculateWalletContents(value: Decimal | number): Wallet {
    let pot = new Decimal(value);
    return Currencies.reduce<Wallet>(
        (acc, c) => {
            const v = pot.div(conversion[c]).floor();
            if (v.greaterThan(0)) {
                acc[c] = v;
                pot = pot.minus(v.mul(conversion[c]));
            }
            return acc;
        }, {} as any
    );
}

export function reduceWallet(wallet: Wallet): Wallet {
    const value = calculateWalletValue(wallet);
    return calculateWalletContents(value);
}

export function getWallet(part: Partial<Wallet> | Partial<Record<Currency, number>>): Wallet {
    return Currencies.reduce<Wallet>(
        (acc, currency) => {
            const val = part[currency];
            if (val) {
                acc[currency] = new Decimal(val);
            }
            return acc;
        }, {} as any
    );
}
