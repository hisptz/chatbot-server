import {Operation} from "express-openapi";
import {deleteSchedule, getSchedule, updateSchedule} from "../../../services/v1/schedules";
import {ScheduleSchema} from "../../../schemas/schedule";


export const parameters = [
    {
        in: "path",
        required: true,
        name: "id",
    }
]
export const GET: Operation = [
    async (req, res) => {
        const schedule = await getSchedule(req.params.id);
        if (!schedule) {
            res.status(404).send("Schedule not found");
            return;
        }
        res.json(schedule);
    }
]

GET.apiDoc = {
    summary: "Get schedule by id",
    tags: ["schedules"],
    parameters,
    responses: {
        "200": {
            description: "A schedule",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/schedule"
                    }
                }
            }
        },
        "404": {
            description: "Schedule not found",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/error"
                    }
                }
            }
        }
    }
}
export const PUT: Operation = [
    async (req, res) => {
        const {id} = req.params;
        const data = req.body;
        const parsedData = ScheduleSchema.safeParse(data);

        if (!parsedData.success) {
            return res.status(400).json(parsedData.error);
        }
        try {
            const scheduleExists = !!(await getSchedule(id));
            if (!scheduleExists) {
                res.status(404).send("Schedule not found");
                return;
            }
            const createdSchedule = await updateSchedule(id, parsedData.data);
            res.status(202).json(createdSchedule);
        } catch (e) {
            res.status(500).send(e);
        }

    }
]

PUT.apiDoc = {
    summary: "Update schedule by id",
    tags: ["schedules"],
    parameters,
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
        "200": {
            description: "An updated schedule",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/schedule"
                    }
                }
            }
        },
        "404": {
            description: "Schedule not found",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/error"
                    }
                }
            }
        }
    }
}
export const DELETE: Operation = [
    async (req, res) => {
        const {id} = req.params;
        if (!id) {
            return res.status(400).send("id is required");
        }
        try {
            const scheduleExists = !!(await getSchedule(id));
            if (!scheduleExists) {
                res.status(404).send("Schedule not found");
                return;
            }
            const response = await deleteSchedule(id);
            res.status(200).json(response);
        } catch (e: any) {
            res.status(500).send(e.message);
        }
    }
]

DELETE.apiDoc = {
    summary: "Delete schedule by id",
    tags: ["schedules"],
    parameters,
    responses: {
        "200": {
            description: "A deleted schedule",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/schedule"
                    }
                }
            }
        },
        "404": {
            description: "Schedule not found",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/error"
                    }
                }
            }
        }
    }
}
