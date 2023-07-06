import {Operation} from "express-openapi";
import {getJobStatus} from "../../../../services/v1/jobs";

export const parameters = {
    in: "path",
    name: "id",
    required: true,
    type: "string"
}

export const GET: Operation = [
    async (req, res) => {
        const {id} = req.params;
        if (!id) {
            res.status(400).send("Missing job id");
            return;
        }
        const jobs = await getJobStatus(id);
        res.json(jobs);
    }
]


GET.apiDoc = {
    description: "Get job status",
    operationId: "getJobStatus",
    tags: ["jobs"],
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
