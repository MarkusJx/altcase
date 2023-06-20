#!/usr/bin/env node
import yargs from 'yargs';
import type * as yargsTypes from 'yargs';
import Conf from 'conf';
import inquirer from 'inquirer';
import clipboard from 'clipboardy';

interface Args {
    words?: string[];
    settings: boolean;
    startWithUppercase: boolean;
}

interface SettingsResult {
    settings: (keyof Config)[];
}

type YargsHandler<T> = (
    args: yargsTypes.ArgumentsCamelCase<T>
) => Promise<void>;

interface Config {
    copyToClipboard: boolean;
    startWithUppercase: boolean;
    randomCase: boolean;
}

const configDefaults: Config = {
    copyToClipboard: false,
    startWithUppercase: true,
    randomCase: false,
};

const configKeys = Object.keys(configDefaults) as (keyof Config)[];

const config = new Conf<Config>({
    projectName: 'altcase',
    defaults: configDefaults,
});

const builder: yargsTypes.BuilderCallback<{}, Args> = (command) => {
    command
        .positional('words', {
            describe: 'The words',
            type: 'string',
        })
        .option('settings', {
            boolean: true,
            description: 'Display settings',
            alias: 's',
        })
        .conflicts('settings', 'words')
        .option('startWithUppercase', {
            boolean: true,
            default: config.get('startWithUppercase'),
            description: 'Whether to start the text using upper case',
            alias: 'u',
        })
        .showHelpOnFail(true);
};

const toAltCase = (str: string[], startWithUppercase: boolean): string => {
    let lowerCase = startWithUppercase;

    const isLowerCase = (i: number) => {
        lowerCase = !lowerCase;
        if (i === 0 && startWithUppercase) {
            return false;
        } else if (config.get('randomCase')) {
            return Math.round(Math.random()) === 0;
        } else {
            return lowerCase;
        }
    };

    return str
        .join(' ')
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

const handler: YargsHandler<Args> = async ({
    words,
    settings,
    startWithUppercase,
}) => {
    if (settings) {
        const res: SettingsResult = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'settings',
                message: 'Settings',
                choices: [
                    {
                        name: 'Copy to clipboard',
                        value: 'copyToClipboard',
                        checked: config.get('copyToClipboard'),
                    },
                    {
                        name: 'Start with upper case',
                        value: 'startWithUppercase',
                        checked: config.get('startWithUppercase'),
                    },
                    {
                        name: 'Randomize casing',
                        value: 'randomCase',
                        checked: config.get('randomCase'),
                    },
                ],
            },
        ]);

        for (let key of configKeys) {
            config.set(key, res.settings.includes(key));
        }
    } else if (words) {
        const converted = toAltCase(words, startWithUppercase);
        if (config.get('copyToClipboard')) {
            await clipboard.write(converted);
        }

        console.log(converted);
    } else {
        throw 'Error: Either --settings or words are required';
    }
};

yargs(process.argv.slice(2))
    .command('* [words..]', false, builder, handler)
    .parse();
