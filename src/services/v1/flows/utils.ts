import {FlowData, FlowStateData} from "../../../schemas/flow";
import {Action, Flow, FlowState} from "@prisma/client"
import {asyncify, forEachSeries, mapSeries} from "async";
import {isEmpty} from "lodash";
import client from "../../../client";

const flowIncludes = {
    states: {
        include: {
            action: {
                include: {
                    routes: true,
                }
            }
        }
    }
}
export async function convertFlowStateToFlowStateData(flowState: FlowState & {
    action: Action
}): Promise<FlowStateData> {
    const action: any = flowState.action;
    return {
        id: flowState.id,
        action: {
            id: action.id,
            type: action.type,
            dataKey: action.dataKey,
            functionName: action.functionName,
            nextState: action.nextState,
            text: action.text,
            params: action.params,
            url: action.webhookURL,
            routes: action.routes,
            options: action.options,
            headers: action.headers,
            body: action.body,
            method: action.method,
            responseDataPath: action.responseDataPath
        },

    } as FlowStateData
}
export async function convertFlowToFlowData(flow: Flow & { states: FlowState[] }): Promise<FlowData> {
    const states = await mapSeries(flow.states, asyncify(convertFlowStateToFlowStateData)) as FlowStateData[];
    return {
        initialState: flow.rootState,
        ...flow,
        states
    }

}
export async function getFlows(): Promise<FlowData[]> {
    const flows = await client.flow.findMany({
        include: flowIncludes
    });
    return await mapSeries(flows, asyncify(convertFlowToFlowData)) as FlowData[];
}
export async function getFlow(id: string): Promise<FlowData> {
    const flow = await client.flow.findUnique({
        where: {
            id
        },
        include: flowIncludes
    });
    if (!flow) {
        throw Error(`Flow with id ${id} could not be found`)
    }
    return await convertFlowToFlowData(flow);
}
export async function deleteFlow(id: string): Promise<any> {
    return client.flow.delete({
        where: {
            id
        },
    });
}
export async function createState(stateData: FlowStateData, flowId: string): Promise<FlowState> {
    const {id} = stateData ?? {}
    const actionData: any = stateData.action;
    const action = await client.action.create({
        data: {
            id: actionData.id,
            type: actionData.type,
            dataKey: actionData.dataKey,
            functionName: actionData.functionName,
            nextState: actionData.nextState,
            text: actionData.text,
            params: actionData.params,
            webhookURL: actionData.url,
            body: actionData.body,
            method: actionData.method,
            responseDataPath: actionData.responseDataPath,
            messageFormat: JSON.stringify(actionData.messageFormat),
            responseType: actionData.responseType,
            options: JSON.stringify(actionData.options)
        }
    })

    if (!isEmpty(actionData.routes)) {
        await forEachSeries(actionData.routes, async (route: any) => {
            await client.route.create({
                data: {
                    action: {
                        connect: {
                            id: action.id
                        }
                    },
                    expression: route.expression,
                    nextStateId: route.nextState
                }
            })
        })
    }

    return client.flowState.create({
        data: {
            id: id,
            action: {
                connect: {
                    id: action.id
                }
            },
            owningFlow: {
                connect: {
                    id: flowId
                }
            },
            retries: 5
        }
    })
}
export async function createFlow(flowData: FlowData): Promise<FlowData> {
    const {states: statesData, initialState, trigger, id,} = flowData ?? {}
    await client.flow.create({
        data: {
            id,
            rootState: initialState,
            trigger,
        }
    });
    await mapSeries(statesData, asyncify(async (stateData: FlowStateData) => await createState(stateData, id)));
    const flow = await client.flow.findUnique({
        where: {
            id
        },
        include: flowIncludes
    })
    if (!flow) {
        throw Error("Error saving flow")
    }
    return convertFlowToFlowData(flow);

}

