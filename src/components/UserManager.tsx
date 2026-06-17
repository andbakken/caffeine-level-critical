"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { DepartmentFilter, type DeptItem } from "@/components/DepartmentFilter";

export type AdminUser = {
  id: number;
  nickname: string;
  departmentId: number;
  departmentName: string;
  departmentColor: string;
  avatarPath: string | null;
  isActive: boolean;
  isAdmin: boolean;
  cupCount: number;
};

// Id-er i en avdelings subtre (inkl. seg selv) — for filtrering på morsavdeling.
function descendantIds(rootId: number, depts: DeptItem[]): Set<number> {
  const byParent = new Map<number | null, number[]>();
  for (const d of depts) {
    const arr = byParent.get(d.parentId) ?? [];
    arr.push(d.id);
    byParent.set(d.parentId, arr);
  }
  const set = new Set<number>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    set.add(id);
    for (const c of byParent.get(id) ?? []) stack.push(c);
  }
  return set;
}

export function UserManager({
  users,
  deptTree,
  currentUserId,
}: {
  users: AdminUser[];
  deptTree: DeptItem[];
  currentUserId: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<number | null>(null);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function flash(error: string | null, message: string | null = null) {
    setErr(error);
    setMsg(message);
    setTimeout(() => {
      setErr(null);
      setMsg(null);
    }, 3000);
  }

  async function patchUser(id: number, payload: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        flash(data.error ?? "Noe gikk galt");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      flash("Nettverksfeil");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const subtree = deptFilter ? descendantIds(deptFilter, deptTree) : null;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.nickname.toLowerCase().includes(q)) return false;
      if (subtree && !subtree.has(u.departmentId)) return false;
      if (status === "active" && !u.isActive) return false;
      if (status === "inactive" && u.isActive) return false;
      return true;
    });
  }, [users, search, subtree, status]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="heading text-accent-2 text-base">Brukere</h2>

      {(err || msg) && (
        <div className={`pixel-panel px-4 py-2 text-base ${err ? "text-danger" : "text-accent-2"}`}>
          {err ? `⚠ ${err}` : `✔ ${msg}`}
        </div>
      )}

      {/* Søk + filtre */}
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 flex-1 min-w-[12rem]">
          <span className="text-ink-dim text-base">Søk</span>
          <input
            className="pixel-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kallenavn…"
          />
        </label>
        <DepartmentFilter tree={deptTree} value={deptFilter} onChange={setDeptFilter} />
        <label className="flex flex-col gap-1">
          <span className="text-ink-dim text-base">Status</span>
          <select
            className="pixel-input !py-2 !px-3"
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | "active" | "inactive")}
          >
            <option value="active">Aktive</option>
            <option value="inactive">Inaktive</option>
            <option value="all">Alle</option>
          </select>
        </label>
      </div>

      <p className="text-ink-dim text-sm">
        {filtered.length} av {users.length} brukere
      </p>

      {filtered.length === 0 ? (
        <p className="text-ink-dim text-base">Ingen brukere matcher.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <div key={u.id} className="pixel-panel p-3 flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Avatar
                    avatarPath={u.avatarPath}
                    nickname={u.nickname}
                    color={u.departmentColor}
                    size={40}
                  />
                  <div className="flex-1 min-w-[8rem]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gold">{u.nickname}</span>
                      {u.isAdmin && (
                        <span className="font-display text-[0.55rem] px-1.5 py-0.5 bg-gold text-bg">
                          ADMIN
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="font-display text-[0.55rem] px-1.5 py-0.5 bg-danger text-bg">
                          INAKTIV
                        </span>
                      )}
                    </div>
                    <div className="text-ink-dim text-sm">
                      {u.departmentName} · {u.cupCount} kopper
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="pixel-btn pixel-btn-ghost !py-2 !px-3"
                      onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                      disabled={busy}
                    >
                      {editingId === u.id ? "Lukk" : "Rediger"}
                    </button>
                    <button
                      className="pixel-btn pixel-btn-ghost !py-2 !px-3"
                      onClick={() => patchUser(u.id, { isAdmin: !u.isAdmin })}
                      disabled={busy || isSelf}
                      title={isSelf ? "Du kan ikke endre din egen admin-status" : undefined}
                    >
                      {u.isAdmin ? "Fjern admin" : "Gjør til admin"}
                    </button>
                    <button
                      className={`pixel-btn !py-2 !px-3 ${u.isActive ? "pixel-btn-danger" : ""}`}
                      onClick={() => {
                        if (u.isActive && !confirm(`Deaktivere ${u.nickname}? De kan ikke logge inn før de reaktiveres.`)) return;
                        patchUser(u.id, { isActive: !u.isActive });
                      }}
                      disabled={busy || isSelf}
                      title={isSelf ? "Du kan ikke deaktivere deg selv" : undefined}
                    >
                      {u.isActive ? "Deaktiver" : "Aktiver"}
                    </button>
                  </div>
                </div>

                {editingId === u.id && (
                  <UserEditor
                    user={u}
                    deptTree={deptTree}
                    busy={busy}
                    onSave={async (payload) => {
                      const ok = await patchUser(u.id, payload);
                      if (ok) {
                        setEditingId(null);
                        flash(null, "Bruker oppdatert");
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function UserEditor({
  user,
  deptTree,
  busy,
  onSave,
}: {
  user: AdminUser;
  deptTree: DeptItem[];
  busy: boolean;
  onSave: (payload: Record<string, unknown>) => void;
}) {
  const [nickname, setNickname] = useState(user.nickname);
  const [departmentId, setDepartmentId] = useState(user.departmentId);
  const [pin, setPin] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    if (nickname.trim() && nickname.trim() !== user.nickname) payload.nickname = nickname.trim();
    if (departmentId !== user.departmentId) payload.departmentId = departmentId;
    if (pin.trim()) payload.pin = pin.trim();
    if (Object.keys(payload).length === 0) return;
    onSave(payload);
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end border-t border-line pt-3">
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-sm">Kallenavn</span>
        <input
          className="pixel-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-sm">Avdeling</span>
        <select
          className="pixel-input"
          value={departmentId}
          onChange={(e) => setDepartmentId(Number(e.target.value))}
        >
          {deptTree.map((d) => (
            <option key={d.id} value={d.id}>
              {"  ".repeat(d.depth)}
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink-dim text-sm">Nullstill PIN (4–8 sifre)</span>
        <input
          className="pixel-input"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="La stå tom for å beholde"
        />
      </label>
      <button className="pixel-btn" disabled={busy}>
        Lagre
      </button>
    </form>
  );
}
