import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import { productQueries } from "~/queries/productQueries"

export default function useProductById() {
    const params = useParams()
    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    const { data: product } = useQuery(productQueries.product(id))

    return { product }
}