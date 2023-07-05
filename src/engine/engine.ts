import {Action, Connection, Flow, FlowState, Route, Session} from "@prisma/client";
import {ContactType, IncomingMessage, MessageConfig, MessageType, OutGoingMessage} from "../schemas/message";
import client from "../client";
import {DateTime} from "luxon";
import {cloneDeep, get, head, isEmpty, last, reduce, set} from "lodash";
import axios, {ResponseType} from "axios";
import {MenuOption} from "../schemas/flow";


type SessionWithIncludes = Session & {
    connection: Connection,
    state: FlowState & { action: Action }
}
const sessionIncludes = {
    connection: true,
    state: {
        include: {
            action: {
                include: {
                    routes: true,
                }
            }
        }
    }
}

export class FlowEngine {
    protected session?: SessionWithIncludes;
    protected message?: IncomingMessage;

    get currentState(): FlowState & { action: Action & { routes: Route[] } } {
        return this.session?.state as FlowState & { action: Action & { routes: Route[] } };
    }

    get connection(): Connection {
        return this.session?.connection as Connection;
    }

    get sessionData(): Record<string, any> {
        return JSON.parse(<string>this.session?.data)
    }

    get sessionStep() {
        return this.session?.step as string
    }

    static async createConnection(identifier: string) {
        return client.connection.create({
            data: {
                identifier
            }
        })
    }

    static async getOrInitConnection(identifier: string) {
        const connection = await client.connection.findUnique({
            where: {
                identifier
            }
        });
        if (!connection) {
            return this.createConnection(identifier);
        }
        return connection;
    }

    static async getOrInitSession(connection: Connection, message: IncomingMessage): Promise<SessionWithIncludes> {
        const activeSession = await client.session.findFirst({
            where: {
                AND: {
                    connection: {
                        is: connection
                    },
                    startTime: {
                        lte: DateTime.now().toJSDate(),
                        gte: DateTime.now().minus({hour: 1}).toJSDate()
                    },
                    cancelled: {
                        not: true,
                    }
                }
            },
            include: sessionIncludes
        });
        if (!activeSession) {
            const flows = await client.flow.findMany({
                where: {
                    trigger: {
                        contains: message?.message?.text?.toLowerCase(),
                        mode: 'insensitive'
                    }
                },

            })

            if (isEmpty(flows)) {
                const flows = await client.flow.findMany();
                const flowTriggers = flows.map(flow => flow.trigger);
                throw Error(`Sorry, I could not understand the keyword ${message.message.text}. To start an available service, use any of the following keywords: \n${flowTriggers.map(trigger => `- ${trigger}\n`)}`)
            }

            if (flows.length > 1) {
                const flowTriggers = flows.map(flow => flow.trigger);
                throw Error(`More than one service matches the given phrase ${message.message.text}. To start an available service, use any of the following phrases: \n${flowTriggers.map(trigger => `- ${trigger}\n`)}`)
            }

            const flow = head(flows) as Flow;

            const rootState = await client.flowState.findUnique({
                where: {
                    id: flow.rootState
                }
            })

            if (!rootState) {
                throw Error(`Could not determine starting tree state for tree ${flow.id}`)
            }

            return client.session.create({
                data: {
                    tries: 1,
                    data: JSON.stringify({}),
                    connection: {
                        connect: {
                            id: connection.id
                        }
                    },
                    startTime: DateTime.now().toJSDate(),
                    state: {
                        connect: {
                            id: rootState.id
                        }
                    },
                    cancelled: false,
                    Flow: {
                        connect: {
                            id: flow.id
                        }
                    }

                },
                include: sessionIncludes
            })
        }
        return activeSession;
    }

    static async init(message: IncomingMessage): Promise<FlowEngine> {
        const {from} = message;
        const engine = new FlowEngine();
        const connection = await FlowEngine.getOrInitConnection(from.number);
        engine.setSession(await FlowEngine.getOrInitSession(connection, message));
        engine.setMessage(message);
        return engine;
    }

    setSession(session: SessionWithIncludes) {
        this.session = session;
        return this;
    }


    async closeSession() {
        await this.updateSession("step", "COMPLETED");
        await this.updateSession("cancelled", true);
    }

    setMessage(message: IncomingMessage) {
        this.message = message;
        return this;
    }

    async cancelSession() {
        await this.updateSession("cancelled", true);
    }


    async runAction(): Promise<OutGoingMessage | null> {
        const currentState = cloneDeep(this.currentState);
        const action = currentState.action;
        if (this.message?.message.text?.toLowerCase().match('cancel')) {
            await this.cancelSession();
            return this.getReplyMessage({
                type: MessageType.CHAT,
                text: 'Session cancelled.'
            })
        }
        let message = null;
        try {
            switch (action.type) {
                case "MENU":
                    message = await this.runMenuAction(action);
                    break;
                case "INPUT":
                    message = await this.runInputAction(action);
                    break;
                case "ROUTER":
                    await this.runRouteAction(action);
                    break;
                case "WEBHOOK":
                    await this.runWebhookAction(action);
                    break;
                case "QUIT":
                    message = await this.runQuitAction(action);
                    break;
            }
        } catch (e: any) {
            // A passable error,
            // await this.closeSession(); //May need further discussions
            return this.getReplyMessage({
                type: MessageType.CHAT,
                text: e.message ?? 'Something went wrong.'
            })
        }
        if (currentState.id !== this.currentState?.id) {
            //State has changed, run the action again
            return await this.runAction();
        }
        if (message) {
            return message;
        }
        return null;
    }

    async updateSession(key: string, value: any) {
        this.session = await client.session.update({
            data: {
                [key]: value
            },
            where: {
                id: this.session?.id
            },
            include: sessionIncludes
        })
    }

    async updateSessionData(key: string, value: any) {
        const sessionData = this.sessionData;
        set(sessionData, key, value);
        await this.updateSession("data", JSON.stringify(sessionData));
    }


    async updateSessionState(stateId: string) {
        await this.updateSession("state", {
            connect: {
                id: stateId
            }
        })
    }


    sanitizeText(text: string): string {
        const sessionData = this.sessionData;
        return this.replaceStringValues(sessionData, text);
    }

    replaceStringValues(data: Record<string, any>, text: string): string {
        return reduce(Object.keys(data), (acc, curr) => acc.replaceAll(new RegExp(`{${curr}}`, "g"), `${get(data, curr)}`), text)
    }


    getSelectedMenuOption(options: MenuOption[]): string {
        const index = Number(this.message?.message?.text);
        let option = null;
        if (isNaN(index)) {
            //Try matching using string
            option = options.find(option => this.message?.message?.text?.match(option.text));
        } else {
            //Yeey, we got a number
            option = options[index - 1];
        }
        if (!option) {
            throw Error("Invalid option");
        }
        return option.id
    }

    async runRouteAction(action: Action & { routes: Route[] }) {
        const sessionData = this.sessionData;
        const {routes} = action;
        const route = routes.find(route => {
            const sanitizedExpression = this.replaceStringValues(sessionData, route.expression as string)
            return eval(sanitizedExpression);
        });
        if (!route) {
            await this.updateSessionState(action.nextState as string);
        } else {
            await this.updateSessionState(route.nextStateId as string);
            await this.updateSession("step", "COMPLETED");
        }

    }

    async runAssignAction(action: Action) {
        const {options, text, dataKey, type} = action;
        const sanitizedOptions: MenuOption[] = Array.isArray(JSON.parse(options as string)) ? JSON.parse(options as string) : this.mapOptions(JSON.parse(options as string))
        const value = type === "MENU" ? this.getSelectedMenuOption(sanitizedOptions) : this.message?.message.text;
        await this.updateSessionData(dataKey as string, value);
        await this.updateSession("step", "COMPLETED");
        await this.updateSessionState(action.nextState as string);
    }


    getReplyMessage(message: MessageConfig): OutGoingMessage {
        return {
            to: [
                {
                    number: this.connection.identifier,
                    type: this.message?.from?.type as ContactType
                }
            ],
            message
        }
    }


    mapOptions({dataKey, textKey, idKey}: { dataKey: string, idKey: string; textKey: string }): MenuOption[] {
        const data = this.sessionData;
        const rawOptions = get(data, [dataKey]) ?? [];
        return rawOptions.map((rawOption: Record<string, any>) => ({
            text: get(rawOption, [textKey]),
            id: get(rawOption, [idKey])
        }))
    }

    async runMenuAction(action: Action): Promise<OutGoingMessage | null> {
        const {options, text} = action;
        const sanitizedOptions: MenuOption[] = Array.isArray(JSON.parse(options as string)) ? JSON.parse(options as string) : this.mapOptions(JSON.parse(options as string))
        if (this.sessionStep === "WAITING") {
            try {
                await this.runAssignAction(action);
            } catch (e: any) {
                if (e.message === "Invalid option") {
                    throw Error(`Invalid option. Please select from the following options:\n \n ${sanitizedOptions.map((option, index) => `${index + 1}. ${option.text}`).join("\n")}`)
                }
                throw e;
            }
            return null;
        }
        //Format the message using the options

        const formattedMessage = `${text} \n\n ${sanitizedOptions.map((option, index) => `${index + 1}. ${option.text}`).join("\n")}`;
        //Set session step as waiting
        await this.updateSession("step", "WAITING");
        return this.getReplyMessage({
            type: MessageType.CHAT,
            text: formattedMessage
        })
    }

    async runWebhookAction(action: Action) {
        const sessionData = this.sessionData;
        const {webhookURL, responseType, params, body, responseDataPath, method, dataKey, headers, nextState,} = action;
        if (!webhookURL) {
            throw Error("Invalid webhook action. Missing url")
        }
        const sanitizedWebhookURL = this.replaceStringValues(sessionData, webhookURL);
        const paramsObject = params ? JSON.parse(params ?? '') : undefined;
        const headerObject = headers ? JSON.parse(headers ?? '') : undefined;
        const bodyObject = body ? JSON.parse(body ?? '') : undefined;

        const axiosInstance = axios.create({
            data: bodyObject,
            responseType: responseType as ResponseType ?? 'json',
            headers: {
                "Content-Type": 'application/json',
                ...(headerObject ?? {}),
            },
            method: method ?? 'GET',
            params: paramsObject,
        });
        try {
            const response = method === "POST" ? await axiosInstance.post(sanitizedWebhookURL) : await axiosInstance.get(sanitizedWebhookURL)
            if ([200, 304].includes(response.status)) {
                //set data to data key
                if (dataKey) {
                    const dataValue = responseDataPath ? get(response.data, responseDataPath) : response.data;
                    if (responseType === "arraybuffer") {
                        //A file, change it to base64 string so that it plays nice

                        //assuming the end of url signifies the image extension;
                        const extension = last(sanitizedWebhookURL.split('.')) as string;
                        const validExtension = ['png', 'jpg', 'pdf'].includes(extension) ? extension : 'jpg'
                        const image = `data:image/${validExtension};base64,${Buffer.from(dataValue, 'binary').toString('base64')}`;
                        await this.updateSessionData(dataKey, image)
                    } else {
                        await this.updateSessionData(dataKey, dataValue);

                    }
                    if (nextState) {
                        await this.updateSessionState(nextState);
                    } else {
                        throw Error("Missing next step to move to")
                    }
                } else {
                    throw Error("Missing data key to assign value to.")
                }

            }
        } catch (e: any) {
            await this.closeSession();
            throw Error("Error calling webhook. " + e.message)
        }
    }


    sanitizeMessageFormat(messageFormat: string, text: string): string {
        const data = {
            text,
            ...(this.sessionData ?? {})
        }
        return this.replaceStringValues(data, messageFormat);
    }

    async runQuitAction(action: Action): Promise<OutGoingMessage> {
        const {text, messageFormat} = action;
        await this.closeSession();
        const sanitizedText = this.sanitizeText(text as string);
        const sanitizedFormatString = messageFormat ? this.sanitizeMessageFormat(messageFormat, sanitizedText) : undefined
        const format = sanitizedFormatString ? JSON.parse(sanitizedFormatString) : undefined

        return this.getReplyMessage({
            type: format?.type ?? MessageType.CHAT,
            text: format?.text ?? sanitizedText,
            image: format?.image,
            file: format?.file
        })
    }


    async runInputAction(action: Action): Promise<OutGoingMessage> {
        if (this.sessionStep === "WAITING") {
            await this.runAssignAction(action);
        }
        await this.updateSession("step", "WAITING");

        const sanitizedText = this.sanitizeText(action.text as string);

        return {
            to: [
                {
                    number: this.connection.identifier,
                    type: this.message?.from?.type as ContactType
                },
            ],
            message: {
                type: MessageType.CHAT,
                text: sanitizedText
            }
        }
    }
}
