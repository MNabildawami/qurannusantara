import type { Metadata } from "next";
import { SurahBrowser } from "@/components/surah-browser";
import { getSurahs } from "@/lib/quran-api";

export const metadata: Metadata = {
  title: "Daftar Surah",
  description: "Jelajahi daftar surah dan mulai membaca Al-Qur'an.",
};

export default async function HomePage() {
  try {
    const surahs = await getSurahs();
    return <SurahBrowser surahs={surahs} loadError={false} />;
  } catch {
    return <SurahBrowser surahs={[]} loadError />;
  }
}
