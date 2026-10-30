import type { Metadata } from "next";
import { GusAiPage } from "@/components/gus-ai-page";

export const metadata: Metadata = {
  title: "Gus AI — Ruang Percakapan",
  description: "Ruang percakapan Gus AI untuk eksplorasi Al-Qur'an dengan bantuan AI dan pencarian ayat.",
};

export default function GusAiRoute() {
  return <GusAiPage />;
}
