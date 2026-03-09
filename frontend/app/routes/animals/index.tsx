import { dehydrate } from "@tanstack/react-query";
import AnimalsListComponent from "~/components/animals/AnimalsListComponent";
import SearchComponent from "~/components/ui/SearchComponent";
import { getQueryClient } from "~/lib/queryClient";
import { animalQueries } from "~/queries/animalQueries";

export async function loader() {
    const client = getQueryClient()

    await client.ensureQueryData(animalQueries.all())

    return { dehydratedState: dehydrate(client) }
}

export async function clientLoader() {
    const client = getQueryClient()

    await client.ensureQueryData(animalQueries.all())

    return { dehydratedState: undefined }
}

export default function Animals() {
    return (
        <>
            <SearchComponent />
            <p>Filter</p>
            <p>Sort</p>

            <AnimalsListComponent />
        </>
    )
}