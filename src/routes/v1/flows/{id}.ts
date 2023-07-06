import {Operation} from "express-openapi";
import logger from "../../../logging";
import {deleteFlow, getFlow} from "../../../services/v1/flows";

export const parameters = [
    {
        in: "path",
        name: "id",
        required: true,
    }
]

export const GET: Operation = [
    async (req, res) => {
        try {
            const {id} = req.params;
            if (!id) return res.status(400).json({message: "Invalid id"});
            const flow = await getFlow(id);
            if (!flow) return res.status(404).json({message: "Flow not found"});
            res.json(flow);
        } catch (e) {
            logger.error(e)
            res.status(500).json(JSON.stringify(e)).status(500)

        }
    }
]

GET.apiDoc = {
    description: 'Get a flow using the ID',
    operationId: 'getFlow',
    tags: ['flow'],
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
export const DELETE: Operation = [
    async (req, res) => {
        try {
            const {id} = req.params;
            if (!id) return res.status(400).json({message: "Invalid id"});
            const flow = await deleteFlow(id);
            if (!flow) return res.status(404).json({message: "Flow not found"});
            res.json(flow);
        } catch (e) {
            logger.error(e)
            res.status(409).json(JSON.stringify(e))

        }
    }
]

DELETE.apiDoc = {
    summary: "Delete a flow",
    operationId: "deleteFlow",
    tags: ["flow"],
    parameters: [],
    responses: {
        default: {
            description: "Success"
        }
    }
}
