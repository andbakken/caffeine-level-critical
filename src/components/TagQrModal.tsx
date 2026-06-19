"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "@/components/Modal";

// Viser en QR-kode for en brikke-lenke, med nedlasting (PNG) og utskrift.
// QR-en genereres lokalt i nettleseren (ingen ekstern tjeneste), så den virker
// også på den selvhostede/offline demoen.
export function TagQrModal({
  open,
  onClose,
  url,
  title,
  fileBase,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  // Filnavn uten suffiks, f.eks. "kjokken-kran". Reservenavn brukes om tomt.
  fileBase?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function canvas(): HTMLCanvasElement | null {
    return wrapRef.current?.querySelector("canvas") ?? null;
  }

  function safeName(): string {
    const base = (fileBase || "brikke").trim().toLowerCase();
    const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `qr-${slug || "brikke"}`;
  }

  function download() {
    const c = canvas();
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${safeName()}.png`;
    a.click();
  }

  function print() {
    const c = canvas();
    if (!c) return;
    const dataUrl = c.toDataURL("image/png");
    const w = window.open("", "_blank", "width=480,height=600");
    if (!w) return;
    w.document.write(
      `<!doctype html><title>${title ?? "QR"}</title>` +
        `<body style="margin:0;display:flex;flex-direction:column;align-items:center;` +
        `justify-content:center;height:100vh;font-family:sans-serif;text-align:center">` +
        (title ? `<h2 style="margin:0 0 16px">${title}</h2>` : "") +
        `<img src="${dataUrl}" style="width:320px;height:320px;image-rendering:pixelated" />` +
        `<p style="color:#666;font-size:12px;word-break:break-all;max-width:320px">${url}</p>` +
        `</body>`,
    );
    w.document.close();
    w.focus();
    // Gi bildet et øyeblikk til å rendre før utskriftsdialogen.
    w.onload = () => w.print();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        /* utskrift kan blokkeres; brukeren kan da skrive ut manuelt */
      }
    }, 250);
  }

  return (
    <Modal open={open} onClose={onClose} title={title ?? "QR-kode"}>
      <div className="flex flex-col items-center gap-4">
        <div ref={wrapRef} className="bg-white p-4 inline-block">
          <QRCodeCanvas value={url} size={256} level="M" marginSize={2} />
        </div>
        <div className="text-accent-2 text-sm font-display break-all select-all text-center">
          {url}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <button className="pixel-btn !py-2 !px-3" onClick={download}>
            Last ned PNG
          </button>
          <button className="pixel-btn pixel-btn-ghost !py-2 !px-3" onClick={print}>
            Skriv ut
          </button>
        </div>
        <p className="text-ink-dim text-sm text-center">
          Telefoner uten NFC kan skanne QR-koden med kameraet for å åpne brikken.
        </p>
      </div>
    </Modal>
  );
}
