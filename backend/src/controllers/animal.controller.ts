import {
    type GetAnimalPreviewRes,
    type GetAnimalRes,
    type CreateAnimalReq,
    type CreateAnimalRes,
    type UpdateAnimalReq,
    type UpdateAnimalRes,
} from "../schemas/animal.schema";
import type { IAnimalController } from "../interfaces/animal.controller.interface";
import { Animal } from "../models/animal.model";

export class AnimalController implements IAnimalController {
    async create(req: CreateAnimalReq): Promise<CreateAnimalRes> {
        const newAnimal = new Animal({
            commonName: req.commonName,
            morph: req.morph,
            sex: req.sex,
            price: req.price,
            description: req.description,
        });

        let savedAnimal = await newAnimal.save();

        return {
            id: savedAnimal.id,
            commonName: savedAnimal.commonName,
            morph: savedAnimal.morph,
            sex: savedAnimal.sex,
            price: savedAnimal.price,
            description: savedAnimal.description,
            imagesUrl: savedAnimal.images,
        };
    }

    async get(id: string): Promise<GetAnimalRes> {
        const fullAnimal = await Animal.findById(id);

        if (!fullAnimal) {
            throw new Error(`Could not find Animal with id: ${id}`);
        }

        return {
            id: fullAnimal.id,
            commonName: fullAnimal.commonName,
            morph: fullAnimal.morph,
            sex: fullAnimal.sex,
            price: fullAnimal.price,
            description: fullAnimal.description,
            imagesUrl: fullAnimal.images,
        };
    }

    async getPreviews(): Promise<Array<GetAnimalPreviewRes>> {
        const animalPreviews = await Animal.find().select({
            description: 0,
            images: { $slice: 1 },
        });

        if (!animalPreviews) {
            throw new Error("Could not find any objects at Animal collection");
        }

        return animalPreviews.map((animalPreview) => {
            return {
                id: animalPreview.id,
                commonName: animalPreview.commonName,
                morph: animalPreview.morph,
                sex: animalPreview.sex,
                price: animalPreview.price,
                preview: animalPreview.images,
            };
        });
    }

    async update(req: UpdateAnimalReq, id: string): Promise<UpdateAnimalRes> {
        const updatedAnimal = await Animal.findByIdAndUpdate(
            id,
            {
                commonName: req.commonName,
                morph: req.morph,
                sex: req.sex,
                price: req.price,
                description: req.description,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedAnimal) {
            throw new Error(`Could not find Animal with id: ${id}`);
        }

        return {
            id: updatedAnimal.id,
            commonName: updatedAnimal.commonName,
            morph: updatedAnimal.morph,
            sex: updatedAnimal.sex,
            price: updatedAnimal.price,
            description: updatedAnimal.description,
            imagesUrl: updatedAnimal.images,
        };
    }

    async delete(id: string): Promise<void> {
        const deletedAnimal = await Animal.findByIdAndDelete(id);

        if (!deletedAnimal) {
            throw new Error(`Could not find Animal with id: ${id}`);
        }
    }
}
