import { MetadataRoute } from "next";
import { PLAYERS } from "@/data/players";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportstphere.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/predictions`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/accuracy`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/insights`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/defence`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/simulator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/players`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/tracker`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/model`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const playerRoutes: MetadataRoute.Sitemap = PLAYERS.map(player => ({
    url: `${BASE}/players/${player.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...playerRoutes];
}
