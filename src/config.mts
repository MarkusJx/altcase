import Conf from 'conf';

export interface Configuration {
    copyToClipboard: boolean;
    startWithUppercase: boolean;
    randomCase: boolean;
}

export type ConfigKeys = keyof Configuration;

const configDefaults: Configuration = {
    copyToClipboard: false,
    startWithUppercase: true,
    randomCase: false,
};

const config = new Conf<Configuration>({
    projectName: 'altcase',
    defaults: configDefaults,
});

const configKeys = Object.keys(configDefaults) as ConfigKeys[];

export default abstract class Config {
    public static get configKeys(): ConfigKeys[] {
        return configKeys;
    }

    public static set<T extends ConfigKeys>(key: T, val: Configuration[T]) {
        config.set(key, val);
    }

    public static get<T extends ConfigKeys>(key: T): Configuration[T] {
        return config.get(key);
    }
}
