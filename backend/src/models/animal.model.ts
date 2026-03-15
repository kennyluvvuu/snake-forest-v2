import mongoose from "mongoose";

const AnimalModel = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    commonName: { type: String, required: true },
    species: { type: String, required: true },
    morph: { type: String, required: true },
    sex: {
        type: String,
        enum: ["male", "female", "unknown"],
        required: true,
    },
    age: { type: String, enum: ["young", "adult", "elderly"], required: true },
    priority: { type: Number, required: true },
    price: { type: Number, required: true },
    images: {
        type: [String],
        required: true,
        default: [],
    },
    description: { type: String, required: true },
});

export const Animal = mongoose.model("Animal", AnimalModel);
