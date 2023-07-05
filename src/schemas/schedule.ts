import {z} from "zod"

export const ScheduleSchema = z.object({
    cron: z.string(),
    enabled: z.boolean(),
    id: z.string().optional(),
    job: z.object({
        id: z.string()
    }).optional()
});


export type Schedule = z.infer<typeof ScheduleSchema>;
