import type mongoose from "mongoose";
import type { SingleImageFilePart } from "../schemas/image.schema";

export default interface IImageController<T> {
  add(refId: string, images: SingleImageFilePart[]): Promise<string[] | null>;
  clear(refId: string): Promise<boolean>;
}
