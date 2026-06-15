import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b-[3px] border-line bg-bg-2/80 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <Link href="/" className="heading text-gold text-lg sm:text-xl">
          ☕ BrewQuest
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 text-base sm:text-lg">
          <Link href="/leaderboard" className="hover:text-accent-2">
            Toppliste
          </Link>
          <Link href="/stats" className="hover:text-accent-2">
            Statistikk
          </Link>
          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin" className="hover:text-gold">
                  Admin
                </Link>
              )}
              <Link
                href="/me"
                className="text-accent-2 hover:brightness-125 flex items-center gap-2"
              >
                <span aria-hidden>🎮</span>
                {user.nickname}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent-2">
                Logg inn
              </Link>
              <Link href="/register" className="pixel-btn !py-2 !px-3">
                Bli med
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
