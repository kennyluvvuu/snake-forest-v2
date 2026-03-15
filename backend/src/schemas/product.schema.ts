import { z } from "zod";

export const ProductSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string().min(1, { message: "Name is required." }),
    price: z.number().min(0, { message: "Price must be >= 0." }),
    type: z.enum(["toy", "usable", "food"]),
    description: z
        .string()
        .min(10, { message: "Description must be > 10 symbols." })
        .max(1000, { message: "Description must be < 1000 symbols." }),
    imagesUrl: z.array(z.string()).max(10, {
        message: "Too many images(cant be more 10).",
    }),
});

export const CreateProductSchema = ProductSchema.omit({
    id: true,
    imagesUrl: true,
    slug: true,
});

export type CreateProductReq = z.infer<typeof CreateProductSchema>;
export type CreateProductRes = z.infer<typeof ProductSchema>;

export const UpdateProductSchema = ProductSchema.omit({
    id: true,
    imagesUrl: true,
    slug: true,
});

export type UpdateProductReq = z.infer<typeof UpdateProductSchema>;
export type UpdateProductRes = z.infer<typeof ProductSchema>;

export const GetProductPreviewSchema = ProductSchema.extend({
    preview: z.array(z.string()),
}).omit({
    description: true,
    imagesUrl: true,
});

export type GetProductPreviewRes = z.infer<typeof GetProductPreviewSchema>;
export type GetProductRes = z.infer<typeof ProductSchema>;

export const UrlParamsIdSchema = z.object({
    id: z.string().refine((id) => /^[a-fA-F0-9]{24}$/.test(id), {
        message: "Invalid product id format.",
    }),
});
