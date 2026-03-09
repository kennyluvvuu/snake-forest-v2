import { Link } from "react-router"
import type { ProductI } from "~/types/types"

interface ProductCardComponentProps {
    product: ProductI
}

export default function ProductCardComponent({ product } : ProductCardComponentProps) {
    return (
        <li>
            <Link to={`/products/${product.type}/${product.id}`}>
                <article>
                        { product.name }
                </article>
            </Link>
        </li>
    )
}