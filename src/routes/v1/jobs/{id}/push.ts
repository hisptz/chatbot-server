import {Operation} from "express-openapi";
import {getJobById} from "../../../../services/v1/jobs";
import {pushJob} from "../../../../engine/scheduling";

export const parameters = [{
    in: "path",
    name: "id",
    required: true,
    description: "Job id"

}]

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
    description: "Manually run a job",
    summary: "Manually run a job",
    operationId: "pushJob",
    tags: ["jobs"],
    parameters,
    responses: {
        "200": {
            description: "Job run successfully",
            content: {
                ["application/json"]: {
                    schema: {$ref: "#/components/schemas/jobStatus"}
                }
            }
        }
    }
}
