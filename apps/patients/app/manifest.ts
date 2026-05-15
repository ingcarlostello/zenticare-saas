import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zenticare — Portal de Pacientes",
    short_name: "Zenticare",
    description:
      "Tu salud, al día, todo en un solo lugar. Gestiona tus citas médicas, chatea con tu doctor y mantén tu perfil de salud actualizado.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#28B485",
    orientation: "portrait-primary",
    categories: ["health", "medical"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
