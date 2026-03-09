import { queryOptions } from "@tanstack/react-query";
import { productApi } from "~/api/product";

export const productQueries = {
    all: () => queryOptions({
        queryKey: ["products"],
        queryFn: () => productApi.getAll(),
        meta: {
            errorMessage: "Не удалось загрузить список продуктов"
        }
    }),

    product: (id: string) => queryOptions({
        queryKey: ["products", "product", id],
        queryFn: () => productApi.getById(id),
        meta: {
            errorMessage: "Не удалось загрузить карточку продукта"
        }
    }),
};