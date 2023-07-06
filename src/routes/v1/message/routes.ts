import {FlowEngine} from "../../../engine/engine";
import logger from "../../../logging";
import {IncomingMessageSchema, MessageType, OutGoingMessage} from "../../../schemas/message";
import {Operation} from "express-openapi";


const POST: Operation = [
    async (req, res) => {
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

    }
]


POST.apiDoc = {
    summary: "Send a message to the bot to start or continue a conversation (session)",
    description: "Sends a message to the bot. If the sending number has an active session, the message will continue the conversation. If not, the message will trigger a new flow if the message matches any of the keywords",
    tags: [
        "messages",
        "flow",
        "bot"
    ],
    requestBody: {
        summary: "Message to send",
        description: "Message to send",
        content: {},
        required: true,
        $ref: "#/definitions/Message"
    },
    responses: {
        default: {
            $ref: "#/definitions/Message"
        }
    }
}
