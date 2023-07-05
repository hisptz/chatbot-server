import axios from "axios";
import {OutGoingMessage, ToContact} from "../interfaces/message";
import logger from "../logging";

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
