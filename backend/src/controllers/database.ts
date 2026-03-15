import { type dbConfig } from "../interfaces/config.interface";
import mongoose from "mongoose";

export async function connectDb(config: dbConfig) {
    await mongoose.connect(
        `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.name}`,
        {
            authSource: "admin",
        },
    );
}
