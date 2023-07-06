import {flowSchema} from "../../../schemas/flow";
import logger from "../../../logging";
import {Operation} from "express-openapi";
import {createFlow, getFlows} from "../../../services/v1/flows";

export const parameters = []
export const GET: Operation = [
    async (req, res) => {
        try {
            const flows = await getFlows();
            res.json(flows);
        } catch (e) {
            logger.error(e)
            res.status(500).json(JSON.stringify(e))
        }
    }
]

GET.apiDoc = {
    summary: "Get flows",
    description: "Get flows",
    tags: ["flows"],
    responses: {
        "200": {
            description: "Flows",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/flows"
                    }
                }
            }
        }
    }
}
export const POST: Operation = [
    async (req, res) => {
        const data = req.body;
        const parsedData = flowSchema.safeParse(data);
        try {
            if (!parsedData.success) {
                res.status(400).json({
                    message: "Invalid data",
                    errors: parsedData.error.errors
                })
            } else {
                const response = await createFlow(parsedData.data);
                res.json(response).status(201);
            }
        } catch (e) {
            logger.error(e)
            res.status(500).json(JSON.stringify(e));
        }
    }
]

POST.apiDoc = {
    summary: "Create flow",
    description: "Create flow",
    tags: ["flows"],
    responses: {
        "201": {
            description: "The created flow",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/flow"
                    }
                }
            }
        }
    }
}
