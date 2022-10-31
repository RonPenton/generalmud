import Decimal from "decimal.js";
import { deserializeDecimals, serializeDecimals } from "../src/server/utils/serializeDecimals";


describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deserializes decimals', () => {
        const item = {
            property: "decimal://42526.4",
            array: ["decimal://42", "decimal://0.00000001", "decimal://1e2000"]
        } as any

        deserializeDecimals(item);

        expect((item.property as Decimal).eq(42526.4)).toEqual(true);
        expect((item.array[0] as Decimal).eq(42)).toEqual(true);
        expect((item.array[1] as Decimal).eq(0.00000001)).toEqual(true);
        expect((item.array[2] as Decimal).eq(new Decimal("1e2000"))).toEqual(true);
    });

    test('serializes decimals', () => {
        const item = {
            property: new Decimal(42526.4),
            array: [new Decimal(42), new Decimal(0.00000001), new Decimal("1e2000")]
        } as any;

        serializeDecimals(item);

        expect(item.property).toEqual("decimal://42526.4");
        expect(item.array[0]).toEqual("decimal://42");
        expect(item.array[1]).toEqual("decimal://1e-8");
        expect(item.array[2]).toEqual("decimal://1e+2000");
    });

    test('round trip', () => {
        const item = {
            property: new Decimal(42526.4),
            array: [new Decimal(42), new Decimal(0.00000001), new Decimal("1e2000")],
            nested: {
                nest1: new Decimal("-97097204967029476092746029746924375026982606086123957295629"),
                nestArray: [{
                    nest2: new Decimal("-1.00000000000000000000000000000000000001")
                }, {
                    nest2: new Decimal("3.00000000000000000040000000000000000001")
                }]
            }
        } as any;

        serializeDecimals(item);
        deserializeDecimals(item);

        expect(item.property).toEqual(new Decimal(42526.4));
        expect(item.array[0]).toEqual(new Decimal(42));
        expect(item.array[1]).toEqual(new Decimal(0.00000001));
        expect(item.array[2]).toEqual(new Decimal("1e2000"));
        expect(item.nested.nest1).toEqual(new Decimal("-97097204967029476092746029746924375026982606086123957295629"));
        expect(item.nested.nestArray[0].nest2).toEqual(new Decimal("-1.00000000000000000000000000000000000001"));
        expect(item.nested.nestArray[1].nest2).toEqual(new Decimal("3.00000000000000000040000000000000000001"));
    });

});