import Fasify from "fastify";
import animalControllerPlugin from "./plugins/animalController.plugin";
import animalRoutes from "./plugins/animal.plugin";
import { getConfig } from "./config/configGetter";
import { connectDb } from "./controllers/database";
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { AnimalController } from "./controllers/animal.controller";

console.log("hello lox");

const app = Fasify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();
// setting validator compilers and serializers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

async function bootstrapServer() {
    try {
        let animalController = new AnimalController();
        await app.register(animalControllerPlugin, {
            animalController: animalController,
        });
        await app.register(animalRoutes);

        let dbCfg = await getConfig();
        app.log.info(dbCfg);
        await connectDb(dbCfg);

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
