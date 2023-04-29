import {Router} from "express";
import {IncomingMessageSchema} from "../../interfaces/message";
import {FlowEngine} from "../../engine/engine";

const router = Router();

router.post('', async (req, res) => {
    const data = req.body;

    const parsedData = IncomingMessageSchema.safeParse(data);

    if (!parsedData.success) {
        res.status(400).send({
            message: 'Invalid message data',
            errors: parsedData.error.errors
        });
    } else {
        try {
            const engine = await FlowEngine.init(parsedData.data);
            const message = await engine.runAction();
            res.json(message ?? {type: "text", content: `Thank you for using our service!`})
        } catch (e) {
            res.json(e)
        }
    }

})


export default router;
