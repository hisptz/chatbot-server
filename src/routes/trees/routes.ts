import {Router} from "express";
import {createTree, getTrees} from "./utils";
import {z} from "zod";
import {treeSchema} from "../../interfaces/tree";

const router = Router();

router.get("/", async (req, res) => {
    const trees = await getTrees();
    res.json(trees);
})
router.post("", async (req, res) => {
    const data = req.body;
    const parsedData = treeSchema.safeParse(data);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid data",
            errors: parsedData.error.errors
        })
    } else {
        const response = await createTree(parsedData.data);
        res.json(response).status(201);
    }
})
export default router;
