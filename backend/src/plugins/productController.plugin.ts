import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type IProductController from "../interfaces/product.controller.interface";

// Dependency injection
export default fp(
    async (
        fastify: FastifyInstance,
        options: { productController: IProductController }
    ) => {
        const productController: IProductController = options.productController;

        fastify.decorate("productController", productController);
    }
);

declare module "fastify" {
    interface FastifyInstance {
        productController: IProductController;
    }
}
