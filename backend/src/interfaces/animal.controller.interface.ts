import { CreateAnimalReq, GetAnimalPreviewRes, GetAnimalRes, CreateAnimalRes, UpdateAnimalReq, UpdateAnimalRes } from "../schemas/animal.schema"

export interface IAnimalController {
    create: (req: CreateAnimalReq) => Promise<CreateAnimalRes>
    get: (id: string) => Promise<GetAnimalRes>
    getPreviews: () => Promise<Array<GetAnimalPreviewRes>>
    update: (req: UpdateAnimalReq) => Promise<UpdateAnimalReq>
    delete: (id: number) => Promise<void>
}