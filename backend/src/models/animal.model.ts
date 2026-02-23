import mongoose from "mongoose";

const AnimalModel = new mongoose.Schema({
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
        default: ["/uploads/animals/default.jpeg"],
    },
    description: { type: String, required: true },
});

export const Animal = mongoose.model("Animal", AnimalModel);

// middlewares

AnimalModel.pre("save", async function () {
    if (!this.images || this.images.length === 0) {
        this.images = ["/uploads/animals/default.jpeg"];
    }
});
