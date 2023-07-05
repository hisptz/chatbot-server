import {z} from "zod"
import {ToContactSchema} from "./message";


export const PushRequestSchema = z.object({
    to: z.array(ToContactSchema, {required_error: "Contacts to send push is required"}),
    visualizations: z.array(z.object({
        id: z.string(),
        name: z.string()
    }), {required_error: "A list of visualizations to send is required"}),
    description: z.string({description: "A description of the visualizations"}).optional()
});


export type PushRequest = z.infer<typeof PushRequestSchema>;
