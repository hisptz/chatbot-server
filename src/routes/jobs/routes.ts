import {Router} from "express";
import {config} from "dotenv";
import {createJob, deleteJob, getJobById, getJobs, getJobStatus, updateJob} from "../../modules/jobs/utils";
import {pushJob} from "../../engine/scheduling";
import {JobSchema} from "../../schemas/job";

config();

const router = Router();

router.get('', async (req, res) => {
    const jobs = await getJobs();
    res.json(jobs);
})

router.get('/:id/statuses', async (req, res) => {
    const {id} = req.params;
    if (!id) {
        res.status(400).send("Missing job id");
        return;
    }
    const jobs = await getJobStatus(id);
    res.json(jobs);
})
router.get("/:id", async (req, res) => {
    const {id} = req.params
    const job = await getJobById(id);
    if (job) {
        res.json(job);
        return;
    } else {
        res.status(404).send("Job not found");
        return;
    }
})
router.get("/:id/push", async (req, res) => {
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
})
router.post('', async (req, res) => {
    const data = req.body;
    const parsedData = JobSchema.safeParse(data);
    if (!parsedData.success) {
        res.status(400).json(parsedData);
        return;
    }
    const job = parsedData.data;

    try {
        const response = await createJob(job);
        res.json(response);
    } catch (e) {
        res.status(500).send(e);
        return;
    }

})
router.put('/:id', async (req, res) => {
    const {id} = req.params;
    if (!id) {
        res.status(400).send("Missing id");
        return;
    }
    const data = req.body;
    const parsedData = JobSchema.safeParse(data);
    if (!parsedData.success) {
        res.status(400).json(parsedData);
        return;
    }
    const job = parsedData.data;
    try {
        const response = await updateJob(id, job);
        res.json(response);
    } catch (e) {
        res.status(500).send(e);
        return;
    }

});
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    if (!id) {
        res.status(400).send("Missing id");
        return;
    }
    try {
        const response = await deleteJob(id);
        res.json(response);
    } catch (e) {
        res.status(500).send(e);
        return;
    }

})
export default router;
