import {Operation} from "express-openapi";
import {deleteJob, getJobById, updateJob} from "../../../services/v1/jobs";
import {JobSchema} from "../../../schemas/job";


export const parameters = [{
    in: "path",
    name: "id",
    required: true,
    description: "Job id"
}]
export const GET: Operation = [
    async (req, res) => {
        const {id} = req.params
        const job = await getJobById(id);
        if (job) {
            res.json(job);
            return;
        } else {
            res.status(404).send("Job not found");
            return;
        }
    }
]

GET.apiDoc = {
    summary: "Get a job",
    tags: ["jobs"],
    parameters,
    responses: {
        "200": {
            description: "The requested job",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/job"
                    }
                }
            }
        },
        "404": {
            description: "Job not found"
        },
        "400": {
            description: "Missing job id"
        },
    }
}
export const PUT: Operation = [
    async (req, res) => {
        const {id} = req.params;
        if (!id) {
            res.status(400).send("Missing id");
            return;
        }

        const requestedJob = await getJobById(id);
        if (!requestedJob) {
            res.status(404).send("Job not found");
            return;
        }

        const data = req.body;
        const parsedData = JobSchema.safeParse(data);
        if (!parsedData.success) {
            res.status(400).json(parsedData);
            return;
        }
        const job = parsedData.data;
        try {
            const jobExists = !!(await getJobById(id));
            if (!jobExists) {
                res.status(404).send("Job not found");
                return;
            }
            const response = await updateJob(id, job);
            res.json(response);
        } catch (e) {
            res.status(500).send(e);
            return;
        }

    }
]

PUT.apiDoc = {
    summary: "Update a job",
    tags: ["jobs"],
    parameters,
    responses: {
        "202": {
            description: "The updated job",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/job"
                    }
                }
            }
        },
        "400": {
            description: "Missing job id"
        },
        "404": {
            description: "Job not found"
        },
    }
}

export const DELETE: Operation = [
    async (req, res) => {
        const {id} = req.params;
        if (!id) {
            res.status(400).send("Missing id");
            return;
        }
        try {
            const jobExists = !!(await getJobById(id));
            if (!jobExists) {
                res.status(404).send("Job not found");
                return;
            }
            const response = await deleteJob(id);
            res.json(response);
        } catch (e) {
            res.status(500).send(e);
            return;
        }

    }
]

DELETE.apiDoc = {
    summary: "Delete a job",
    tags: ["jobs"],
    parameters,
    responses: {
        "200": {
            description: "The deleted job",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/job"
                    }
                }
            }
        },
        "404": {
            description: "Job not found"
        },
        "400": {
            description: "Missing job id"
        },
    }
}
