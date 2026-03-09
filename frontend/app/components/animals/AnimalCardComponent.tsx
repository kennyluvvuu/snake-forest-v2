import { Link } from "react-router"
import type { AnimalI } from "~/types/types"

interface AnimalCardComponentProps {
    animal: AnimalI
}

export default function AnimalCardComponent({ animal }: AnimalCardComponentProps) {
    return (
        <li>
            <Link to={`/animals/${animal.id}`}>
                <article>
                    <h3>{ animal.commonName }</h3>
                    <p>{ animal.age }</p>
                    <p>{ animal.morph }</p>
                    <p>{ animal.species }</p>
                </article>
            </Link>
        </li>
    )
}