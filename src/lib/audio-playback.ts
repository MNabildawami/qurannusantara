export type AudioMode = "single" | "surah" | null;
export type AudioStatus =
  | "loading"
  | "playing"
  | "paused"
  | "stopped";

export interface AudioPlaybackState {
  sessionId: number;
  mode: AudioMode;
  status: AudioStatus;
  audio: HTMLAudioElement | null;
  globalAyahNumber: number | null;
  surahNumber: number | null;
  localAyahNumber: number | null;
  totalAyahs: number;
}

const initialState: AudioPlaybackState = {
  sessionId: 0,
  mode: null,
  status: "stopped",
  audio: null,
  globalAyahNumber: null,
  surahNumber: null,
  localAyahNumber: null,
  totalAyahs: 0,
};

let state: AudioPlaybackState = { ...initialState };

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeAudioPlayback(
  listener: () => void,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAudioPlaybackState(): AudioPlaybackState {
  return state;
}

export function beginAudioSession(
  mode: Exclude<AudioMode, null>,
  details: {
    surahNumber: number;
    localAyahNumber: number;
    globalAyahNumber: number;
    totalAyahs: number;
  },
): number {
  const previousAudio = state.audio;
  const sessionId = state.sessionId + 1;

  // Lepaskan audio lama sebelum memulai sesi baru.
  state = {
    sessionId,
    mode,
    status: "loading",
    audio: null,
    ...details,
  };

  previousAudio?.pause();
  notify();

  return sessionId;
}

export function isAudioSessionCurrent(
  sessionId: number,
): boolean {
  return state.sessionId === sessionId;
}

export function updateAudioPlayback(
  sessionId: number,
  updates: Partial<AudioPlaybackState>,
): boolean {
  if (!isAudioSessionCurrent(sessionId)) {
    return false;
  }

  state = {
    ...state,
    ...updates,
    sessionId,
  };

  notify();
  return true;
}

export function setActiveAudio(
  audio: HTMLAudioElement,
  sessionId: number,
  details: {
    globalAyahNumber: number;
    surahNumber: number;
    localAyahNumber: number;
    totalAyahs: number;
  },
): boolean {
  if (!isAudioSessionCurrent(sessionId)) {
    audio.pause();
    return false;
  }

  state = {
    ...state,
    ...details,
    audio,
    status: "loading",
  };

  notify();

  return true;
}

export function pauseActiveAudio(): void {
  if (!state.audio || state.status !== "playing") {
    return;
  }

  const audio = state.audio;

  // Ubah status terlebih dahulu agar UI langsung merespons.
  state = {
    ...state,
    status: "paused",
  };

  audio.pause();
  notify();
}

export async function resumeActiveAudio(): Promise<void> {
  const audio = state.audio;

  if (!audio || state.status !== "paused") {
    return;
  }

  const sessionId = state.sessionId;

  try {
    await audio.play();

    if (
      !isAudioSessionCurrent(sessionId) ||
      state.audio !== audio
    ) {
      audio.pause();
      return;
    }

    state = {
      ...state,
      status: "playing",
    };

    notify();
  } catch {
    if (isAudioSessionCurrent(sessionId)) {
      state = {
        ...state,
        status: "paused",
      };

      notify();
    }

    throw new Error("Audio gagal dilanjutkan.");
  }
}

export function finishAudioSession(
  sessionId: number,
): void {
  if (!isAudioSessionCurrent(sessionId)) {
    return;
  }

  const audio = state.audio;

  state = {
    ...initialState,
    sessionId: sessionId + 1,
  };

  audio?.pause();
  notify();
}

export function stopAudioPlayback(): void {
  const audio = state.audio;
  const nextSessionId = state.sessionId + 1;

  state = {
    ...initialState,
    sessionId: nextSessionId,
  };

  audio?.pause();
  notify();
}

export async function fetchAyahAudioUrl(
  ayahNumber: number,
): Promise<string> {
  const response = await fetch(`/api/audio/${ayahNumber}`);

  if (!response.ok) {
    throw new Error("Audio tidak tersedia.");
  }

  const payload = (await response.json()) as {
    url?: string;
  };

  if (!payload.url) {
    throw new Error("Sumber audio tidak ditemukan.");
  }

  return payload.url;
}