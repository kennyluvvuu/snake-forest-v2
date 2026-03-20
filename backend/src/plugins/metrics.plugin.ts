import { type FastifyPluginCallback } from "fastify";

const metricsRoutes: FastifyPluginCallback = (fastify, options) => {
    fastify.get("/health", () => {
        return { status: "ok" };
    });
};

export default metricsRoutes;
