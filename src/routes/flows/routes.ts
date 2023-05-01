import {Router} from "express";
import {createFlow, deleteFlow, getFlow, getFlows} from "./utils";
import {flowSchema} from "../../interfaces/flow";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const flows = await getFlows();
        res.json(flows);
    } catch (e) {
        res.json(JSON.stringify(e)).status(500)

    }
});
router.get("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        if (!id) return res.status(400).json({message: "Invalid id"});
        const flow = await getFlow(id);
        if (!flow) return res.status(404).json({message: "Flow not found"});
        res.json(flow);
    } catch (e) {
        res.json(JSON.stringify(e)).status(500)

    }
})

router.delete("/:id", async (req, res) => {
    try {
        const {id} = req.params;
        if (!id) return res.status(400).json({message: "Invalid id"});
        const flow = await deleteFlow(id);
        if (!flow) return res.status(404).json({message: "Flow not found"});
        res.json(flow);
    } catch (e) {
        res.json(JSON.stringify(e)).status(500)

    }
})
router.post("/", async (req, res) => {
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
        res.json(JSON.stringify(e)).status(500)
    }
})
export default router;
