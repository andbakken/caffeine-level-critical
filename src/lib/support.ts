// Support-adresse settes per instans via server-env SUPPORT_EMAIL — bevisst IKKE
// NEXT_PUBLIC_, så den leses i runtime (virker i Docker/compose) og slipper
// build-time-fellen NEXT_PUBLIC_* har. Tom verdi => ingen support-lenke vises.
export function getSupportEmail(): string | null {
  return process.env.SUPPORT_EMAIL?.trim() || null;
}
