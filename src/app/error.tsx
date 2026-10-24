"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep error details in the development console; never render stack traces to users.
    console.error("QuranNusantara page error:", error);
  }, [error]);

  return (
    <section className="content-container state-panel page-error">
      <h1>Halaman belum dapat dimuat</h1>
      <p>Terjadi kendala ketika mengambil data. Coba kembali setelah beberapa saat.</p>
      <button type="button" className="button-secondary" onClick={() => reset()}><RotateCw size={15} /> Coba lagi</button>
    </section>
  );
}
