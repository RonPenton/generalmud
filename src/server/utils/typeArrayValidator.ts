export type Validator<T> = (obj: any) => obj is T;

export function typeArrayValidator<T extends string>(items: readonly T[]): Validator<T> {
    return (obj: any): obj is T => {
        return items.includes(obj);
    };
}
