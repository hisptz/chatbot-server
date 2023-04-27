import {Router} from "express";
import {createTree, getTree, getTrees} from "./utils";
import {treeSchema} from "../../interfaces/tree";

const router = Router();

router.get("/", async (req, res) => {
    const trees = await getTrees();
    res.json(trees);
})


router.get("/:id", async (req, res) => {
    const {id} = req.params;
    if (!id) return res.status(400).json({message: "Invalid id"});

    const tree = await getTree(id);
    if (!tree) return res.status(404).json({message: "Tree not found"});
    res.json(tree);
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
