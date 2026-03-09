import ProductTypeCardComponent from "./ProductTypeCardComponent"

const productTypes = ["one", "two", 'three']

export default function ProductTypesListComponent() {
    return (
        <section>
            <h2>Типы продукции</h2>
            <ul>
                {productTypes.map((type) => <ProductTypeCardComponent key={type} type={type} />)}
            </ul>
        </section>
    )
}