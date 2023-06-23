import { ArgumentsCamelCase } from 'yargs';
import { ConfigKeys } from './config.mjs';

export interface Args {
    words?: string[];
    settings: boolean;
    startWithUppercase: boolean;
    startWithLowercase: boolean;
    file?: string[];
}

export interface SettingsResult {
    settings: ConfigKeys[];
}

export type YargsHandler<T> = (args: ArgumentsCamelCase<T>) => Promise<void>;
