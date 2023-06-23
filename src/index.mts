import yargs, { BuilderCallback } from 'yargs';
import inquirer from 'inquirer';
import clipboard from 'clipboardy';
import fs from 'node:fs/promises';
import Config from './config.mjs';
import { fileExists, toAltCase } from './util.mjs';
import type { Args, SettingsResult, YargsHandler } from './types.mjs';

const builder: BuilderCallback<{}, Args> = (command) => {
    command
        .positional('words', {
            describe: 'The words',
            type: 'string',
        })
        .option('settings', {
            type: 'boolean',
            description: 'Display settings',
            alias: 's',
        })
        .option('startWithUppercase', {
            type: 'boolean',
            default: Config.get('startWithUppercase'),
            description: 'Whether to start the text using upper case',
            alias: 'u',
        })
        .option('startWithLowercase', {
            type: 'boolean',
            description: 'Whether to start the text using lower case',
            alias: 'l',
        })
        .option('file', {
            type: 'string',
            array: true,
            description:
                'A file to convert to alternating case. Requires two strings as ' +
                'an input, the first one is the input, the second the output',
            alias: 'f',
        })
        .conflicts('settings', 'words')
        .conflicts('settings', 'file')
        .conflicts('words', 'file')
        .showHelpOnFail(true);
};

const handler: YargsHandler<Args> = async (args) => {
    const { settings, words, file } = args;

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
                        checked: Config.get('copyToClipboard'),
                    },
                    {
                        name: 'Start with upper case',
                        value: 'startWithUppercase',
                        checked: Config.get('startWithUppercase'),
                    },
                    {
                        name: 'Randomize casing',
                        value: 'randomCase',
                        checked: Config.get('randomCase'),
                    },
                ],
            },
        ]);

        for (let key of Config.configKeys) {
            Config.set(key, res.settings.includes(key));
        }
    } else if (words) {
        const converted = toAltCase(words, args);
        if (Config.get('copyToClipboard')) {
            await clipboard.write(converted);
        }

        console.log(converted);
    } else if (file) {
        if (file.length != 2 || !file[0]?.trim() || !file[1]?.trim()) {
            throw 'Error: --file requires exactly 2 arguments';
        } else if (await fileExists(file[1])) {
            throw 'Error: The output file already exists';
        }

        const contents = await fs.readFile(file[0], 'utf-8');
        await fs.writeFile(file[1], toAltCase(contents, args), 'utf-8');
    } else {
        throw 'Error: Either --settings, --file or words are required';
    }
};

yargs(process.argv.slice(2))
    .command('* [words..]', false, builder, handler)
    .parse();
