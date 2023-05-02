import z from "zod";
import {Message} from "./message";


export enum ActionType {
    ROUTER = "ROUTER",
    FUNCTION = "FUNCTION",
    WEBHOOK = "WEBHOOK",
    MENU = "MENU",
    INPUT = "INPUT",
    QUIT = "QUIT"
}

export const genericActionSchema = {
    type: z.nativeEnum(ActionType, {description: "Action type"}),
    nextState: z.string()
}

export const inputActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.INPUT),
    text: z.string({description: "Text to request the input"}),
    dataKey: z.string({description: "Data key to save the answer to "})
})
export const quitActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.QUIT),
    text: z.string({description: "Text to display when quitting the flow"}),
    nextState: z.undefined(),
    messageFormat: Message.optional()
})

export const routerActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.ROUTER),
    routes: z.array(z.object({
        expression: z.string({description: "Expression to match the message. You can use session data variables using the syntax {variableName}"}),
        nextState: z.string({description: "The state to go to when the expression returns true"})
    })),
})


export const menuOptionSchema = z.object({
    id: z.string({description: "Option id"}),
    text: z.string({description: "Text to display"}),
})
export const menuActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.MENU),
    text: z.string({description: "Text to explain the menu"}),
    options: z.array(menuOptionSchema).optional().or(z.object({
        dataKey: z.string({description: "A data key from which options can be obtained. The corresponding data must be an array of object"}),
        idKey: z.string({description: "A key to access the id of the option"}),
        textKey: z.string({description: "A key to access the text of the option"})
    })),
    dataKey: z.string({description: "Data key to save the answer to "})
})
export const webhookActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.WEBHOOK),
    url: z.string({description: "Webhook url"}),
    method: z.enum(["GET", "POST"], {description: "Webhook method"}),
    params: z.string().optional(),
    headers: z.object({}).optional(),
    body: z.object({}).optional(),
    dataKey: z.string({description: "Data key to save the answer to "}),
    responseDataPath: z.string({description: 'Data accessor for the response of the api call'}).optional(),
    responseType: z.enum(['json', 'arraybuffer']).optional()

})
export const functionActionSchema = z.object({
    ...genericActionSchema,
    type: z.literal(ActionType.FUNCTION),
    functionName: z.string({description: "Function name"}),
    params: z.object({}, {description: "Extra param object to pass down the function. It will be passed as a second argument to the function"}).optional(),
    dataKey: z.string({description: "Data key to save the answer to "})

})
export const actionSchema = z.discriminatedUnion("type", [
    menuActionSchema,
    routerActionSchema,
    inputActionSchema,
    webhookActionSchema,
    functionActionSchema,
    quitActionSchema
])
export const flowStateSchema = z.object({
    id: z.string({description: "State id"}),
    action: actionSchema,
})

export const flowSchema = z.object({
    id: z.string({description: "Flow id"}),
    trigger: z.string({description: "Trigger keyword/message for the flow. This is used to match the flow to the sender message"}),
    initialState: z.string({description: "Initial state id"}),
    states: z.array(flowStateSchema),
})

export type MenuOption = z.infer<typeof menuOptionSchema>
export type FlowData = z.infer<typeof flowSchema>
export type ActionData = z.infer<typeof actionSchema>
export type FlowStateData = z.infer<typeof flowStateSchema>
