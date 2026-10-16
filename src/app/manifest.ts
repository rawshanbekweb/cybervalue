import type { MetadataRoute } from "next";

// Installable app: the labs open full screen from the home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cybervalue Academy",
    short_name: "Cybervalue",
    description:
      "Kiberxavfsizlik va dasturlash: Academy Junior, laboratoriyalar va o‘quvchi kabineti.",
    start_url: "/akademiya",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "uz",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Academy Junior", url: "/junior" },
      { name: "Student portal", url: "/student" },
      { name: "Live quiz", url: "/live" },
    ],
  };
}
