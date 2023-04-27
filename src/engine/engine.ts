import {Action, Connection, Entry, FlowState, Option, Route, Session} from "@prisma/client";
import {Message, OutGoingMessage} from "../interfaces/message";
import client from "../client";
import {DateTime} from "luxon";
import {cloneDeep, set} from "lodash";


type SessionWithIncludes = Session & {
    connection: Connection,
    state: FlowState & { action: Action & { options: Option[] } }
}
const sessionIncludes = {
    connection: true,
    state: {
        include: {
            action: {
                include: {
                    routes: true,
                    options: true
                }
            }
        }
    }
}

export class FlowEngine {
    protected session?: SessionWithIncludes;
    protected message?: Message;
    protected entry?: Entry;

    get currentState(): FlowState & { action: Action & { options: Option[], routes: Route[] } } {
        return this.session?.state as FlowState & { action: Action & { options: Option[], routes: Route[] } };
    }

    get connection(): Connection {
        return this.session?.connection as Connection;
    }

    get sessionData(): Record<string, any> {
        return JSON.parse(<string>this.session?.data)
    }

    get sessionStep() {
        return this.sessionData.step
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

    static async getOrInitSession(connection: Connection, message: Message): Promise<SessionWithIncludes> {
        const activeSession = await client.session.findFirst({
            where: {
                AND: {
                    connection: {
                        is: connection
                    },
                    startTime: {
                        lte: DateTime.now().toJSDate(),
                        gte: DateTime.now().minus({hour: 1}).toJSDate()
                    }
                }
            },
            include: sessionIncludes
        });
        if (!activeSession) {
            const flow = await client.flow.findUnique({
                where: {
                    trigger: message.content
                },

            });

            if (!flow) {
                throw Error("Invalid trigger")
            }

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

    static async init(message: Message): Promise<FlowEngine> {
        const {from} = message;
        const engine = new FlowEngine();
        const connection = await FlowEngine.getOrInitConnection(from);
        engine.setSession(await FlowEngine.getOrInitSession(connection, message));
        engine.setMessage(message);
        return engine;
    }

    setSession(session: SessionWithIncludes) {
        this.session = session;
        return this;
    }

    setMessage(message: Message) {
        this.message = message;
        return this;
    }

    async runAction() {
        const currentState = cloneDeep(this.currentState);
        const action = currentState.action;
        let message = null;
        switch (action.type) {
            case "MENU":
                message = await this.runMenuAction(action);
                break;
            case "INPUT":
                message = await this.runInputAction(action);
                break;
            case "ROUTER":
                await this.runRouteAction(action);
        }
        if (currentState.id !== this.currentState?.id) {
            //State has changed, run the action again
            await this.runAction();
        }
        if (message) {
            return message;
        }
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


    getSelectedMenuOption(options: Option[]): string {
        const index = Number(this.message?.content);
        let option = null;
        if (isNaN(index)) {
            //Try matching using string
            option = options.find(option => this.message?.content?.match(option.text));
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
            const sanitizedExpression = Object.values(sessionData).reduce((acc, curr) => acc.replace(new RegExp(`{${curr}}`, "g"), curr), route.expression)
            return eval(sanitizedExpression);
        });
        if (!route) {
            await this.updateSessionState(action.nextState as string);
        } else {
            await this.updateSessionState(route.nextStateId as string);
            await this.updateSessionData("step", "COMPLETED");
        }

    }

    async runAssignAction(action: Action & { options: Option[] }) {
        const {options, text, dataKey, type} = action;
        const value = type === "MENU" ? this.getSelectedMenuOption(options) : this.message?.content;
        await this.updateSessionData(dataKey as string, value);
        await this.updateSession("step", "COMPLETED");
        await this.updateSessionState(action.nextState as string);
    }

    async runMenuAction(action: Action & { options: Option[] }): Promise<OutGoingMessage> {
        if (this.sessionStep === "WAITING") {
            try {
                await this.runAssignAction(action);
            } catch (e: any) {
                if (e.message === "Invalid option") {
                    return {
                        to: this.connection.identifier,
                        type: "text",
                        content: `Invalid option. Please select from the following options:\n \n ${action.options.map((option, index) => `${index + 1}. ${option.text}`).join("\n")}`
                    }
                }
            }
        }
        //Format the message using the options
        const {options, text} = action;
        const formattedMessage = `${text}\n\n ${options.map((option, index) => `${index + 1}. ${option.text}`).join("\n")}`;
        //Set session step as waiting
        await this.updateSession("step", "WAITING");
        return {
            content: formattedMessage,
            type: "text",
            to: this.connection.identifier
        }
    }

    async runInputAction(action: Action & { options: Option[] }): Promise<OutGoingMessage> {
        if (this.sessionStep === "WAITING") {
            await this.runAssignAction(action);
        }
        return {
            content: action.text as string,
            type: "text",
            to: this.connection.identifier
        }
    }
}
