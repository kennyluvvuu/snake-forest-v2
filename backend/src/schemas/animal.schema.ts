import { z } from "zod"
import { ImageSchema } from "./image.schema"

export const AnimalSchema = z.object({
    commonName: z.string().min(2, "Common name is required"),
    morph: z.string().min(2),
    sex: z.enum(["male", "female", "unknown"]),
    price: z.number(),
})

export const AnimalSchemaWithId = AnimalSchema.extend({
    id: z.string()
})

export const AnimalSchemaFull = AnimalSchemaWithId.extend({
    description: z.string().min(25, {
        message: "Description must be > 25 symbols"
    }).max(500, {
        message: "Description must be < 500 symbols"
    })
})

export const CreateAnimalSchema = AnimalSchema.extend({
    description: z.string().min(25, {
        message: "Description must be > 25 symbols"
    }).max(500, {
        message: "Description must be < 500 symbols"
    })
})

export type CreateAnimalReq = z.infer<typeof CreateAnimalSchema>
export type CreateAnimalRes = z.infer<typeof AnimalSchemaFull>
export type UpdateAnimalReq = z.infer<typeof AnimalSchemaWithId>
export type UpdateAnimalRes = z.infer<typeof AnimalSchemaWithId>

export const GetAnimalPreviewSchema = AnimalSchemaWithId.extend({
    preview: z.array(z.string()),
})

export type GetAnimalPreviewRes = z.infer<typeof GetAnimalPreviewSchema>

export const GetAnimalSchema = AnimalSchemaWithId.extend({
    images: z.array(z.string()).max(10, {
        message: "Too many images(cant be more 10)"
    }),
    description: z.string().min(25, {
        message: "Description must be > 25 symbols"
    }).max(500, {
        message: "Description must be < 500 symbols"
    })
})

export type GetAnimalRes = z.infer<typeof GetAnimalSchema>