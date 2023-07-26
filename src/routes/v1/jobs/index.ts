import {Operation} from "express-openapi";
import {createJob, getJobs} from "../../../services/v1/jobs";
import {JobSchema} from "../../../schemas/job";

export const parameters = []
export const GET: Operation = [
    async (req, res) => {
        const jobs = await getJobs();
        res.json(jobs);
    }
]

GET.apiDoc = {
    summary: "Get all jobs",
    description: "Returns all jobs",
    operationId: "getJobs",
    tags: ["jobs"],
    responses: {
        "200": {
            description: "List of jobs",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/jobs"
                    }
                }
            }
        }
    }
}

export const POST: Operation = [
    async (req, res) => {
        const data = req.body;
        const parsedData = JobSchema.safeParse(data);
        if (!parsedData.success) {
            res.status(400).json(parsedData);
            return;
        }
        const job = parsedData.data;
        try {
            const response = await createJob(job);
            res.status(201).json(response);
        } catch (e) {
            res.status(500).send(e);
            return;
        }

    }
]

POST.apiDoc = {
    summary: "Create a new job",
    description: "Creates a new job",
    operationId: "createJob",
    tags: ["jobs"],
    responses: {
        "201": {
            description: "The created job",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/job"
                    }
                }
            }
        },

    }
}
