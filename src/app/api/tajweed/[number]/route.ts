import { NextResponse } from "next/server";

type TajweedVerse = {
  id: number;
  verse_key: string;
  text_uthmani_tajweed: string;
};

type TajweedResponse = { verses?: TajweedVerse[] };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number: rawNumber } = await params;
  const number = Number(rawNumber);
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    return NextResponse.json({ error: "Nomor surah tidak valid." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${number}`,
      { next: { revalidate: 86400 }, headers: { Accept: "application/json" } },
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Data tajwid tidak tersedia." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const payload = (await response.json()) as TajweedResponse;
    const verses = Array.isArray(payload.verses)
      ? payload.verses.filter(
          (verse) => typeof verse.verse_key === "string" &&
            typeof verse.text_uthmani_tajweed === "string",
        )
      : [];

    return NextResponse.json(
      { verses },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Layanan tajwid sementara tidak dapat dihubungi." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
