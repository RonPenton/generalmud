export const ExitTypes = ['normal'] as const;
export type ExitType = typeof ExitTypes[number];

export type NormalExit = { type: 'normal' };

export type ExitDetails = NormalExit;

export type ExitData = {
    exitRoom: number;
} & ExitDetails;
