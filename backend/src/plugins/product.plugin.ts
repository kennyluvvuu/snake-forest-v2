import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import fastifyMultipart from "@fastify/multipart";
import * as schemas from "../schemas/product.schema";
import { ImageFilePartSchema } from "../schemas/image.schema";
import verifyApiKey from "../hooks/verify.api";
import * as errorSchemas from "../schemas/error.schema";

const productRoutes: FastifyPluginAsyncZod = async (fastify, options) => {
    fastify.register(fastifyMultipart);
    const productController = fastify.productController;
    const imageController = fastify.productImageController;

    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: z.array(schemas.GetProductPreviewSchema),
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const productList = await productController.getPreviews();
                if (!productList) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "No products found",
                    });
                }

                return productList;
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
        "/:id",
        {
            schema: {
                params: schemas.UrlParamsIdSchema,
                response: {
                    200: schemas.ProductSchema,
                    404: errorSchemas.NotFoundErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const product = await productController.get(request.params.id);
                if (!product) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, product you look does not exist",
                    });
                }

                return product;
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
                body: schemas.CreateProductSchema,
                response: {
                    201: schemas.ProductSchema,
                    400: errorSchemas.BadRequestErrorSchema,
                    401: errorSchemas.UnauthorizedErrorSchema,
                    500: errorSchemas.InternalServerErrorSchema,
                },
            },
            preHandler: verifyApiKey,
        },
        async (request, reply) => {
            try {
                const createdProduct = await productController.create(request.body);

                reply
                    .code(201)
                    .header("Location", `/api/products/${createdProduct.id}`)
                    .send(createdProduct);
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
                body: schemas.UpdateProductSchema,
                response: {
                    200: schemas.ProductSchema,
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
                const updatedProduct = await productController.update(
                    request.params.id,
                    request.body,
                );
                if (!updatedProduct) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, product you look does not exist",
                    });
                }

                return updatedProduct;
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
                const deleted = await productController.delete(request.params.id);
                if (!deleted) {
                    return reply.code(404).send({
                        statusCode: 404,
                        error: "Not found",
                        message: "Oops, product you look does not exist",
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
                        message: "Oops, product you look does not exist",
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
                        message: "Oops, product you look does not exist",
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
                        message: "Oops, product you look does not exist",
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

export default productRoutes;
