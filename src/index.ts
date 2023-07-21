import {config} from "dotenv";
import express from "express";
import helmet from "helmet"
import RateLimit from "express-rate-limit"
import {initPrisma} from "./client";
import logger from "./logging";
import {initializeScheduling} from "./engine/scheduling";
import {initialize} from "express-openapi";
import apiDoc from "./docs";
import * as path from "path";
import swagger from "swagger-ui-express"
import {apiKeyAuth} from "@vpriem/express-api-key-auth";
import {sanitizeEnv} from "./utils/env";
import process from "process";

config()
sanitizeEnv();
const port = process.env.PORT || 3000;
const apiMountPoint = process.env.API_MOUNT_POINT || "/api";
const apiKey = process.env.API_KEY
const baseURL = process.env.BASE_URL || `http://localhost:${port}`

const app = express();

if(apiKey){
    app.use(apiKeyAuth(/^API_KEY_/));
}
app.use(express.json());


app.use(helmet.contentSecurityPolicy({
    useDefaults: true
}))
const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 100
})
app.use(limiter);

app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

initPrisma().then(() => {
    initialize({
        app,
        apiDoc,
        routesGlob: '**/*.{ts,js}',
        paths: path.resolve(__dirname, "routes/v1"),
        routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
        exposeApiDocs: true,
        docsPath: `/openapi`,
    }).then(() => {
        app.get('/', (req, res) => {
            res.send(`Hello, Welcome to the chat-bot server!, Navigate to ${apiMountPoint}/docs to view documentation on usage `);
        })
        app.use(`${apiMountPoint}/docs`, swagger.serve, swagger.setup({}, {
            swaggerOptions: {
                url: `${apiMountPoint}/openapi`
            }
        }))
        initializeScheduling().then(() => {
            app.listen(port, () => {
                logger.info(`Server is running on port ${port}`);
                logger.info(`Service available at ${baseURL}${port}${apiMountPoint}`)

            })
        }).catch((e: any) => {
            logger.error(`Could not initialize scheduling: ${e.message ?? e}`);
            app.listen(port, () => {
                logger.info(`Server is running on port ${port}`);
                logger.info(`Service available at ${baseURL}${port}${apiMountPoint}`)
            })
        })
    }).catch((e: any) => {
        logger.error(`Could not initialize api: ${e.message ?? e}`);
    });
}).catch((e: any) => {
    logger.error(`Could not initialize database: ${e.message ?? e}`)
});



