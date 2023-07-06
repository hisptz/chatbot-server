import {Operation} from "express-openapi";
import {deleteJob, getJobById, updateJob} from "../../../services/v1/jobs";
import {JobSchema} from "../../../schemas/job";


export const parameters = {
    in: "path",
    name: "id",
    required: true,
    type: "string"
}

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
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
export const PUT: Operation = [
    async (req, res) => {
        const {id} = req.params;
        if (!id) {
            res.status(400).send("Missing id");
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
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
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
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
