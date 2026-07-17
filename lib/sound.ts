// lib/sound.ts
//
// Effets sonores synthétisés via Web Audio API — pas de fichiers audio à
// héberger ni charger, juste quelques oscillateurs joués à la volée.

import { useSyncExternalStore } from "react";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") {
    return null;
  }
  if (!audioContext) audioContext = new AudioContext();
  // Les navigateurs démarrent le contexte audio suspendu tant qu'aucun
  // geste utilisateur n'a eu lieu ; un clic sur la carte suffit à le
  // débloquer, mais il faut explicitement le relancer une fois créé.
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

type Note = {
  freq: number;
  start: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
};

function playNotes(notes: Note[]): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  notes.forEach(({ freq, start, duration, gain = 0.18, type = "sine" }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    const t0 = now + start;
    const t1 = t0 + duration;
    // Fondu rapide en entrée (évite un "clic" à l'attaque) puis
    // exponentiel en sortie (décroissance naturelle plutôt qu'une coupure
    // nette).
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  });
}

// Deux notes montantes, brèves et claires.
export function playFoundSound(): void {
  playNotes([
    { freq: 880, start: 0, duration: 0.09 },
    { freq: 1318.5, start: 0.07, duration: 0.16 },
  ]);
}

// Deux notes descendantes en onde carrée, plus sourdes.
export function playErrorSound(): void {
  playNotes([
    { freq: 180, start: 0, duration: 0.14, gain: 0.11, type: "square" },
    { freq: 120, start: 0.09, duration: 0.18, gain: 0.1, type: "square" },
  ]);
}

// Petit arpège final.
export function playGameOverSound(): void {
  playNotes([
    { freq: 523.25, start: 0, duration: 0.14 },
    { freq: 659.25, start: 0.12, duration: 0.14 },
    { freq: 783.99, start: 0.24, duration: 0.14 },
    { freq: 1046.5, start: 0.36, duration: 0.34 },
  ]);
}

// --- Préférence son activé/désactivé, persistée en localStorage comme le
// thème (cf. lib/theme.ts) pour survivre à une navigation entre pages. ---

const SOUND_STORAGE_KEY = "geoclic-sound";
const listeners = new Set<() => void>();

function loadSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
}

export function isSoundEnabled(): boolean {
  return loadSoundEnabled();
}

export function saveSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
  listeners.forEach((listener) => listener());
}

function subscribeSoundEnabled(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribeSoundEnabled, loadSoundEnabled, () => true);
}
