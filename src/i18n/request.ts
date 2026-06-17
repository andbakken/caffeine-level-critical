import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { applyBrand } from "@/lib/brand";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // Bytt %BRAND% → APP_NAME ved innlasting, så navnet bare står ett sted.
    messages: applyBrand((await import(`../../messages/${locale}.json`)).default),
  };
});
