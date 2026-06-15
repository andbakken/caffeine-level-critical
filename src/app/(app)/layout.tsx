import { Nav } from "@/components/Nav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-ink-dim text-base py-6 border-t-2 border-line">
        BrewQuest <span className="text-accent">●</span> laget for IT-avdelingen
      </footer>
    </>
  );
}
