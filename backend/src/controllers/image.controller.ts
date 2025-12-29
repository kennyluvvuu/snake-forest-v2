import mongoose from "mongoose";
import type IImageController from "../interfaces/image.controller.interface";
import type { SingleImageFilePart } from "../schemas/image.schema";
import * as path from "path";
import mime from "mime-types";
import { createWriteStream } from "fs";
import { rm, mkdir } from "fs/promises";
import { pipeline } from "node:stream/promises";

export default class ImageController<T extends { images: string[] }>
  implements IImageController<T> {
  private refModel: mongoose.Model<T>;
  private uploadDir: string;
  constructor(refModel: mongoose.Model<T>, uploadDir: string) {
    this.refModel = refModel;
    this.uploadDir = uploadDir;
  }

  async add(refId: string, images: SingleImageFilePart[]): Promise<string[] | null> {
    const objectToUpdate = await this.refModel.findById(refId);
    if (!objectToUpdate) {
      return null;
    }
    const uploadPath = path.join(this.uploadDir, refId, "images");
    await mkdir(uploadPath, { recursive: true });
    for (const image of images) {
      const extension = `.${mime.extension(image.mimetype) || "jpeg"}`;
      const imagePath = path.join(
        uploadPath,
        crypto.randomUUID().slice(0, 8) + extension);
      const writeStream = createWriteStream(imagePath);

      await pipeline(image.file, writeStream);
      objectToUpdate.images.push(imagePath);
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
