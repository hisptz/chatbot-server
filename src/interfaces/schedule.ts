import {z} from "zod"
import {PushRequestSchema} from "./push";


export const ScheduleSchema = z.object({
    id: z.string(),
    data: PushRequestSchema,
    schedules: z.array(z.object({
        cron: z.string(),
        enabled: z.boolean()
    }))
})


export type Schedule = z.infer<typeof ScheduleSchema>;