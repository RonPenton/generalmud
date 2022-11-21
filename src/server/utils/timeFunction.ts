export type TimedFunction<T> = (() => T) | (() => Promise<T>);
export type TimeReporter = (ms: number) => void;

export async function time<T>(func: TimedFunction<T>, after: TimeReporter): Promise<T> {
    const start = Date.now();
    const val = func();
    let ret: T;
    if (typeof val === 'object' && val != null && 'then' in val) {
        ret = await val.then();
    }
    else {
        ret = val;
    }

    const ms = Date.now() - start;
    after(ms);
    return ret;
}
