"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function AppNav({ nickname, isAdmin }: { nickname: string; isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  async function logout() {
    close();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links = (
    <>
      <Link href="/dashboard" className="hover:text-accent-2" onClick={close}>
        Dashbord
      </Link>
      <Link href="/leaderboard" className="hover:text-accent-2" onClick={close}>
        Toppliste
      </Link>
      <Link href="/stats" className="hover:text-accent-2" onClick={close}>
        Statistikk
      </Link>
      {isAdmin && (
        <Link href="/admin" className="hover:text-gold" onClick={close}>
          Admin
        </Link>
      )}
      <Link
        href="/me"
        className="text-accent-2 hover:brightness-125 flex items-center gap-2"
        onClick={close}
      >
        <span aria-hidden>🎮</span>
        {nickname}
      </Link>
      <button
        type="button"
        onClick={logout}
        className="text-ink-dim hover:text-danger text-left cursor-pointer"
      >
        Logg ut
      </button>
    </>
  );

  return (
    <header className="border-b-[3px] border-line bg-bg-2/80 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="heading text-gold text-base sm:text-xl truncate min-w-0" onClick={close}>
          ☕ Quest of the Roasted Bean
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 lg:gap-5 text-base lg:text-lg">
          {links}
          <LocaleSwitcher />
        </div>

        {/* Mobil: hamburger */}
        <button
          type="button"
          className="md:hidden pixel-btn !py-1 !px-3 shrink-0"
          aria-label="Meny"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t-2 border-line bg-bg-2 px-4 py-4 flex flex-col gap-4 text-lg">
          {links}
          <div className="pt-2 border-t border-line/50">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
