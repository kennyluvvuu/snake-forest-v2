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
import slugify from "slugify";

export default class AnimalController implements IAnimalController {
    async create(req: CreateAnimalReq): Promise<CreateAnimalRes> {
        let baseSlug = slugify(req.commonName + " " + req.morph);
        let slug = baseSlug;
        let counter = 1;
        while (await Animal.findOne({ slug })) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        const newAnimal = new Animal({
            slug: slug,
            species: req.species,
            commonName: req.commonName,
            morph: req.morph,
            age: req.age,
            sex: req.sex,
            priority: req.priority,
            price: req.price,
            description: req.description,
        });

        let savedAnimal = await newAnimal.save();

        return {
            id: savedAnimal.id,
            slug: savedAnimal.slug,
            commonName: savedAnimal.commonName,
            species: savedAnimal.species,
            morph: savedAnimal.morph,
            age: savedAnimal.age,
            sex: savedAnimal.sex,
            priority: savedAnimal.priority,
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
            slug: fullAnimal.slug,
            commonName: fullAnimal.commonName,
            species: fullAnimal.species,
            morph: fullAnimal.morph,
            age: fullAnimal.age,
            sex: fullAnimal.sex,
            priority: fullAnimal.priority,
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
                slug: animalPreview.slug,
                commonName: animalPreview.commonName,
                species: animalPreview.species,
                morph: animalPreview.morph,
                age: animalPreview.age,
                sex: animalPreview.sex,
                priority: animalPreview.priority,
                price: animalPreview.price,
                preview: animalPreview.images,
            };
        });
    }

    async update(
        req: UpdateAnimalReq,
        id: string,
    ): Promise<UpdateAnimalRes | null> {
        const updatedAnimal = await Animal.findByIdAndUpdate(
            id,
            {
                species: req.species,
                commonName: req.commonName,
                morph: req.morph,
                age: req.age,
                sex: req.sex,
                priority: req.priority,
                price: req.price,
                description: req.description,
            },
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedAnimal) {
            return null;
        }

        return {
            id: updatedAnimal.id,
            slug: updatedAnimal.slug,
            commonName: updatedAnimal.commonName,
            species: updatedAnimal.species,
            morph: updatedAnimal.morph,
            age: updatedAnimal.age,
            sex: updatedAnimal.sex,
            priority: updatedAnimal.priority,
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
