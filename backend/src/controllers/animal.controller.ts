import {
    type GetAnimalPreviewRes,
    type GetAnimalRes,
    type CreateAnimalReq,
    type CreateAnimalRes,
    type UpdateAnimalReq,
    type UpdateAnimalRes,
} from "../schemas/animal.schema";
import type IAnimalController from "../interfaces/animal.controller.interface";
import { Animal } from "../models/animal.model";

export default class AnimalController implements IAnimalController {
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

    async get(id: string): Promise<GetAnimalRes | null> {
        const fullAnimal = await Animal.findById(id);

        if (!fullAnimal) {
            return null;
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

    async getPreviews(): Promise<Array<GetAnimalPreviewRes> | null> {
        const animalPreviews = await Animal.find().select({
            description: 0,
            images: { $slice: 1 },
        });

        if (!animalPreviews) {
            return null;
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

    async update(
        req: UpdateAnimalReq,
        id: string
    ): Promise<UpdateAnimalRes | null> {
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
            return null;
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

    async delete(id: string): Promise<boolean> {
        const deletedAnimal = await Animal.findByIdAndDelete(id);

        if (!deletedAnimal) {
            return false;
        }

        return true;
    }
}
