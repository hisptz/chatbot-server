import {config} from "dotenv";
import {OpenAPIObject} from "openapi3-ts/oas31";
import {generateSchema} from "@anatine/zod-openapi";
import {IncomingMessageSchema, OutGoingMessageSchema} from "../schemas/message";
import {flowSchema, flowStateSchema} from "../schemas/flow";
import {JobSchema} from "../schemas/job";
import {ScheduleSchema} from "../schemas/schedule";
import {version} from "../../package.json";


config()

const apiMountPoint = process.env.API_MOUNT_POINT || "/api";

const apiDoc: OpenAPIObject = {
    openapi: "3.1.0",
    info: {
        title: "Chat-bot Service API",
        version,
        description: "An API service that provides chat-bot functionality as well as other useful services that power the DHIS2 Analytics messenger"
    },
    components: {
        schemas: {
            incomingMessage: generateSchema(IncomingMessageSchema),
            outgoingMessage: generateSchema(OutGoingMessageSchema),
            flow: generateSchema(flowSchema),
            flowState: generateSchema(flowStateSchema),
            job: generateSchema(JobSchema),
            schedule: generateSchema(ScheduleSchema)
        }
    },
    servers: [
        {
            url: `${apiMountPoint}`
        }
    ],
    paths: {}
}

export default apiDoc as any;
