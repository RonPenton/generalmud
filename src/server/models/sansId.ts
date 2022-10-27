export type SansId<T> = Omit<T, 'id'>;
export type OptionalId<T> = Omit<T, 'id'> & { id?: number };
