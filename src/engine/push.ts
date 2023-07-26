import {AxiosInstance} from "axios";
import {OutGoingMessage, ToContact} from "../schemas/message";
import logger from "../logging";
import {uniqBy} from "lodash";

async function getImage(visualizationId: string, client: AxiosInstance) {
    try {
        const endpoint = `generate/${visualizationId}`
        const response = await client.get(endpoint)
        if (response.status === 200) {
            return response.data?.image;
        }
    } catch (e: any) {
        logger.error(e);
        logger.error(JSON.stringify(e.data));
    }
}

export async function sendMessage(message: OutGoingMessage, client: AxiosInstance) {

    try {
        const endpoint = `send`
        const response = await client.post(endpoint, message)
        if (response.status === 200) {
            return response.data;
        }
    } catch (e: any) {
        logger.error(e);
        logger.error(JSON.stringify(e.data));
        throw Error(`Could not send message: ${e.message}`)
    }
}

export async function getMessage(vis: { id: string; name: string }, {recipients, description, visualizerClient}: {
    description?: string;
    recipients: ToContact[],
    visualizerClient: AxiosInstance;
}): Promise<OutGoingMessage | undefined> {
    const visualization = await getImage(vis.id, visualizerClient);
    if (visualization) {
        return {
            to: uniqBy(recipients, 'number'),
            message: {
                type: "image",
                image: visualization,
                text: description ?? "Push analytics from your DHIS2"
            }
        } as OutGoingMessage
    }
}

