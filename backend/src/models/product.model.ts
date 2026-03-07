import mongoose from "mongoose";

const ProductModel = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: {
        type: String,
        enum: ["toy", "usable", "food"],
        required: true,
    },
    images: {
        type: [String],
        required: true,
        default: ["/uploads/products/default.jpeg"],
    },
    description: { type: String, required: true },
});

// middlewares

ProductModel.pre("save", async function () {
    if (!this.images || this.images.length === 0) {
        this.images = ["/uploads/products/default.jpeg"];
    }
});

export const Product = mongoose.model("Product", ProductModel);
