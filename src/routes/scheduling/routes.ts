import {config} from "dotenv";
import {Router} from "express";
import {deleteSchedule, getSchedule, getSchedules, saveSchedule} from "./utils";
import {ScheduleSchema} from "../../interfaces/schedule";


config();

const router = Router();

router.post("/", async (req, res) => {
    const data = req.body;
    const parsedData = ScheduleSchema.safeParse(data);

    try {
        if (!parsedData.success) {
            res.status(400).send({
                message: 'Invalid schedule data',
                errors: parsedData.error.errors
            });
            return;
        }
        const payload = parsedData.data;
        const response = await saveSchedule(payload);
        res.json(response).status(201);
    } catch (e) {
        console.error(e)
        res.status(500).json(JSON.stringify(e));
    }
});

router.get("/", async (req, res) => {
    try {
        const schedules = await getSchedules();
        res.json(schedules);
    } catch (e) {
        console.error(e)
        res.status(500).json(JSON.stringify(e));
    }
})
router.get("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const schedules = await getSchedule(id);
        if (!schedules) {
            res.status(404).json({message: 'Schedule not found'});
            return;
        }
        res.json(schedules);
    } catch (e) {
        console.error(e)
        res.status(500).json(JSON.stringify(e));
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const response = await deleteSchedule(id);
        res.json(response);
    } catch (e) {
        console.error(e)
        res.status(500).json(JSON.stringify(e));
    }
})

export default router;
