"use client";

import { useTranslations } from "next-intl";

export type DeptItem = {
  id: number;
  name: string;
  color: string;
  parentId: number | null;
  depth: number;
};

// Indentert nedtrekk for å velge avdeling. «Hele organisasjonen» = ingen filter (null).
// Persistens håndteres av eier-komponenten (localStorage), ikke her.
export function DepartmentFilter({
  tree,
  value,
  onChange,
}: {
  tree: DeptItem[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const t = useTranslations("Filter");
  if (tree.length === 0) return null;
  return (
    <label className="flex items-center gap-2 text-base">
      <span className="text-ink-dim">{t("department")}</span>
      <select
        className="pixel-input !py-2 !px-3"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">{t("wholeOrg")}</option>
        {tree.map((d) => (
          <option key={d.id} value={d.id}>
            {"  ".repeat(d.depth)}
            {d.name}
          </option>
        ))}
      </select>
    </label>
  );
}
