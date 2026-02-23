import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import multipart from "@fastify/multipart";
import * as schemas from "../schemas/animal.schema";
import { ImageFilePartSchema } from "../schemas/image.schema";
import verifyApiKey from "../hooks/verify.api";

const animalRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
    const animalController = fastify.animalController;
    const imageController = fastify.animalImageController;
    fastify.get("/", async (request, reply) => {
        try {
            let animalList = await animalController.getPreviews();
            if (!animalList) {
                reply.code(404).send({
                    statusCode: 404,
                    error: "Not found",
                    message: "Oops, animal you look does not exist",
                });
            }

            return animalList;
        } catch (e) {
            reply.code(500).send({
                statusCode: 500,
                error: e,
                message: "Internal server error",
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
                if (!animal) {
                    reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                return animal;
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: e,
                    message: "Internal server error",
                });
            }
        },
    );

    fastify.post(
        "/",
        {
            schema: {
                body: schemas.CreateAnimalSchema,
            },
            preHandler: verifyApiKey,
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
                    statusCode: 500,
                    error: e,
                    message: "Internal server error",
                });
            }
        },
    );

    fastify.put(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                body: schemas.CreateAnimalSchema,
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                let updatedAnimal = await animalController.update(
                    request.body,
                    request.params.id,
                );
                if (!updatedAnimal) {
                    reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                return updatedAnimal;
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: e,
                    message: "Internal server error",
                });
            }
        },
    );

    fastify.delete(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                let deleted = await animalController.delete(request.params.id);
                if (!deleted) {
                    reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                reply.code(200);
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: e,
                    message: "Internal server error",
                });
            }
        },
    );

    fastify.post(
        "/:id/images",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            const files = [];
            for await (const file of request.files()) {
                const validFile = ImageFilePartSchema.parse(file);

                files.push(validFile);
            }
            const ok = await imageController.clear(request.params.id);
            if (!ok) {
                reply.code(404).send({
                    statusCode: 404,
                    error: "Not found",
                    message: "Oops, animal you look does not exist",
                });
            }
            const createdImages = await imageController.add(
                request.params.id,
                files,
            );

            reply.code(201).send({
                uploads: createdImages,
            });
        },
    );

    fastify.put(
        "/:id/images",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            const files = [];
            for await (const file of request.files()) {
                const validFiles = ImageFilePartSchema.parse(file);

                files.push(validFiles);
            }
            const createdImages = await imageController.add(
                request.params.id,
                files,
            );
            if (!createdImages) {
                reply.code(404).send({
                    statusCode: 404,
                    error: "Not found",
                    message: "Oops, animal you look does not exist",
                });
            }
            reply.code(201).send({
                uploads: createdImages,
            });
        },
    );
};

export default animalRoutes;
