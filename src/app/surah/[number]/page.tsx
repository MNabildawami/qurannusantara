import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuranReader } from "@/components/quran-reader";
import { getSurahContent } from "@/lib/quran-api";

interface SurahPageProps {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
  const { number: rawNumber } = await params;
  const number = Number(rawNumber);
  if (!Number.isInteger(number) || number < 1 || number > 114) return { title: "Surah" };
  return { title: `Surah ${number}`, description: `Baca ayat dan terjemahan surah nomor ${number}.` };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { number: rawNumber } = await params;
  const number = Number(rawNumber);
  if (!Number.isInteger(number) || number < 1 || number > 114) notFound();

  const content = await getSurahContent(number);
  return <QuranReader content={content} />;
}
