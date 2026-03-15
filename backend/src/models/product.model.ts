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

export const Product = mongoose.model("Product", ProductModel);
