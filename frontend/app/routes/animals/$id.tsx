import { dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "~/lib/queryClient"
import { animalQueries } from "~/queries/animalQueries"
import type { Route } from "../+types/$id"
import useAnimlaById from "~/hooks/useAnimalById"

export async function loader({ params }: Route.LoaderArgs) {
    const client = getQueryClient()

    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    await client.ensureQueryData(animalQueries.animal(id))

    return { dehydratedState: dehydrate(client) }
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const client = getQueryClient()

    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    await client.ensureQueryData(animalQueries.animal(id))

    return { dehydratedState: undefined }
}

export default function AnimalsId() {
    const { animal } = useAnimlaById()

    if (!animal) return <p>Нет animal</p>

    return (
        <>
            { animal.commonName }
        </>
    )
}