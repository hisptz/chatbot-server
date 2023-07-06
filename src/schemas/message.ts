import {z} from "zod";


export enum ContactType {
    INDIVIDUAL = "individual",
    GROUP = "group"
}

export enum MessageType {
    IMAGE = "image",
    CHAT = "chat",
    DOCUMENT = "document",
    AUDIO = "audio",
    VIDEO = "video"
}


export const ImageMessage = z.object({
    type: z.literal(MessageType.IMAGE),
    image: z.string(),
    text: z.string().optional()
})

export const TextMessage = z.object({
    type: z.literal(MessageType.CHAT),
    text: z.string()
})

export const FileMessage = z.object({
    type: z.enum([MessageType.AUDIO, MessageType.VIDEO, MessageType.DOCUMENT]),
    text: z.string().optional(),
    file: z.string()
})

export const Message = z.discriminatedUnion("type", [
    TextMessage,
    FileMessage,
    ImageMessage
])
export const IncomingMessageSchema = z.object({
    message: Message,
    from: z.object({
        type: z.nativeEnum(ContactType),
        number: z.string(),
        author: z.string().optional(),
        name: z.string().optional()
    }),
    isForwarded: z.boolean().optional()
})

export const ToContactSchema = z.object({
    number: z.string(),
    type: z.nativeEnum(ContactType)
})


export const OutGoingMessageSchema = z.object({
    message: Message,
    to: z.array(ToContactSchema)
})


export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;
export type OutGoingMessage = z.infer<typeof OutGoingMessageSchema>;
export type MessageConfig = z.infer<typeof Message>
export type ToContact = z.infer<typeof ToContactSchema>
