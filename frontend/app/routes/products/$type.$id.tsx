import { dehydrate, useQuery } from "@tanstack/react-query"
import { getQueryClient } from "~/lib/queryClient"
import type { Route } from "../+types/$type.$id"
import { productQueries } from "~/queries/productQueries"
import useProductById from "~/hooks/useProductById"

export async function loader({ params }: Route.LoaderArgs) {
    const client = getQueryClient()

    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    await client.ensureQueryData(productQueries.product(id))

    return { dehydratedState: dehydrate(client) }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const client = getQueryClient()

    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    await client.ensureQueryData(productQueries.product(id))

    return { dehydratedState: undefined }
}

export default function ProductsId() {
    const { product } = useProductById()

    if (!product) return <p>Нет product</p>

    return (
        <>
            { product.name }
        </>
    )
}