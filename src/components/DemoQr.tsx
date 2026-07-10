"use client";

import { QRCodeSVG } from "qrcode.react";

// QR-koden i demo-seksjonen: peker på demo-instansens faste brikke-lenke.
// Egen klientkomponent kun fordi qrcode.react rendres på klienten.
export function DemoQr({ url }: { url: string }) {
  return (
    <div className="bg-white p-3 border-[3px] border-line inline-block">
      <QRCodeSVG value={url} size={168} marginSize={0} />
    </div>
  );
}
