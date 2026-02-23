import config from "config";
import type Config from "../interfaces/config.interface";

export function getConfig(): Config {
    return {
        db: {
            host: process.env.DB_HOST ? process.env.DB_HOST : "127.0.0.1",
            port: process.env.DB_PORT ? process.env.DB_PORT : "27017",
            user: process.env.DB_USER ? process.env.DB_USER : "admin",
            password: process.env.DB_PASSWORD
                ? process.env.DB_PASSWORD
                : "admin",
            name: process.env.DB_NAME ? process.env.DB_NAME : "default",
        },
        adminApiKey: process.env.API_KEY ? process.env.API_KEY : "default",
    };
}
