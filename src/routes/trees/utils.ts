import client from "../../client"
import {AnswerData, TreeData, TreeStateData} from "../../interfaces/tree";
import {v4 as uuid} from 'uuid';
import prisma from "../../client";
import {Prisma, TreeState} from "@prisma/client";
import {asyncify, map, mapSeries} from "async";
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

export async function getTrees() {
    return client.tree.findMany({
        include: {
            states: true
        }
    });
}
