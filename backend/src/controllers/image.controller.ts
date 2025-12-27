import mongoose from "mongoose";
import type IImageController from "../interfaces/image.controller.interface";
import type { ImageFile } from "../schemas/image.schema";
import * as path from "path";
import mime from "mime-types";
import { rm } from "fs/promises";

export default class ImageController<T extends { images: string[] }>
  implements IImageController<T> {
  private refModel: mongoose.Model<T>;
  private uploadDir: string;
  constructor(refModel: mongoose.Model<T>, uploadDir: string) {
    this.refModel = refModel;
    this.uploadDir = uploadDir;
  }
  async add(refId: string, images: ImageFile[]): Promise<string[] | null> {
    const objectToUpdate = await this.refModel.findById(refId);
    if (!objectToUpdate) {
      return null;
    }
    const uploadPath = path.join(this.uploadDir, refId, "images");
    for (const image of images) {
      const extension = mime.extension(image.mimetype);
      if (!extension) {
        throw new Error("Unable to get file extention.");
      }
      const imagePath = path.join(
        uploadPath,
        crypto.randomUUID().slice(0, 8), extension);
      await Bun.write(imagePath, image.buffer);
      objectToUpdate.images.push(imagePath);
    }

    await objectToUpdate.save();

    return objectToUpdate.images;
  }

  async updateAll(
    refId: string,
    images: ImageFile[]
  ): Promise<string[] | null> {
    const objectToUpdate = await this.refModel.findById(refId);
    if (!objectToUpdate) {
      return null;
    }
    const uploadPath = path.join(this.uploadDir, refId, "images");
    await rm(uploadPath, { recursive: true, force: true });
    objectToUpdate.images = [];
    for (const image of images) {
      const extension = mime.extension(image.mimetype);
      if (!extension) {
        throw new Error("Unable to get file extention.");
      }
      const imagePath = path.join(
        uploadPath,
        crypto.randomUUID().slice(0, 8),
        extension
      );
      await Bun.write(imagePath, image.buffer);
      objectToUpdate.images.push(imagePath);
    }

    await objectToUpdate.save();

    return objectToUpdate.images;
  }
}
