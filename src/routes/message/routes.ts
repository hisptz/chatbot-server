import {Router} from "express";
import {MessageSchema} from "../../interfaces/message";

const router = Router();

router.post('', async (req, res) => {
    const data = req.body;

    const parsedData = MessageSchema.safeParse(data);

    if (!parsedData.success) {
        res.status(400).send({
            message: 'Invalid message data',
            errors: parsedData.error.errors
        });
    } else {
        try {
            res.json({})
        } catch (e) {
            res.json(e)
        }
    }

})


export default router;
