import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimeWrap - Commit Anywhere in Time",
    short_name: "TimeWrap",
    description:
      "Create and customize your GitHub contribution graph with TimeWrap. Design your own contribution pattern and export it as Git commands.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  }
}

