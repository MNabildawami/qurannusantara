import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuranReader } from "@/components/quran-reader";
import { getSurahContent } from "@/lib/quran-api";
import { getSurahDisplayName, getSurahNumberFromRoute, getSurahSlug } from "@/lib/surah-names";

interface SurahPageProps {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
  const { number: rawNumber } = await params;
  const number = getSurahNumberFromRoute(rawNumber);
  if (!number) return { title: "Surah" };
  const title = getSurahDisplayName(number, "", "id");
  return {
    title,
    description: "Baca ayat dan terjemahan Surah " + title + ".",
    alternates: { canonical: "/surah/" + getSurahSlug(number) },
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { number: rawNumber } = await params;
  const number = getSurahNumberFromRoute(rawNumber);
  if (!number) notFound();

  const content = await getSurahContent(number);
  return <QuranReader content={content} />;
}
