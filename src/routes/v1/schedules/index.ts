import {createSchedule, getAllSchedules} from "../../../services/v1/schedules";
import {ScheduleSchema} from "../../../schemas/schedule";
import {Operation} from "express-openapi";

export const GET: Operation = [
    async (req, res) => {
        const schedules = await getAllSchedules();
        res.json(schedules);
    }
]

GET.apiDoc = {
    summary: "Get all schedules",
    tags: ["schedules"],
    operationId: "getSchedules",
    responses: {
        "200": {
            description: "Returns all schedules",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/schedules"
                    }
                }
            }
        }
    }
}
export const POST: Operation = [
    async (req, res) => {
        const data = req.body;
        const parsedData = ScheduleSchema.safeParse(data);

        if (!parsedData.success) {
            return res.status(400).json(parsedData.error);
        }

        try {
            const createdSchedule = await createSchedule(parsedData.data);
            res.status(201).json(createdSchedule);
        } catch (e) {
            res.status(500).send(e);
        }

    }
]

POST.apiDoc = {
    summary: "Create a new schedule",
    tags: ["schedules"],
    operationId: "createSchedule",
    requestBody: {
        content: {
            ["application/json"]: {
                schema: {
                    $ref: "#/components/schemas/schedule"
                }
            }
        }
    },
    responses: {
        "201": {
            description: "Returns the created schedule",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/schedule"
                    }
                }
            }
        }
    }
}
