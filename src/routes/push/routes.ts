import {Router} from "express";
import {OutGoingMessage, ToContact} from "../../interfaces/message";
import axios from "axios";
import {PushRequestSchema} from "../../interfaces/push";
import {config} from "dotenv";
import * as process from "process";
import {asyncify, mapSeries} from "async";
import logger from "../../logging";

config();


const visualizerURL = process.env.VISUALIZER_URL ?? '';
const whatsappURL = process.env.WHATSAPP_URL ?? '';

const router = Router();

async function getImage(visualizationId: string, gateway: string) {
    try {
        const response = await axios.get(`${gateway.trim()}/generate/${visualizationId}`)
        if (response.status === 200) {
            return response.data?.image;
        }
    } catch (e) {

    }
}

export async function sendMessage(message: OutGoingMessage, gateway: string) {

    try {
        const response = await axios.post(`${gateway.trim()}/send`, message,)
        if (response.status === 200) {
            return response.data;
        }
    } catch (e: any) {
        logger.error(e)
        throw Error(`Could not send message: ${e.message}`)
    }
}

export async function getMessage(vis: { id: string; name: string }, {recipients, description, gateway}: {
    description?: string;
    recipients: ToContact[],
    gateway: string;
}): Promise<OutGoingMessage | undefined> {
    const visualization = await getImage(vis.id, gateway);
    if (visualization) {
        return {
            to: recipients,
            message: {
                type: "image",
                image: visualization,
                text: description ?? "Push analytics from your DHIS2"
            }
        } as OutGoingMessage
    }
}

router.post('', async (req, res) => {
    const data = req.body;
    const parsedData = PushRequestSchema.safeParse(data);

    if (!parsedData.success) {
        res.status(400).send({
            message: 'Invalid message data',
            errors: parsedData.error.errors
        });
    } else {
        try {
            const {visualizations, description, to} = parsedData.data;

            if (!visualizerURL) {
                res.status(500).json({
                    error: `Visualizer URL not configured`
                });
                return;
            }

            const messages = await mapSeries(visualizations, asyncify(async (visualization: any) => getMessage(visualization, {
                recipients: to,
                description,
                gateway: visualizerURL
            })));
            const messageResponse = await mapSeries(messages, asyncify(async (message: any) => sendMessage(message, whatsappURL)));
            res.json(messageResponse)
        } catch (e: any) {
            res.status(500).json(e)
        }
    }

})
export default router;
