import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import { productQueries } from "~/queries/productQueries"

export default function useProductsByType() {
    const params = useParams()
    const { data: products = [] } = useQuery(productQueries.all())

    return { productsByType: products.filter((product) => product.type === params.type) }
}