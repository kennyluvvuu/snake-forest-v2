import { getQueryClient } from "~/lib/queryClient"
import { productQueries } from "~/queries/productQueries"
import { dehydrate, useQuery } from "@tanstack/react-query"
import useProductsByType from "~/hooks/useProductsByType"
import ProductCardComponent from "~/components/products/ProductCardComponent"

export async function loader() {
    const client = getQueryClient() 

    await client.ensureQueryData(productQueries.all())

    return { dehydratedState: dehydrate(client) }
}

export async function clientLoader() {
    const client = getQueryClient()

    await client.ensureQueryData(productQueries.all())

    return { dehydratedState: undefined }
}


export default function ProductsType() {
    const { productsByType } = useProductsByType()

    return (
        <section>
            <ul>
                {productsByType.map((product) => <ProductCardComponent key={product.id} product={product} />)}
            </ul>
        </section>
    )
}