import {z} from "zod"
import {ScheduleSchema} from "./schedule";


export const JobSchema = z.object({
    id: z.string(),
    description: z.string(),
    visualizations: z.array(z.object({
        id: z.string(),
        name: z.string()
    })).optional(),
    contacts: z.array(z.object({
        id: z.string(),
        number: z.string(),
        type: z.enum(["group", "individual"])
    })),
    schedules: z.array(ScheduleSchema).optional()
})

export type AnalyticsPushJobAPI = z.infer<typeof JobSchema>;
