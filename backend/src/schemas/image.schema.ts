import { z } from "zod";

export const ImageFileSchema = z.object({
    fieldname: z.enum(["animal"]),
    encoding: z.string(),
    mimetype: z.string().refine((type) => type.startsWith("image/"), {
        message: "Invalid file type",
    }),
    buffer: z.instanceof(Buffer),
    size: z.number().max(10 * 1024 * 1024, {
        message: "File size must not be over 10MB",
    }),
});

export type ImageFile = z.infer<typeof ImageFileSchema>;
