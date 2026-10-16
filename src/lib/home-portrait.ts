import { getDb } from "./db";
import { isPortraitData, type PortraitData } from "./portrait-data";

export const HOME_PORTRAIT_KEY = "home-portrait";

// The portrait an admin uploaded for the home page, or null for the bundled one.
export async function getHomePortrait(): Promise<{
  data: PortraitData;
  updatedAt: Date;
} | null> {
  const setting = await getDb()
    ?.siteSetting.findUnique({ where: { key: HOME_PORTRAIT_KEY } })
    .catch(() => null);
  return setting && isPortraitData(setting.value)
    ? { data: setting.value, updatedAt: setting.updatedAt }
    : null;
}

// Changes with every upload, so the home page can point browsers and the CDN
// at a URL that never needs revalidating.
export async function homePortraitVersion() {
  const setting = await getDb()
    ?.siteSetting.findUnique({
      where: { key: HOME_PORTRAIT_KEY },
      select: { updatedAt: true },
    })
    .catch(() => null);
  return setting ? setting.updatedAt.getTime() : null;
}
