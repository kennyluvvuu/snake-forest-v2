import { axiosInstance } from "~/lib/axios";
import type { AnimalsListT, AnimalByIdI } from "~/types/types";

export const animalApi = {
    // Получить всех
    getAll: async () => {
        const res = await axiosInstance.get<AnimalsListT>("/animals");
        return res.data;
    },
    
    // Получить одного по ID
    getById: async (id: string) => {
        const res = await axiosInstance.get<AnimalByIdI>(`/animals/${id}`);
        return res.data;
    }
}