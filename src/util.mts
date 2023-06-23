import fs from 'node:fs/promises';
import Config from './config.mjs';
import { Args } from './types.mjs';

export const toAltCase = (str: string[] | string, args: Args): string => {
    let lowerCase = args.startWithUppercase && !args.startWithLowercase;

    const isLowerCase = (i: number) => {
        lowerCase = !lowerCase;
        if (i === 0 && args.startWithUppercase && !args.startWithLowercase) {
            return false;
        } else if (Config.get('randomCase')) {
            return Math.round(Math.random()) === 0;
        } else {
            return lowerCase;
        }
    };

    if (Array.isArray(str)) {
        str = str.join(' ');
    }

    return str
        .split('')
        .map((s, i) => {
            if (s === ' ') return s;

            if (isLowerCase(i)) {
                return s.toLocaleLowerCase();
            } else {
                return s.toLocaleUpperCase();
            }
        })
        .join('');
};

export const fileExists = (file: string) =>
    fs.access(file).then(
        () => true,
        () => false
    );
