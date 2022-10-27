import { Env, parseDotEnv } from 'ts-dotenv-parser';

const parseEnv = () => {
    return parseDotEnv(
        {
            POSTGRES_CONNECTION_STRING: Env.string(),
            PORT: Env.number({ default: 3061 }),
            COOKIE_SECRET: Env.string(),
            GAME_NAME: Env.string(),
            STARTING_ROOM: Env.number()
        }
    );
};

export type Environment = ReturnType<typeof parseEnv>;

let environment: Environment;
export const getEnv = () => {
    if (!environment) {
        environment = parseEnv();
    }
    return environment;
};
