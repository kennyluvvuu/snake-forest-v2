import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import { animalQueries } from "~/queries/animalQueries"

export default function useAnimlaById() {
    const params = useParams()
    const id = params.id
    if (!id) throw new Response("Not Found", { status: 404 })

    const { data: animal } = useQuery(animalQueries.animal(id))

    return { animal }
}