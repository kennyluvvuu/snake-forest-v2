import {
    type CreateAnimalReq,
    type GetAnimalPreviewRes,
    type GetAnimalRes,
    type CreateAnimalRes,
    type UpdateAnimalReq,
    type UpdateAnimalRes,
} from "../schemas/animal.schema";

export default interface IAnimalController {
    create: (req: CreateAnimalReq) => Promise<CreateAnimalRes>;
    get: (id: string) => Promise<GetAnimalRes | null>;
    getPreviews: () => Promise<Array<GetAnimalPreviewRes> | null>;
    update: (
        req: UpdateAnimalReq,
        id: string
    ) => Promise<UpdateAnimalReq | null>;
    delete: (id: string) => Promise<boolean>;
}
