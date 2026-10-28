import type { Metadata } from "next";
import { GusAiPage } from "@/components/gus-ai-page";

export const metadata: Metadata = {
  title: "Gus AI — Ruang Percakapan",
  description: "Ruang percakapan pratinjau Gus AI untuk eksplorasi Al-Qur'an.",
};

export default function GusAiRoute() {
  return <GusAiPage />;
}
