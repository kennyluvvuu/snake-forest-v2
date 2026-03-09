import { dehydrate } from "@tanstack/react-query";
import ProductTypesListComponent from "~/components/products/ProductTypesListComponent";
import SearchComponent from "~/components/ui/SearchComponent";
import { getQueryClient } from "~/lib/queryClient";
import { productQueries } from "~/queries/productQueries";

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

export default function Products() {
    return (
        <>
            <SearchComponent />
            <p>Filter</p>
            <p>Sort</p>

            <ProductTypesListComponent />
        </>
    )
}