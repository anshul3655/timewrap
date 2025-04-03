import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://timewrap.ompreetham.com/sitemap.xml",
    host: "https://timewrap.ompreetham.com",
  }
}

