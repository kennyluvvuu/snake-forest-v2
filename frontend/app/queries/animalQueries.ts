import { queryOptions } from "@tanstack/react-query";
import { animalApi } from "~/api/animal";

export const animalQueries = {
    all: () => queryOptions({
        queryKey: ["animals"],
        queryFn: () => animalApi.getAll(),
        meta: {
            errorMessage: "Не удалось загрузить список животных"
        }
    }),

    animal: (id: string) => queryOptions({
        queryKey: ["animals", "animal", id],
        queryFn: () => animalApi.getById(id),
        meta: {
            errorMessage: "Не удалось загрузить карточку животного"
        }
    }),
};