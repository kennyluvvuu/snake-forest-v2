import config from "config";
import { dbConfig } from "../interfaces/config.interface";

export function getConfig(): dbConfig {
    return config.get<dbConfig>("dbConfig")
}
