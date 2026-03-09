import { Link } from "react-router"

interface ProductTypeCardComponentProps {
    type: string
}

export default function ProductTypeCardComponent({ type }: ProductTypeCardComponentProps) {
    return (
        <li>
            <Link to={`/products/${type}`}>
                <article>
                        { type }
                </article>
            </Link>
        </li>
    )
}