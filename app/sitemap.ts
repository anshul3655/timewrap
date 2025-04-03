import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  return [
    {
      url: "https://timewrap.ompreetham.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...years.map((year) => ({
      url: `https://timewrap.ompreetham.com/graph/${year}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}

