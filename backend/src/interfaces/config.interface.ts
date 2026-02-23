export default interface Config {
    db: dbConfig;
    adminApiKey: string;
}

export interface dbConfig {
    host: string;
    port: string;
    user: string;
    password: string;
    name: string;
}
