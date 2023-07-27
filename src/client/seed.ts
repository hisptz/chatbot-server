import prisma from "./index";
import {createFlow} from "../services/v1/flows";
import logger from "../logging";

const defaultFlow = {
    "id": "dd4d9a61",
    "trigger": "Hello DHIS2",
    "initialState": "b12ffbf3",
    "states": [
        {
            "id": "b12ffbf3",
            "action": {
                "type": "WEBHOOK",
                "url": "http://mediator:4020/api/dataStore/hisptz-analytics-groups?fields=id,name",
                "responseDataPath": "entries",
                "dataKey": "groups",
                "method": "GET",
                "nextState": "dc381521"
            }
        },
        {
            "id": "dc381521",
            "action": {
                "type": "MENU",
                "dataKey": "groupId",
                "text": "Hello, welcome to DHIS2 analytics service. Kindly select the group of visualization you want to view",
                "options": {
                    "dataKey": "groups",
                    "textKey": "name",
                    "idKey": "key"
                },
                "nextState": "7f6902aa"
            }
        },
        {
            "id": "7f6902aa",
            "action": {
                "type": "WEBHOOK",
                "url": "http://mediator:4020/api/dataStore/hisptz-analytics-groups/{groupId}",
                "responseDataPath": "visualizations",
                "dataKey": "visualizations",
                "method": "GET",
                "nextState": "53f023bb"
            }
        },
        {
            "id": "53f023bb",
            "action": {
                "type": "MENU",
                "dataKey": "visualizationId",
                "text": "Select the visualization you would like to see",
                "options": {
                    "dataKey": "visualizations",
                    "textKey": "name",
                    "idKey": "id"
                },
                "nextState": "4788a9d6"
            }
        },
        {
            "id": "4788a9d6",
            "action": {
                "type": "WEBHOOK",
                "url": "http://mediator:4020/api/visualizations/{visualizationId}?fields=id,description",
                "dataKey": "description",
                "responseDataPath": "description",
                "method": "GET",
                "nextState": "d5d5914b"
            }
        },
        {
            "id": "d5d5914b",
            "action": {
                "type": "WEBHOOK",
                "url": "http://visualizer:4030/vis/generate/{visualizationId}",
                "dataKey": "visualizationImage",
                "responseDataPath": "image",
                "method": "GET",
                "nextState": "a2a4b00a"
            }
        },
        {
            "id": "a2a4b00a",
            "action": {
                "type": "QUIT",
                "text": "Here is the visualization requested. Thank you for using DHIS2 Analytics Service!",
                "messageFormat": {
                    "type": "image",
                    "image": "{visualizationImage}"
                }
            }
        }
    ]
}

export async function seedDefaultFlow() {
    try {
        const defaultFlowExists = await prisma.flow.findUnique({
            where: {
                id: defaultFlow.id
            }
        })
        if (defaultFlowExists) {
            logger.info(`Default flow already exists`)
            return;
        }
        logger.info(`Seeding default flow...`)
        const defaultFlowInstance = await createFlow(defaultFlow as any);
        logger.info(`Default flow created with id ${defaultFlowInstance.id}`)
    } catch (e) {
        logger.error(`Error creating default flow`)
        logger.error(e)
    }
}
