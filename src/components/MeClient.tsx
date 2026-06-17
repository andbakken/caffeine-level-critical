"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";
import { PRESET_AVATARS, PRESET_PREFIX, presetUrl } from "@/lib/avatars";

type Dept = { id: number; name: string };

export function MeClient({
  nickname,
  departmentId,
  avatarPath,
  departments,
  color,
}: {
  nickname: string;
  departmentId: number;
  avatarPath: string | null;
  departments: Dept[];
  color: string;
}) {
  const t = useTranslations("Me");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nick, setNick] = useState(nickname);
  const [dept, setDept] = useState(departmentId);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(avatarPath);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch("/api/me/avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setErr(data.error ?? t("uploadFailed"));
      return;
    }
    setAvatar(data.avatarPath);
    setMsg(t("photoUpdated"));
    setPickerOpen(false);
    router.refresh();
  }

  async function selectPreset(name: string) {
    setErr(null);
    const res = await fetch("/api/me/avatar/preset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset: name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setErr(data.error ?? t("uploadFailed"));
      return;
    }
    setAvatar(data.avatarPath);
    setMsg(t("photoUpdated"));
    setPickerOpen(false);
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (nick !== nickname) payload.nickname = nick;
      if (dept !== departmentId) payload.departmentId = dept;
      if (pin) payload.pin = pin;
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error ?? t("saveFailed"));
        return;
      }
      setMsg(t("saved"));
      setPin("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar avatarPath={avatar} nickname={nick} color={color} size={80} />
        <button
          type="button"
          className="pixel-btn pixel-btn-ghost !py-2"
          onClick={() => setPickerOpen(true)}
        >
          {t("changePhoto")}
        </button>
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={t("chooseAvatar")}>
        <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
          {PRESET_AVATARS.map((name) => {
            const selected = avatar === `${PRESET_PREFIX}${name}`;
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectPreset(name)}
                className={`pixel-border overflow-hidden aspect-square transition ${
                  selected ? "ring-2 ring-gold" : "opacity-80 hover:opacity-100"
                }`}
                title={t("chooseAvatar")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={presetUrl(name)}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 border-t border-line pt-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
          <button
            className="pixel-btn pixel-btn-ghost !py-2 self-start"
            onClick={() => fileRef.current?.click()}
          >
            {t("orUploadOwn")}
          </button>
          <span className="text-ink-dim text-sm">{t("photoHint")}</span>
        </div>
      </Modal>

      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("nickname")}</span>
          <input className="pixel-input" value={nick} onChange={(e) => setNick(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("department")}</span>
          <select
            className="pixel-input"
            value={dept}
            onChange={(e) => setDept(Number(e.target.value))}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">{t("newPin")}</span>
          <input
            className="pixel-input"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        {err && <p className="text-danger text-base">⚠ {err}</p>}
        {msg && <p className="text-accent-2 text-base">✔ {msg}</p>}
        <div className="flex gap-3 flex-wrap">
          <button className="pixel-btn" disabled={saving}>
            {saving ? "..." : t("save")}
          </button>
          <button type="button" className="pixel-btn pixel-btn-danger" onClick={logout}>
            {t("logout")}
          </button>
        </div>
      </form>
    </div>
  );
}
