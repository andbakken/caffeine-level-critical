"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AchievementManager, type AdminAchievement } from "@/components/AchievementManager";
import { copyToClipboard } from "@/lib/clipboard";

type Department = { id: number; name: string; color: string; userCount: number };
type Station = {
  id: number;
  name: string;
  location: string | null;
  color: string;
  tagCount: number;
  consumptionCount: number;
};
type DrinkOpt = { id: number; displayName: string; icon: string };
type Tag = {
  id: number;
  token: string;
  label: string | null;
  stationName: string;
  drink: { icon: string; displayName: string } | null;
  scanCount: number;
};

export function AdminClient({
  departments,
  stations,
  drinks,
  tags,
  achievements,
}: {
  departments: Department[];
  stations: Station[];
  drinks: DrinkOpt[];
  tags: Tag[];
  achievements: AdminAchievement[];
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // department form
  const [deptName, setDeptName] = useState("");
  const [deptColor, setDeptColor] = useState("#7c5cff");

  // station form
  const [stationName, setStationName] = useState("");
  const [stationLoc, setStationLoc] = useState("");

  // tag form
  const [tagStation, setTagStation] = useState<number | "">(stations[0]?.id ?? "");
  const [tagDrink, setTagDrink] = useState<number | "">("");
  const [tagLabel, setTagLabel] = useState("");

  const [copied, setCopied] = useState<number | null>(null);

  // Base-URL for brikke-lenker. Brikkene må peke på en adresse mobilene kan nå
  // (maskinens nettverks-/Tailscale-adresse), IKKE localhost. Kan overstyres med
  // NEXT_PUBLIC_TAG_BASE_URL; ellers brukes adressen admin er åpnet på.
  const [tagBase, setTagBase] = useState("");
  useEffect(() => {
    setTagBase(process.env.NEXT_PUBLIC_TAG_BASE_URL || window.location.origin);
  }, []);
  const baseIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(tagBase);

  function flash(error: string | null, message: string | null = null) {
    setErr(error);
    setMsg(message);
    setTimeout(() => {
      setErr(null);
      setMsg(null);
    }, 3000);
  }

  async function post(url: string, payload: unknown): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Noe gikk galt");
        return false;
      }
      return true;
    } catch {
      flash("Nettverksfeil");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addDepartment(e: React.FormEvent) {
    e.preventDefault();
    if (!deptName.trim()) return;
    if (await post("/api/admin/departments", { name: deptName, color: deptColor })) {
      setDeptName("");
      flash(null, "Avdeling opprettet!");
      router.refresh();
    }
  }

  async function addStation(e: React.FormEvent) {
    e.preventDefault();
    if (!stationName.trim()) return;
    if (await post("/api/admin/stations", { name: stationName, location: stationLoc })) {
      setStationName("");
      setStationLoc("");
      flash(null, "Stasjon opprettet!");
      router.refresh();
    }
  }

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!tagStation) {
      flash("Velg stasjon");
      return;
    }
    const ok = await post("/api/admin/tags", {
      stationId: tagStation,
      drinkId: tagDrink || null,
      label: tagLabel,
    });
    if (ok) {
      setTagLabel("");
      setTagDrink("");
      flash(null, "Tagg opprettet!");
      router.refresh();
    }
  }

  async function deleteTag(id: number) {
    if (!confirm("Slette denne taggen? Historikk beholdes.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Sletting feilet");
        return;
      }
      flash(null, "Tagg slettet");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(tag: Tag) {
    const url = `${tagBase || window.location.origin}/t/${tag.token}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(tag.id);
      setTimeout(() => setCopied(null), 1500);
    } else {
      // Siste utvei (f.eks. streng mobilnettleser): vis lenken så den kan
      // merkes og kopieres manuelt.
      window.prompt("Kopier lenken til brikken:", url);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="heading text-gold text-xl">⚙ Admin</h1>

      {(err || msg) && (
        <div
          className={`pixel-panel px-4 py-2 text-base ${err ? "text-danger" : "text-accent-2"}`}
        >
          {err ? `⚠ ${err}` : `✔ ${msg}`}
        </div>
      )}

      {/* ---- Merker ---- */}
      <AchievementManager achievements={achievements} drinks={drinks} />

      {/* ---- NFC-tagger ---- */}
      <section className="flex flex-col gap-4">
        <h2 className="heading text-accent-2 text-base">NFC-tagger</h2>

        <form onSubmit={addTag} className="pixel-panel p-4 flex flex-col gap-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Stasjon</span>
              <select
                className="pixel-input"
                value={tagStation}
                onChange={(e) => setTagStation(e.target.value ? Number(e.target.value) : "")}
              >
                {stations.length === 0 && <option value="">Lag en stasjon først</option>}
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Drikke (valgfritt)</span>
              <select
                className="pixel-input"
                value={tagDrink}
                onChange={(e) => setTagDrink(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Spør ved skann</option>
                {drinks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Etikett (valgfritt)</span>
              <input
                className="pixel-input"
                value={tagLabel}
                onChange={(e) => setTagLabel(e.target.value)}
                placeholder="f.eks. Kjøkken-kran"
              />
            </label>
          </div>
          <div>
            <button className="pixel-btn" disabled={busy || stations.length === 0}>
              Lag tagg
            </button>
          </div>
          <p className="text-ink-dim text-sm">
            Med fast drikke logges ett tapp direkte ved skann. Uten drikke får brukeren en
            velger.
          </p>
        </form>

        {baseIsLocal && (
          <div className="pixel-panel px-4 py-3 text-base text-danger" style={{ borderColor: "var(--color-danger)" }}>
            ⚠ Du er på <span className="font-display">localhost</span>. Brikke-lenkene under
            blir da uleselige for mobiler (de prøver å nå seg selv → uendelig lasting).
            Åpne admin via maskinens nettverksadresse — f.eks.{" "}
            <span className="font-display">http://192.0.2.3:3000/admin</span> — og kopier
            lenken på nytt. (Eller sett <span className="font-display">NEXT_PUBLIC_TAG_BASE_URL</span>.)
          </div>
        )}

        {tags.length === 0 ? (
          <p className="text-ink-dim text-base">Ingen tagger ennå.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tags.map((t) => (
              <div
                key={t.id}
                className="pixel-panel p-3 flex items-center gap-3 flex-wrap"
              >
                <span className="text-2xl">{t.drink?.icon ?? "❓"}</span>
                <div className="flex-1 min-w-[8rem]">
                  <div className="text-base">
                    {t.stationName}
                    {t.label ? ` · ${t.label}` : ""}
                  </div>
                  <div className="text-ink-dim text-sm font-display">
                    {t.drink?.displayName ?? "velger"} · {t.scanCount} skann
                  </div>
                  <div className="text-accent-2 text-sm font-display break-all select-all mt-1">
                    {tagBase}/t/{t.token}
                  </div>
                </div>
                <button
                  className="pixel-btn pixel-btn-ghost !py-2 !px-3"
                  onClick={() => copyLink(t)}
                >
                  {copied === t.id ? "Kopiert!" : "Kopier lenke"}
                </button>
                <button
                  className="pixel-btn pixel-btn-danger !py-2 !px-3"
                  onClick={() => deleteTag(t.id)}
                  disabled={busy}
                >
                  Slett
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Stasjoner ---- */}
      <section className="flex flex-col gap-4">
        <h2 className="heading text-accent-2 text-base">Stasjoner</h2>

        <form onSubmit={addStation} className="pixel-panel p-4 flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Navn</span>
              <input
                className="pixel-input"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="f.eks. Kaffemaskin 2. etg"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Plassering (valgfritt)</span>
              <input
                className="pixel-input"
                value={stationLoc}
                onChange={(e) => setStationLoc(e.target.value)}
                placeholder="f.eks. ved heisen"
              />
            </label>
          </div>
          <div>
            <button className="pixel-btn" disabled={busy}>
              Lag stasjon
            </button>
          </div>
        </form>

        {stations.length === 0 ? (
          <p className="text-ink-dim text-base">Ingen stasjoner ennå.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {stations.map((s) => (
              <div key={s.id} className="pixel-panel p-3">
                <div className="text-base">{s.name}</div>
                <div className="text-ink-dim text-sm">
                  {s.location ? `${s.location} · ` : ""}
                  {s.tagCount} tagger · {s.consumptionCount} forbruk
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Avdelinger ---- */}
      <section className="flex flex-col gap-4">
        <h2 className="heading text-accent-2 text-base">Avdelinger</h2>

        <form onSubmit={addDepartment} className="pixel-panel p-4 flex flex-col gap-3">
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Navn</span>
              <input
                className="pixel-input"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="f.eks. Drift"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-dim text-base">Farge</span>
              <input
                type="color"
                className="pixel-input !p-1 h-[3.2rem] w-20"
                value={deptColor}
                onChange={(e) => setDeptColor(e.target.value)}
              />
            </label>
          </div>
          <div>
            <button className="pixel-btn" disabled={busy}>
              Lag avdeling
            </button>
          </div>
        </form>

        {departments.length === 0 ? (
          <p className="text-ink-dim text-base">Ingen avdelinger ennå.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <div
                key={d.id}
                className="pixel-panel px-3 py-2 flex items-center gap-2"
                style={{ borderColor: d.color }}
              >
                <span
                  className="inline-block w-4 h-4"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                />
                <span className="text-base">{d.name}</span>
                <span className="text-ink-dim text-sm">{d.userCount}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
