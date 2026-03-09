import { axiosInstance } from "~/lib/axios";
import type { ProductByIdI, ProductListT } from "~/types/types";

export const productApi = {
    // Получить всех
    getAll: async () => {
        const res = await axiosInstance.get<ProductListT>("/animals");
        return res.data;
    },
    
    // Получить одного по ID
    getById: async (id: string) => {
        const res = await axiosInstance.get<ProductByIdI>(`/animals/${id}`);
        return res.data;
    }
}