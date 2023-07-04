import {z} from "zod"
import {PushRequestSchema} from "./push";


export const JobSchema = z.object({
    id: z.string(),
    data: PushRequestSchema,
    schedules: z.array(z.object({
        cron: z.string(),
        enabled: z.boolean(),
        id: z.string().optional()
    }))
})

export type Job = z.infer<typeof JobSchema>;
