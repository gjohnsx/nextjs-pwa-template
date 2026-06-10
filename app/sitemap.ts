import type { MetadataRoute } from "next";
import { CONVERT_AMOUNTS } from "@/lib/convert-amounts";
import { SITE_URL } from "@/lib/site";

const GUIDE_PATHS = [
  "/guide",
  "/guide/ramen-cost-in-japan",
  "/guide/japan-trip-daily-budget",
  "/guide/cash-in-japan",
  "/guide/vending-machines-japan",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...GUIDE_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...CONVERT_AMOUNTS.map((entry) => ({
      url: `${SITE_URL}/convert/${entry.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/support`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
