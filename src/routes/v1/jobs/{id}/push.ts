import {Operation} from "express-openapi";
import {getJobById} from "../../../../services/v1/jobs";
import {pushJob} from "../../../../engine/scheduling";

export const parameters = {
    in: "path",
    name: "id",
    required: true,
    type: "string"
}

export const GET: Operation = [
    async (req, res) => {
        const {id} = req.params;
        const job = await getJobById(id);
        if (job) {
            const response = await pushJob(job);
            if (response.status === "FAILED") {
                res.status(500).json(response);
            }
        } else {
            res.status(404).send("Job not found");
        }
    }
]

GET.apiDoc = {
    description: "Push a job to the queue",
    operationId: "pushJob",
    tags: ["jobs"],
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
