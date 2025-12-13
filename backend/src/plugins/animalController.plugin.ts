import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { IAnimalController } from "../interfaces/animal.controller.interface";
import { AnimalController } from "../controllers/animal.controller";

// Dependency injection
export default fp(async (server: FastifyInstance, options) => {
    const animalController: IAnimalController = new AnimalController();

    server.decorate("animalController", animalController);
});

declare module "fastify" {
    interface FastifyInstance {
        animalController: IAnimalController;
    }
}
