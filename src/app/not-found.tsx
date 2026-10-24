import Link from "next/link";

export default function NotFound() {
  return (
    <section className="content-container state-panel page-error">
      <p className="eyebrow">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <p>Nomor surah atau halaman yang diminta tidak tersedia.</p>
      <Link href="/" className="button-primary">Kembali ke daftar surah</Link>
    </section>
  );
}
