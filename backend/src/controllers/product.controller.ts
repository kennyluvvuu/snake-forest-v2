import {
    type GetProductPreviewRes,
    type GetProductRes,
    type CreateProductReq,
    type CreateProductRes,
    type UpdateProductReq,
    type UpdateProductRes,
} from "../schemas/product.schema";
import type IProductController from "../interfaces/product.controller.interface";
import { Product } from "../models/product.model";
import slugify from "slugify";

export default class ProductController implements IProductController {
    async create(req: CreateProductReq): Promise<CreateProductRes> {
        let baseSlug = slugify(req.name);
        let slug = baseSlug;
        let counter = 1;
        while (await Product.findOne({ slug })) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        const newProduct = new Product({
            slug: slug,
            name: req.name,
            price: req.price,
            type: req.type,
            description: req.description,
        });

        const savedProduct = await newProduct.save();

        return {
            id: savedProduct.id,
            slug: savedProduct.slug,
            name: savedProduct.name,
            price: savedProduct.price,
            type: savedProduct.type as "toy" | "usable" | "food",
            description: savedProduct.description,
            imagesUrl: savedProduct.images,
        };
    }

    async get(id: string): Promise<GetProductRes | null> {
        const product = await Product.findById(id);

        if (!product) {
            return null;
        }

        return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            type: product.type as "toy" | "usable" | "food",
            description: product.description,
            imagesUrl: product.images,
        };
    }

    async getPreviews(): Promise<Array<GetProductPreviewRes> | null> {
        const productPreviews = await Product.find().select({
            description: 0,
            images: { $slice: 1 },
        });

        if (!productPreviews) {
            return null;
        }

        return productPreviews.map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            type: product.type as "toy" | "usable" | "food",
            preview: product.images,
        }));
    }

    async update(
        id: string,
        req: UpdateProductReq,
    ): Promise<UpdateProductRes | null> {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: req.name,
                price: req.price,
                type: req.type,
                description: req.description,
            },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedProduct) {
            return null;
        }

        return {
            id: updatedProduct.id,
            slug: updatedProduct.slug,
            name: updatedProduct.name,
            price: updatedProduct.price,
            type: updatedProduct.type as "toy" | "usable" | "food",
            description: updatedProduct.description,
            imagesUrl: updatedProduct.images,
        };
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await Product.findByIdAndDelete(id);

        return deleted !== null;
    }
}
