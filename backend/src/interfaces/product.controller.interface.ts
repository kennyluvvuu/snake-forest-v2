import type {
    CreateProductReq,
    CreateProductRes,
    GetProductPreviewRes,
    GetProductRes,
    UpdateProductReq,
    UpdateProductRes,
} from "../schemas/product.schema";

export default interface IProductController {
    create: (req: CreateProductReq) => Promise<CreateProductRes>;
    get: (id: string) => Promise<GetProductRes | null>;
    getBySlug: (slug: string) => Promise<GetProductRes | null>;
    getPreviews: () => Promise<Array<GetProductPreviewRes> | null>;
    update: (
        id: string,
        req: UpdateProductReq,
    ) => Promise<UpdateProductRes | null>;
    delete: (id: string) => Promise<boolean>;
}
