import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trackio · Registro de peso",
    short_name: "Trackio",
    description: "Lleva el control de tu peso diario",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5fc",
    theme_color: "#4a3aa7",
    icons: [
      {
        src: "/logos/playstore.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logos/appstore.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
