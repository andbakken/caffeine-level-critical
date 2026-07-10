// Standard-merkene — ÉN kilde, delt mellom prod-bootstrap (prisma/bootstrap.ts)
// og det offentlige merkegalleriet på markedssiden (/merker). Ren data uten
// DB-avhengigheter: drikke refereres med nøkkel og mappes til drinkId ved
// bootstrap. Admin kan endre/lage egne merker i appen; dette er startsettet.

export type AchievementDef = {
  key: string;
  name: string;
  description: string;
  icon: string;
  ruleType: string;
  threshold: number;
  /** Nøkkel i standard-drikkelisten (coffee/tea/…), null = alle drikker. */
  drinkKey: string | null;
  sortOrder: number;
};

export const DEFAULT_ACHIEVEMENTS: AchievementDef[] = [
  { key: "first-sip", name: "Første slurk", description: "Logg din aller første kopp", icon: "🥤", ruleType: "total", threshold: 1, drinkKey: null, sortOrder: 1 },
  { key: "ten-cups", name: "Tørst", description: "Logg 10 kopper totalt", icon: "☕", ruleType: "total", threshold: 10, drinkKey: null, sortOrder: 2 },
  { key: "fifty-cups", name: "Koffeinmisbruker", description: "Logg 50 kopper totalt", icon: "⚡", ruleType: "total", threshold: 50, drinkKey: null, sortOrder: 3 },
  { key: "hundred-cups", name: "Koppmester", description: "Logg 100 kopper totalt", icon: "👑", ruleType: "total", threshold: 100, drinkKey: null, sortOrder: 4 },
  { key: "early-bird", name: "Morgenfugl", description: "Logg en kopp før kl. 08", icon: "🌅", ruleType: "before_hour", threshold: 8, drinkKey: null, sortOrder: 5 },
  { key: "night-owl", name: "Nattugle", description: "Logg en kopp etter kl. 20", icon: "🦉", ruleType: "after_hour", threshold: 20, drinkKey: null, sortOrder: 6 },
  { key: "variety", name: "Allsidig", description: "Prøv 3 ulike drikketyper", icon: "🌈", ruleType: "distinct", threshold: 3, drinkKey: null, sortOrder: 7 },
  { key: "coffee-addict", name: "Kaffeholiker", description: "Logg 25 kaffe", icon: "🤎", ruleType: "drink", threshold: 25, drinkKey: "coffee", sortOrder: 8 },
  { key: "full-collection", name: "Komplett samling", description: "Logg minst 10 av hver drikke", icon: "🎯", ruleType: "drink_each", threshold: 10, drinkKey: null, sortOrder: 9 },
  { key: "streak-5", name: "Trofast", description: "Logg minst én kopp 5 dager på rad", icon: "🔥", ruleType: "streak", threshold: 5, drinkKey: null, sortOrder: 10 },
  { key: "marathon", name: "Maraton", description: "Logg 5 kopper på samme dag", icon: "🏃", ruleType: "day_total", threshold: 5, drinkKey: null, sortOrder: 11 },
  { key: "weekend-warrior", name: "Helgekriger", description: "Logg en kopp i helgen", icon: "🎉", ruleType: "weekend", threshold: 1, drinkKey: null, sortOrder: 12 },
  // --- Del A: flere data-merker (eksisterende regeltyper) ---
  { key: "total-250", name: "Overdose", description: "Logg 250 kopper totalt", icon: "💀", ruleType: "total", threshold: 250, drinkKey: null, sortOrder: 13 },
  { key: "total-500", name: "Koffein-legende", description: "Logg 500 kopper totalt", icon: "🏆", ruleType: "total", threshold: 500, drinkKey: null, sortOrder: 14 },
  { key: "total-1000", name: "Udødelig", description: "Logg 1000 kopper totalt", icon: "🌟", ruleType: "total", threshold: 1000, drinkKey: null, sortOrder: 15 },
  { key: "streak-3", name: "God start", description: "Logg minst én kopp 3 dager på rad", icon: "🌱", ruleType: "streak", threshold: 3, drinkKey: null, sortOrder: 16 },
  { key: "streak-10", name: "Jernvilje", description: "Logg minst én kopp 10 dager på rad", icon: "💪", ruleType: "streak", threshold: 10, drinkKey: null, sortOrder: 17 },
  { key: "streak-30", name: "Måned uten miss", description: "Logg minst én kopp 30 dager på rad", icon: "📅", ruleType: "streak", threshold: 30, drinkKey: null, sortOrder: 18 },
  { key: "day-3", name: "Trippel", description: "Logg 3 kopper på samme dag", icon: "🎰", ruleType: "day_total", threshold: 3, drinkKey: null, sortOrder: 19 },
  { key: "day-10", name: "Overdrivelse", description: "Logg 10 kopper på samme dag", icon: "🤯", ruleType: "day_total", threshold: 10, drinkKey: null, sortOrder: 20 },
  { key: "all-types", name: "Smaksmester", description: "Prøv alle 5 drikketyper", icon: "🎨", ruleType: "distinct", threshold: 5, drinkKey: null, sortOrder: 21 },
  { key: "tea-lover", name: "Tedronning", description: "Logg 25 te", icon: "🍵", ruleType: "drink", threshold: 25, drinkKey: "tea", sortOrder: 22 },
  { key: "cocoa-lover", name: "Kakaokonge", description: "Logg 25 kakao", icon: "🍫", ruleType: "drink", threshold: 25, drinkKey: "cocoa", sortOrder: 23 },
  { key: "hydrated", name: "Hydrert", description: "Logg 25 glass vann", icon: "🥛", ruleType: "drink", threshold: 25, drinkKey: "water_glass", sortOrder: 24 },
  { key: "super-early", name: "Grytidlig", description: "Logg en kopp før kl. 06", icon: "🐓", ruleType: "before_hour", threshold: 6, drinkKey: null, sortOrder: 25 },
  { key: "midnight", name: "Midnattstørst", description: "Logg en kopp kl. 23 eller senere", icon: "🌙", ruleType: "after_hour", threshold: 23, drinkKey: null, sortOrder: 26 },
  // --- Del B: nye regeltyper ---
  { key: "explorer", name: "Utforsker", description: "Besøk 3 ulike stasjoner", icon: "🗺️", ruleType: "distinct_station", threshold: 3, drinkKey: null, sortOrder: 27 },
  { key: "tag-master", name: "Brikkemester", description: "Skann 5 ulike brikker", icon: "📟", ruleType: "distinct_tag", threshold: 5, drinkKey: null, sortOrder: 28 },
  { key: "nfc-native", name: "NFC-innfødt", description: "Logg 50 kopper via brikke", icon: "📲", ruleType: "tag_total", threshold: 50, drinkKey: null, sortOrder: 29 },
  { key: "record-streak", name: "Rekordholder", description: "Ha en rekke på 14 dager på rad", icon: "🔥", ruleType: "longest_streak", threshold: 14, drinkKey: null, sortOrder: 30 },
  { key: "regular", name: "Stamgjest", description: "Logg på 30 ulike dager totalt", icon: "🪑", ruleType: "active_days", threshold: 30, drinkKey: null, sortOrder: 31 },
  { key: "round-the-clock", name: "Døgnvill", description: "Logg i 8 ulike klokketimer", icon: "🕛", ruleType: "hour_slots", threshold: 8, drinkKey: null, sortOrder: 32 },
  { key: "lunch-break", name: "Lunsjpause", description: "Logg en kopp kl. 12", icon: "🥪", ruleType: "at_hour", threshold: 12, drinkKey: null, sortOrder: 33 },
];
