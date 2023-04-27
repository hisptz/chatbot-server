import z from "zod";

export const answerSchema = z.object({
    id: z.string({description: "Answer id"}),
    next: z.string({description: "Next tree state id"}).optional(),
    text: z.string({description: "Answer text"}),
    description: z.string({description: "Answer description"})
})
export const treeStateSchema = z.object({
    id: z.string({description: "State id"}),
    type: z.enum(["text", "question", "menu"], {description: "State type"}),
    question: z.string({description: "Question to ask when tree is in this state"}),
    errorResponse: z.string({description: "Error response to send when answer does not match when tree is in this state"}),
    answers: z.array(answerSchema).optional()
})
export const actionSchema = z.object({
    id: z.string({description: "Action id"}),
    type: z.string({description: "Action type"})
})
export const treeSchema = z.object({
    id: z.string({description: "Tree id"}),
    trigger: z.string({description: "Trigger keyword/message for the tree. This is used to match the tree to the sender message"}),
    complete: actionSchema,
    initialState: z.string({description: "Initial state id"}),
    states: z.array(treeStateSchema),
})

export type TreeData = z.infer<typeof treeSchema>
export type ActionData = z.infer<typeof actionSchema>
export type TreeStateData = z.infer<typeof treeStateSchema>
export type AnswerData = z.infer<typeof answerSchema>
