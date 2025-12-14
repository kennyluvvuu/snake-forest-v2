import { z } from "zod";

export const AnimalSchema = z.object({
    id: z.string(),
    commonName: z.string().min(2, { message: "Common name is required." }),
    morph: z.string().min(2),
    sex: z.enum(["male", "female", "unknown"]),
    price: z.number(),
    description: z
        .string()
        .min(25, {
            message: "Description must be > 25 symbols.",
        })
        .max(500, {
            message: "Description must be < 500 symbols.",
        }),
    imagesUrl: z.array(z.string()).max(10, {
        message: "Too many images(cant be more 10).",
    }),
});

export const CreateAnimalSchema = AnimalSchema.omit({
    id: true,
    imagesUrl: true,
});

export type CreateAnimalReq = z.infer<typeof CreateAnimalSchema>;
export type CreateAnimalRes = z.infer<typeof AnimalSchema>;

export const UpdateAnimalSchema = AnimalSchema.omit({
    id: true,
    imagesUrl: true,
});

export type UpdateAnimalReq = z.infer<typeof UpdateAnimalSchema>;
export type UpdateAnimalRes = z.infer<typeof AnimalSchema>;

export const GetAnimalPreviewSchema = AnimalSchema.extend({
    preview: z.array(z.string()),
}).omit({
    description: true,
    imagesUrl: true,
});

export type GetAnimalPreviewRes = z.infer<typeof GetAnimalPreviewSchema>;
export type GetAnimalRes = z.infer<typeof AnimalSchema>;

export const UrlParamsIdSchema = z.object({
    id: z.string().refine((id) => /^[a-fA-F0-9]{24}$/.test(id), {
        message: "Invalid user id format.",
    }),
});
