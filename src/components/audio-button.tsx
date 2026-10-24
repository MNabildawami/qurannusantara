"use client";

import { LoaderCircle, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import {
  beginAudioSession,
  fetchAyahAudioUrl,
  finishAudioSession,
  getAudioPlaybackState,
  isAudioSessionCurrent,
  pauseActiveAudio,
  resumeActiveAudio,
  setActiveAudio,
  subscribeAudioPlayback,
  updateAudioPlayback,
} from "@/lib/audio-playback";

export function AudioButton({
  ayahNumber,
}: {
  ayahNumber: number;
}) {
  const [playback, setPlayback] = useState(
    getAudioPlaybackState,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setPlayback(getAudioPlaybackState());
    };

    sync();

    return subscribeAudioPlayback(sync);
  }, []);

  const isThisAyah =
    playback.globalAyahNumber === ayahNumber &&
    playback.mode !== null;

  const isPlaying = isThisAyah && playback.status === "playing";

  const isLoading =
    loading ||
    (isThisAyah && playback.status === "loading");

  async function handleClick() {
    setError(null);

    const current = getAudioPlaybackState();

    // Jika ayat ini sedang dimainkan, jeda audio yang sama.
    if (
      current.globalAyahNumber === ayahNumber &&
      current.audio &&
      current.status === "playing"
    ) {
      pauseActiveAudio();
      return;
    }

    // Lanjutkan audio yang sedang dijeda.
    if (
      current.globalAyahNumber === ayahNumber &&
      current.audio &&
      current.status === "paused"
    ) {
      try {
        await resumeActiveAudio();
      } catch {
        setError("Audio gagal dilanjutkan.");
      }

      return;
    }

    const sessionId = beginAudioSession("single", {
      globalAyahNumber: ayahNumber,
      surahNumber: 0,
      localAyahNumber: 0,
      totalAyahs: 0,
    });

    setLoading(true);

    try {
      const url = await fetchAyahAudioUrl(ayahNumber);

      if (!isAudioSessionCurrent(sessionId)) {
        return;
      }

      const audio = new Audio(url);

      const registered = setActiveAudio(audio, sessionId, {
        globalAyahNumber: ayahNumber,
        surahNumber: 0,
        localAyahNumber: 0,
        totalAyahs: 0,
      });

      if (!registered) {
        return;
      }

      audio.addEventListener(
        "ended",
        () => {
          finishAudioSession(sessionId);
        },
        { once: true },
      );

      audio.addEventListener(
        "error",
        () => {
          if (isAudioSessionCurrent(sessionId)) {
            finishAudioSession(sessionId);
            setError("Audio gagal dimuat.");
          }
        },
        { once: true },
      );

      await audio.play();

      if (isAudioSessionCurrent(sessionId)) {
        updateAudioPlayback(sessionId, {
          status: "playing",
        });
      }
    } catch {
      if (isAudioSessionCurrent(sessionId)) {
        finishAudioSession(sessionId);
        setError("Audio gagal diputar. Coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="audio-control-wrap">
      <button
        type="button"
        className="verse-action"
        onClick={() => void handleClick()}
        disabled={isLoading}
        aria-label={
          isPlaying
            ? "Jeda audio ayat"
            : "Putar audio ayat"
        }
        title={
          isPlaying
            ? "Jeda audio"
            : "Putar audio"
        }
      >
        {isLoading ? (
          <LoaderCircle size={16} className="spin" />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} />
        )}

        <span className="sr-only">
          {isPlaying ? "Jeda" : "Putar audio"}
        </span>
      </button>

      {error && (
        <span className="inline-error" role="status">
          {error}
        </span>
      )}
    </span>
  );
}