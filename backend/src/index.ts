import Fasify from "fastify";
import animalControllerPlugin from "./plugins/animalController.plugin";
import animalRoutes from "./plugins/animal.plugin";
import { getConfig } from "./config/configGetter";
import { connectDb } from "./controllers/database";

console.log("hello lox");
const app = Fasify({
    logger: true,
});

async function bootstrapServer() {
    try {
        await app.register(animalControllerPlugin);
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
