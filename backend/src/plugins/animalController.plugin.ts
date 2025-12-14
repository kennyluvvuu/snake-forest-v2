import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type IAnimalController from "../interfaces/animal.controller.interface";

// Dependency injection
export default fp(
    async (
        fastify: FastifyInstance,
        options: { animalController: IAnimalController }
    ) => {
        const animalController: IAnimalController = options.animalController;

        fastify.decorate("animalController", animalController);
    }
);

declare module "fastify" {
    interface FastifyInstance {
        animalController: IAnimalController;
    }
}
