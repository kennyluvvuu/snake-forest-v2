import { useQuery } from "@tanstack/react-query"
import AnimalCardComponent from "./AnimalCardComponent"
import { animalQueries } from "~/queries/animalQueries"

export default function AnimalsListComponent() {
    const { data: animalsList = [] } = useQuery(animalQueries.all())

    return (
        <section>
            <h2>Каталог животных</h2>
            <ul>
                {animalsList.length === 0 ? <h3>Список пуст</h3> : animalsList.map((animal) => <AnimalCardComponent key={animal.id} animal={animal} />)}
            </ul>
        </section>
    )
}