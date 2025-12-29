import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type IImageController from "../interfaces/image.controller.interface";
import type { Document, Model } from "mongoose";

export default fp(
  async<T extends Document>(fastify: FastifyInstance, options: {
    imageController: IImageController<T>,
    registerName: string
  }) => {
    const imageController = options.imageController;

    fastify.decorate(options.registerName, imageController);
  }
)

declare module "fastify" {
  interface FastifyInstance {
    animalImageController: IImageController<any>;
  }
}
