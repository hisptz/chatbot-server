import {z} from "zod";


export const MessageSchema = z.object({
    type: z.enum(['text', 'file', 'image']),
    content: z.string(),
    from: z.string(),
})


export const OutGoingMessageSchema = z.object({
    to: z.string(),
    content: z.string(),
    type: z.enum(['text', 'file', 'image']),
})


export type Message = z.infer<typeof MessageSchema>;
export type OutGoingMessage = z.infer<typeof OutGoingMessageSchema>;
