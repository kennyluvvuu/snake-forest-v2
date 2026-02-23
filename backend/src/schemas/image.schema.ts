import { z } from "zod";
import { Readable } from "stream";
import { Buffer } from "buffer";

export const ImageFilePartSchema = z.object({
    filename: z.string(),
    fieldname: z.enum(["image"]),
    encoding: z.string(),
    mimetype: z.string().refine((type) => type.startsWith("image/"), {
        message: "Invalid file type, check your request.",
    }),
    file: z.instanceof(Readable),
});

const ImageFilePartBuffer = ImageFilePartSchema.extend({
    buffer: z.instanceof(Buffer),
});

export const MultipleImageFilesSchema = z.preprocess(
    (val) => (Array.isArray(val) ? val : [val]),
    z.array(ImageFilePartSchema),
);

export type SingleImageFilePart = z.infer<typeof ImageFilePartBuffer>;
