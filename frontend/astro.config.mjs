import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    output: "static",
    vite: {
        plugins: [tailwindcss()],
        server: {
            proxy: {
                "/uploads": "http://localhost",
            },
        },
    },
});
