export type AgeCategoryT = "young" | "adult" | "elderly"
export type SexCategoryT = "male" | "female" | "unknown"
export type ProductTypeT = string
export type AnimalSpeciesT = "lizard" | "snake" | "turtle" | "fish" | "rodent" | "other"

export interface AnimalI {
    id: string
    commonName: string
    species: AnimalSpeciesT
    morph: string
    age: AgeCategoryT
    priority: number
    price: number
    preview: string[]
}

export type AnimalsListT = AnimalI[]

export interface AnimalByIdI {
    id: string
    commonName: string
    species: AnimalSpeciesT
    morph: string
    age: AgeCategoryT
    sex: SexCategoryT
    priority: number
    price: number
    description: string
    imagesUrl: string[]
}

export interface ProductI {
    id: string
    name: string
    price: number
    type: ProductTypeT
    preview: string[]
}

export type ProductListT = ProductI[]

export interface ProductByIdI {
    id: string
    name: string
    price: number
    type: ProductTypeT
    description: string
    imagesUrl: string[]
}
