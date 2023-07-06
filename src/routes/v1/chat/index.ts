import {FlowEngine} from "../../../engine/engine";
import logger from "../../../logging";
import {IncomingMessageSchema, MessageType, OutGoingMessage} from "../../../schemas/message";
import {Operation} from "express-openapi";

export const parameters = []
export const POST: Operation = [
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
    operationId: "sendMessage",
    summary: "Send a message to the bot to start or continue a conversation (session)",
    description: "Sends a message to the bot. If the sending number has an active session, the message will continue the conversation. If not, the message will trigger a new flow if the message matches any of the keywords",
    tags: [
        "chat"
    ],
    requestBody: {
        description: "The message to send to the bot",
        required: true,
        content: {
            ["application/json"]: {
                schema: {
                    $ref: "#/components/schemas/incomingMessage"
                }
            }
        }
    },
    responses: {
        '200': {
            description: "A reply to the sent message. It can be a menu, an error, or a final message to the user",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/outgoingMessage"
                    }
                }
            }
        },
        '400': {
            description: "An object showing the errors in the sent payload",
            content: {
                ["application/json"]: {
                    schema: {
                        $ref: "#/components/schemas/zodError"
                    }
                }
            }
        }
    }
}
