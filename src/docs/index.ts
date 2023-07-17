import {config} from "dotenv";
import {OpenAPIObject} from "openapi3-ts/oas31";
import {generateSchema} from "@anatine/zod-openapi";
import {IncomingMessageSchema, OutGoingMessageSchema} from "../schemas/message";
import {flowSchema, flowStateSchema} from "../schemas/flow";
import {JobSchema, JobStatusSchema} from "../schemas/job";
import {ScheduleSchema} from "../schemas/schedule";
import {version} from "../../package.json";
import {z} from "zod"
import {sanitizeEnv} from "../utils/env";

config();
sanitizeEnv();


const apiMountPoint = process.env.API_MOUNT_POINT || "/api";
const baseURL = process.env.BASE_URL || "http://localhost:3000";

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
            flows: generateSchema(z.array(flowSchema)),
            flowState: generateSchema(flowStateSchema),
            flowStates: generateSchema(z.array(flowStateSchema)),
            job: generateSchema(JobSchema),
            jobs: generateSchema(z.array(JobSchema)),
            jobStatus: generateSchema(JobStatusSchema),
            jobStatuses: generateSchema(z.array(JobStatusSchema)),
            schedule: generateSchema(ScheduleSchema),
            schedules: generateSchema(z.array(ScheduleSchema)),
            zodError: generateSchema(z.array(z.object({
                code: z.string(),
                message: z.string(),
                received: z.string(),
                path: z.array(z.string())
            }))),
            error: generateSchema(z.object({
                message: z.string()
            }))
        }
    },
    servers: [
        {
            url: `${baseURL}${apiMountPoint}`
        }
    ],
    paths: {}
}

export default apiDoc as any;
