// import {config} from "dotenv";
// import {Router} from "express";
// import {
//     createSchedule,
//     deleteSchedule,
//     getAllSchedules,
//     getSchedule,
//     updateSchedule
// } from "../../../services/v1/schedules";
// import {ScheduleSchema} from "../../../schemas/schedule";
//
// config();
//
// const router = Router();
// router.get("", async (req, res) => {
//     const schedules = await getAllSchedules();
//     res.json(schedules);
// });
// router.get("/:id", async (req, res) => {
//     const schedule = await getSchedule(req.params.id);
//     res.json(schedule);
// });
// router.post("", async (req, res) => {
//     const data = req.body;
//     const parsedData = ScheduleSchema.safeParse(data);
//
//     if (!parsedData.success) {
//         return res.status(400).json(parsedData.error);
//     }
//
//     try {
//         const createdSchedule = await createSchedule(parsedData.data);
//         res.json(createdSchedule);
//     } catch (e) {
//         res.status(500).send(e);
//     }
//
// })
// router.put("/:id", async (req, res) => {
//     const {id} = req.params;
//     const data = req.body;
//     const parsedData = ScheduleSchema.safeParse(data);
//
//     if (!parsedData.success) {
//         return res.status(400).json(parsedData.error);
//     }
//     try {
//         const createdSchedule = await updateSchedule(id, parsedData.data);
//         res.status(202).json(createdSchedule);
//     } catch (e) {
//         res.status(500).send(e);
//     }
//
// })
// router.delete("/:id", async (req, res) => {
//     const {id} = req.params;
//     if (!id) {
//         return res.status(400).send("id is required");
//     }
//     try {
//         const response = await deleteSchedule(id);
//         res.status(201).json(response);
//     } catch (e: any) {
//         res.status(500).send(e.message);
//     }
// });
//
// export default router;
// export default function (){
//     const parameters = []
// }
