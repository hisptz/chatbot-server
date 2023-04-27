import {Router} from "express";
import {createFlow, getFlow, getFlows} from "./utils";
import {flowSchema} from "../../interfaces/flow";

const router = Router();

router.get("/", async (req, res) => {
    const flows = await getFlows();
    res.json(flows);
});
router.get("/:id", async (req, res) => {
    const {id} = req.params;
    if (!id) return res.status(400).json({message: "Invalid id"});

    const flow = await getFlow(id);
    if (!flow) return res.status(404).json({message: "Flow not found"});
    res.json(flow);
})
router.post("/", async (req, res) => {
    const data = req.body;
    const parsedData = flowSchema.safeParse(data);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid data",
            errors: parsedData.error.errors
        })
    } else {
        const response = await createFlow(parsedData.data);
        res.json(response).status(201);
    }
})
export default router;
