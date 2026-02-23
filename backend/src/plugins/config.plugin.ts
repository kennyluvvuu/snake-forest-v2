import fastify, { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getConfig } from "../config/configGetter";
import type Config from "../interfaces/config.interface";
export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate("config", getConfig());
});

declare module "fastify" {
    interface FastifyInstance {
        config: Config;
    }
}
