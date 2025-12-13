import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { type IAnimalController } from "../interfaces/animal.controller.interface";
import * as schemas from "../schemas/animal.schema";

const animalRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
    fastify.get("/", async (request, reply) => {
        try {
            let animalList =
                await request.server.animalController.getPreviews();

            return animalList;
        } catch (e) {
            reply.code(500);
        }
    });
};

export default animalRoutes;
