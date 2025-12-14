import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import * as schemas from "../schemas/animal.schema";

const animalRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
    const animalController = fastify.animalController;
    fastify.get("/", async (request, reply) => {
        try {
            let animalList = await animalController.getPreviews();

            return animalList;
        } catch (e) {
            reply.code(500).send({
                error: e,
            });
        }
    });

    fastify.get(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
            },
        },
        async (request, reply) => {
            try {
                let animal = await animalController.get(request.params.id);

                return animal;
            } catch (e) {
                reply.code(500).send({
                    error: e,
                });
            }
        }
    );

    fastify.post(
        "/",
        {
            schema: {
                body: schemas.CreateAnimalSchema,
            },
        },
        async (request, reply) => {
            try {
                let createdAnimal = await animalController.create(request.body);

                reply
                    .code(201)
                    .header("Location", `/api/animals/${createdAnimal.id}`)
                    .send(createdAnimal);
            } catch (e) {
                reply.code(500).send({
                    error: e,
                });
            }
        }
    );

    fastify.put(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                body: schemas.CreateAnimalSchema,
            },
        },
        async (request, reply) => {
            try {
                let updatedAnimal = await animalController.update(
                    request.body,
                    request.params.id
                );

                return updatedAnimal;
            } catch (e) {
                reply.code(500).send({
                    error: e,
                });
            }
        }
    );

    fastify.delete(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
            },
        },
        async (request, reply) => {
            try {
                await animalController.delete(request.params.id);

                reply.code(200);
            } catch (e) {
                reply.code(500).send({
                    error: e,
                });
            }
        }
    );
};

export default animalRoutes;
