import type { FastifyReply, FastifyRequest } from "fastify";

export default async function verifyApiKey(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    if (request.headers["x-api-key"] !== request.server.config.adminApiKey) {
        return reply.code(401).send({
            statusCode: 401,
            error: "Unauthorized",
            message: "You dont have rights to do this",
        });
    }
}
