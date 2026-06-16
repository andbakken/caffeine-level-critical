// Forhåndsvalgte profilbilder. Filene ligger i public/avatars/preset/ og serveres
// direkte som statiske ressurser (/avatars/preset/<navn>.png).
//
// avatarPath på User lagres som "preset:<navn>" for et forhåndsvalgt bilde, mens
// egne opplastinger lagres som rent filnavn (serveres via /api/avatar/<fil>).
// Se Avatar-komponenten for hvordan de to skilles.

export const PRESET_PREFIX = "preset:";

// 42 ferdige avatarer (30 fra det store rutenettet + 12 fra det mindre).
export const PRESET_AVATARS: string[] = Array.from(
  { length: 42 },
  (_, i) => `preset-${String(i + 1).padStart(2, "0")}`,
);

const PRESET_SET = new Set(PRESET_AVATARS);

/** Sjekker om en avatar-nøkkel er et gyldig forhåndsvalgt bilde. */
export function isValidPreset(name: string): boolean {
  return PRESET_SET.has(name);
}

/** Public-URL for et forhåndsvalgt bilde. */
export function presetUrl(name: string): string {
  return `/avatars/preset/${name}.png`;
}

/** Om en lagret avatarPath peker på et forhåndsvalgt bilde. */
export function isPresetPath(avatarPath: string): boolean {
  return avatarPath.startsWith(PRESET_PREFIX);
}

/** Henter preset-navnet ut av en lagret avatarPath ("preset:foo" → "foo"). */
export function presetNameFromPath(avatarPath: string): string {
  return avatarPath.slice(PRESET_PREFIX.length);
}
