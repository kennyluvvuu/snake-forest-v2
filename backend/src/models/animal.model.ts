import mongoose from "mongoose";

const AnimalSchema = new mongoose.Schema({
    commonName: { type: String, required: true },
    morph: { type: String, required: true },
    sex: {
        type: String,
        enum: ["male", "female", "unknown"],
        required: true,
    },
    price: { type: Number, required: true },
    images: {
        type: [String],
        required: true,
        default: ["/uploads/animals/default.jpg"],
    },
    description: { type: String, required: true },
});

export const Animal = mongoose.model("Animal", AnimalSchema);
