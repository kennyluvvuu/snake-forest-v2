import mongoose from "mongoose";
import type IImageController from "../interfaces/image.controller.interface";
import type { SingleImageFilePart } from "../schemas/image.schema";
import * as path from "path";
import mime from "mime-types";
import { rm, mkdir } from "fs/promises";
import { writeFile } from "node:fs/promises";

export default class ImageController<
    T extends { images: string[] },
> implements IImageController<T> {
    private refModel: mongoose.Model<T>;
    private uploadDir: string;  // filesystem path, e.g. "./uploads/animals"
    private publicDir: string;  // public URL prefix, e.g. "/uploads/animals"
    constructor(refModel: mongoose.Model<T>, uploadDir: string, publicDir: string) {
        this.refModel = refModel;
        this.uploadDir = uploadDir;
        this.publicDir = publicDir;
    }

    async add(
        refId: string,
        images: SingleImageFilePart[],
    ): Promise<string[] | null> {
        const objectToUpdate = await this.refModel.findById(refId);
        if (!objectToUpdate) {
            return null;
        }
        const fsPath = path.join(this.uploadDir, refId, "images");
        await mkdir(fsPath, { recursive: true });
        for (const image of images) {
            const extension = `.${mime.extension(image.mimetype) || "jpeg"}`;
            const filename = crypto.randomUUID().slice(0, 8) + extension;

            await writeFile(path.join(fsPath, filename), image.buffer);

            // store public URL (served by nginx), not the filesystem path
            const publicUrl = [this.publicDir, refId, "images", filename].join("/");
            objectToUpdate.images.push(publicUrl);
        }

        await objectToUpdate.save();

        return objectToUpdate.images;
    }

    async clear(refId: string): Promise<boolean> {
        const objectToUpdate = await this.refModel.findById(refId);
        if (!objectToUpdate) {
            return false;
        }
        const uploadPath = path.join(this.uploadDir, refId, "images");
        objectToUpdate.images = [];
        await objectToUpdate.save();
        await rm(uploadPath, { recursive: true, force: true });
        return true;
    }
}
