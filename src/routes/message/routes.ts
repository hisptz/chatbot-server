import {Router} from "express";
import {IncomingMessageSchema, MessageType, OutGoingMessage} from "../../interfaces/message";
import {FlowEngine} from "../../engine/engine";
import logger from "../../logging";

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
            res.json(message ?? {
                to: [{
                    number: parsedData.data.from.number,
                    type: parsedData.data.from.type
                }],
                message: {type: MessageType.CHAT, text: "Thank you for using our service!"}
            } as OutGoingMessage)
        } catch (e: any) {
            logger.error(e)
            res.json({
                to: [{
                    number: parsedData.data.from.number,
                    type: parsedData.data.from.type
                }],
                message: {
                    type: MessageType.CHAT,
                    text: e.message ?? "Something went wrong. Please try again"
                }
            } as OutGoingMessage)
        }
    }

})


export default router;
