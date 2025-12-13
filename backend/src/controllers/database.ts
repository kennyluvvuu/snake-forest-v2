import { type dbConfig } from "../interfaces/config.interface";
import mongoose from "mongoose";

export function connectDb(config: dbConfig) {
    try {
        mongoose.connect(
            `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.name}`,
            {
                authSource: "admin",
            }
        );
    } catch (err) {
        throw new Error(`Cannot connect to DB: ${err}`);
    }
}
