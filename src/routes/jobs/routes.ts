import {Router} from "express";
import {config} from "dotenv";
import {getJobById, getJobs} from "../../modules/jobs/utils";
import {pushJob} from "../../engine/scheduling";

config();

const router = Router();


router.get('', async (req, res) => {
    const jobs = await getJobs();
    res.json(jobs);
})

router.get(":id", async (req, res) => {
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
router.get(":id/push", async (req, res) => {
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
})
export default router;
