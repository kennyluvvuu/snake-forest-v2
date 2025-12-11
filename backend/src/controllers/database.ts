import { dbConfig } from "../interfaces/config.interface";
import mongoose from "mongoose";

function connectDb (config: dbConfig) {
    try {
        mongoose.connect(`mongodb://${config.host}:${config.port}/${config.name}`)
    } catch (err) {
        throw new Error(`Cannot connect to DB: ${err}`)
    }
}