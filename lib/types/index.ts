export interface Message {
    command: string;
    params: Record<string, unknown>;
}

export interface StateResult {
    initial: boolean;
    updates: string[];
    state: unknown;
}

export * from './system-state-types'