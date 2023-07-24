import {Operation} from "express-openapi";
import {getJobById, getJobStatus} from "../../../../services/v1/jobs";

export const parameters = [{
    in: "path",
    name: "id",
    required: true,
    description: "Job id"
}]

export const GET: Operation = [
    async (req, res) => {
        try {
            const {id} = req.params;
            if (!id) {
                res.status(400).send("Missing job id");
                return;
            }
            const requestedJob = await getJobById(id);
            if (!requestedJob) {
                res.status(404).send("Job not found");
                return;
            }
            const jobStatuses = await getJobStatus(id);
            res.json(jobStatuses);
        } catch (e: any) {
            res.status(500).send(e.message);

        }
    }
]

GET.apiDoc = {
    description: "Get job status",
    summary: "Get job status",
    operationId: "getJobStatus",
    tags: ["jobs"],
    parameters,
    responses: {
        "200": {
            description: "Job statuses for job with the specified id",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/jobStatuses"
                    }
                }
            }
        },
        "400": {
            description: "Missing job id"
        }
    }
}
