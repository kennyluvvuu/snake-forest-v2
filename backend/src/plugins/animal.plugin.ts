import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import fastifyMultipart from "@fastify/multipart";
import * as schemas from "../schemas/animal.schema";
import { ImageFilePartSchema } from "../schemas/image.schema";
import verifyApiKey from "../hooks/verify.api";
import * as errorSchemas from "../schemas/error.schema";

const animalRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
    fastify.register(fastifyMultipart);
    const animalController = fastify.animalController;
    const imageController = fastify.animalImageController;
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: z.array(schemas.GetAnimalPreviewSchema),
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                let animalList = await animalController.getPreviews();
                if (!animalList) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                return animalList;
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );

    fastify.get(
        "/:slug",
        {
            schema: {
                params: schemas.UrlParamsSlugSchema,
                response: {
                    200: schemas.AnimalSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                let animal = await animalController.getBySlug(request.params.slug);
                if (!animal) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                return animal;
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );

    fastify.post(
        "/",
        {
            schema: {
                body: schemas.CreateAnimalSchema,
                response: {
                    201: schemas.AnimalSchema,
                    400: errorSchemas.BadRequestErrorSchema,
                    401: errorSchemas.UnauthorizedErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
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
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
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
                response: {
                    200: schemas.AnimalSchema,
                    400: errorSchemas.BadRequestErrorSchema,
                    401: errorSchemas.UnauthorizedErrorSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
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
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                return updatedAnimal;
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );

    fastify.delete(
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                response: {
                    200: z.object({}),
                    401: errorSchemas.UnauthorizedErrorSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                let deleted = await animalController.delete(request.params.id);
                if (!deleted) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                reply.code(200);
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );

    fastify.post(
        "/:id/images",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                response: {
                    201: z.object({
                        uploads: z.array(z.string()),
                    }),
                    400: errorSchemas.BadRequestErrorSchema,
                    401: errorSchemas.UnauthorizedErrorSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                const files = [];
                for await (const file of request.files()) {
                    const buffer = await file.toBuffer();
                    const validFile = ImageFilePartSchema.parse(file);

                    files.push({
                        ...validFile,
                        buffer: buffer,
                    });
                }
                const ok = await imageController.clear(request.params.id);
                if (!ok) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }
                const createdImages = await imageController.add(
                    request.params.id,
                    files,
                );
                if (!createdImages) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }

                reply.code(201).send({
                    uploads: createdImages,
                });
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );

    fastify.put(
        "/:id/images",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                response: {
                    201: z.object({
                        uploads: z.array(z.string()),
                    }),
                    400: errorSchemas.BadRequestErrorSchema,
                    401: errorSchemas.UnauthorizedErrorSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                const files = [];
                for await (const file of request.files()) {
                    const buffer = await file.toBuffer();
                    const validFile = ImageFilePartSchema.parse(file);

                    files.push({
                        ...validFile,
                        buffer: buffer,
                    });
                }
                const createdImages = await imageController.add(
                    request.params.id,
                    files,
                );
                if (!createdImages) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, animal you look does not exist",
                    });
                }
                reply.code(201).send({
                    uploads: createdImages,
                });
            } catch (e) {
                reply.code(500).send({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message:
                        e instanceof Error
                            ? e.message
                            : "Internal server error",
                });
            }
        },
    );
};

export default animalRoutes;
