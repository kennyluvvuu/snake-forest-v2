import Fasify from "fastify";
import animalControllerPlugin from "./plugins/animalController.plugin";
import animalRoutes from "./plugins/animal.plugin";
import { getConfig } from "./config/configGetter";
import { connectDb } from "./controllers/database";
import {
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import AnimalController from "./controllers/animal.controller";
import imageControllerPlugin from "./plugins/imageController.plugin";
import ImageController from "./controllers/image.controller";
import { Animal } from "./models/animal.model";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import configPlugin from "./plugins/config.plugin";

console.log("hello lox");

const app = Fasify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();

// setting validator compilers and serializers, for zod validator
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

async function bootstrapServer() {
    try {
        await app.register(configPlugin);
        app.log.info(app.config);
        await connectDb(app.config.db);

        await app.register(animalControllerPlugin, {
            animalController: new AnimalController(),
        });

        await app.register(imageControllerPlugin, {
            imageController: new ImageController(Animal, "./uploads"),
            registerName: "animalImageController",
        });

        await app.register(animalRoutes, { prefix: "/animals" });
        await app.listen({
            port: 8080,
            host: "::",
        });
    } catch (e) {
        app.log.error(e);

        process.exit(1);
    }
}

bootstrapServer();
