import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createTranslator, localeCookie, resolveLocale } from ".";

export const getLocale = cache(async () =>
  resolveLocale((await cookies()).get(localeCookie)?.value),
);

export async function getTranslator() {
  return createTranslator(await getLocale());
}
