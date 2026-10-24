import { getAyahAudioUrl } from "@/lib/quran-api";

interface AudioRouteContext {
  params: Promise<{ number: string }>;
}

export async function GET(_request: Request, context: AudioRouteContext) {
  const { number: rawNumber } = await context.params;
  const number = Number(rawNumber);

  if (!Number.isInteger(number) || number < 1) {
    return Response.json({ error: "Nomor ayat tidak valid." }, { status: 400 });
  }

  try {
    const url = await getAyahAudioUrl(number);
    return Response.json({ url }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } });
  } catch {
    return Response.json({ error: "Audio belum tersedia." }, { status: 502 });
  }
}
