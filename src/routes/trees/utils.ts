import client from "../../client"
import prisma from "../../client"
import {AnswerData, TreeData, TreeStateData} from "../../interfaces/tree";
import {v4 as uuid} from 'uuid';
import {Action, Prisma, Tree, TreeState} from "@prisma/client";
import {asyncify, mapSeries} from "async";
import {find, flattenDeep} from "lodash";


async function createAnswerAndTransition(answer: AnswerData, treeState: TreeState) {
    return client.transition.create({
        data: {
            id: uuid(),
            name: answer.text,
            answer: {
                create: {
                    id: answer.id,
                    name: answer.text,
                    description: answer.description
                }
            },
            nextState: {
                connect: {
                    id: answer.next
                }
            },
            currentState: {
                connect: {
                    id: treeState.id
                }
            }
        },
    })
}

function createQuestion(treeState: TreeStateData) {
    const {question, errorResponse} = treeState;
    return {
        text: question,
        errorResponse
    }
}

function createTreeStatePayload(treeState: TreeStateData, treeId: string): Prisma.TreeStateCreateInput {
    return {
        question: {
            create: createQuestion(treeState)
        },
        name: treeState.question,
        id: treeState.id,
        retries: 5,
        type: treeState.type,
        owningTree: {
            connect: {
                id: treeId
            }
        }
    }
}

async function createTreeState(treeState: TreeStateData, treeId: string) {
    return client.treeState.create({data: createTreeStatePayload(treeState, treeId)})
}

export async function createTree(tree: TreeData) {
    const {states, initialState, trigger, id, complete} = tree;
    const initialStateData = find(states, {id: initialState});
    const remainingStates = states.filter(state => state.id !== initialState);
    const treeData = await prisma.tree.create({
        data: {
            id: tree.id,
            completion: {
                create: {
                    id: tree.complete.id,
                    type: tree.complete.type
                }
            },
            trigger: tree.trigger,
            rootState: initialStateData?.id as string
        }
    });
    const treeStateData = await mapSeries(remainingStates, asyncify(async (state: TreeStateData) => createTreeState(state, treeData.id)));
    const answerData = flattenDeep(await mapSeries(treeStateData, asyncify(async (state: TreeState) => {
        const answers = find(states, {id: state.id})?.answers ?? [];
        return mapSeries(answers ?? [], asyncify(async (answer: AnswerData) => createAnswerAndTransition(answer, state)))
    })));
    console.log({
        answerData
    })
}


async function getTreeStateFromDB(state: TreeState): Promise<TreeStateData> {
    const transitions = await client.transition.findMany({
        where: {
            currentState: {
                id: state.id
            }
        },
        include: {
            answer: true,
            nextState: true
        }
    });

    const answers = transitions.map(transition => {

        return {
            id: transition.answer.id,
            text: transition.answer.name,
            description: transition.answer.description,
            next: transition.nextState.id
        }
    });

    return {
        errorResponse: "",
        answers,
        type: state.type as any,
        question: state.name,
        id: state.id
    }

}


async function getTreeDataFromDBObject(tree: Tree & { states: TreeState[], completion: Action }): Promise<TreeData> {
    return {
        id: tree.id,
        states: await mapSeries(tree.states, asyncify(async (state: TreeState) => getTreeStateFromDB(state))),
        initialState: tree.rootState,
        trigger: tree.trigger,
        complete: tree.completion
    };
}

export async function getTrees(): Promise<TreeData[]> {
    const trees = await client.tree.findMany({
        include: {
            states: true,
            completion: true
        }
    });

    return mapSeries(trees ?? [], asyncify(async (tree: Tree & {
        states: TreeState[],
        completion: Action
    }) => await getTreeDataFromDBObject(tree)));
}

export async function getTree(id: string) {
    const tree = await client.tree.findUnique({
        where: {
            id
        },
        include: {
            states: true,
            completion: true
        }
    });
    if (!tree) {
        return null;
    }
    return await getTreeDataFromDBObject(tree);
}
