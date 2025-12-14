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
    get: (id: string) => Promise<GetAnimalRes>;
    getPreviews: () => Promise<Array<GetAnimalPreviewRes>>;
    update: (req: UpdateAnimalReq, id: string) => Promise<UpdateAnimalReq>;
    delete: (id: string) => Promise<void>;
}
