import {Operation} from "express-openapi";
import {getJobById} from "../../../../services/v1/jobs";
import {pushJob} from "../../../../engine/scheduling";

export const parameters = [{
    in: "path",
    name: "id",
    required: true,
    description: "Job id"

}]

export const POST: Operation = [
    async (req, res) => {
        try {
            const {id} = req.params;
            const job = await getJobById(id);
            if (!job) {
                res.status(404).send("Job not found");
                return;
            }
            const response = await pushJob(job);
            if (response.status === "FAILED") {
                res.status(500).json(response);
                return;
            }
            res.json(response);
        } catch (e: any) {
            res.status(500).send(e.message);
        }
    }
]
POST.apiDoc = {
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
