const API_BASE_URL = process.env.NEXT_PUBLIC_GUS_AI_API_URL?.replace(/\/+$/, "");

type GusAiApiResponse = {
  reply?: unknown;
  answer?: unknown;
  response?: unknown;
  detail?: unknown;
  error?: unknown;
  message?: unknown;
};

function readErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function sendGusAiMessage(message: string): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error("Alamat layanan Gus AI belum diatur. Periksa NEXT_PUBLIC_GUS_AI_API_URL di pengaturan deployment.");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 80_000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  messages: [{ role: "user", content: message }],
}),
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as GusAiApiResponse | null;

    if (!response.ok) {
      const detail =
        readErrorMessage(payload?.detail) ??
        readErrorMessage(payload?.error) ??
        readErrorMessage(payload?.message);
      throw new Error(detail ?? `Layanan Gus AI mengembalikan kesalahan (${response.status}).`);
    }

    const reply =
      readErrorMessage(payload?.reply) ??
      readErrorMessage(payload?.answer) ??
      readErrorMessage(payload?.response);

    if (!reply) {
      throw new Error("Layanan Gus AI belum mengirim jawaban dalam format yang dikenali.");
    }

    return reply;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Waktu tunggu habis. Coba kirim pertanyaan sekali lagi.");
    }
    if (error instanceof TypeError) {
      throw new Error("Tidak dapat terhubung ke layanan Gus AI. Periksa koneksi internet lalu coba lagi.");
    }
    throw error instanceof Error ? error : new Error("Terjadi kesalahan saat menghubungi Gus AI.");
  } finally {
    window.clearTimeout(timeout);
  }
}
