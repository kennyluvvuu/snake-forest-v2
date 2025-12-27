import type mongoose from "mongoose";
import type { ImageFile } from "../schemas/image.schema";

export default interface IImageController<T> {
  add(refId: string, images: ImageFile[]): Promise<string[] | null>;
  updateAll(refId: string, images: ImageFile[]): Promise<string[] | null>;
}
