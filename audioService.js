/**
 * audioService
 * ------------
 * A tiny module-level (not React-state) audio manager, so any
 * component can read/set volumes or trigger a sound without
 * prop-drilling through every screen.
 *
 * Three kinds of sound live here:
 *
 * 1. Background music — two real tracks, swapped automatically
 *    depending on what part of the game is showing:
 *      "ui"    -> S31-Undercover_Operative.ogg  (menus, lobby, hub)
 *      "match" -> S31-Let_the_Games_Begin.ogg   (the live quiz)
 *    App.jsx calls setActiveTrack() whenever `stage` changes; this
 *    file handles crossfading between whichever track was already
 *    playing and the new one. Both files must exist at:
 *      public/audio/S31-Undercover_Operative.ogg
 *      public/audio/S31-Let_the_Games_Begin.ogg
 *    (public/, not src/ — same rule as everything else served
 *    directly by Vite.)
 *
 * 2. Win/lose stingers — synthesized, not files, so there's nothing
 *    new to source or place. LeaderboardScreen calls one of these
 *    once, right when it learns whether you finished in first place.
 *
 * 3. Click sound — unchanged from before, synthesized on the fly.
 */

const STORAGE_KEY = "codeBuggies.audioSettings";
const DEFAULTS = { musicVolume: 0.4, sfxVolume: 0.6 };

const TRACKS = {
  ui: "/audio/theme.mp3",
  match: "/audio/theme.mp3",
};

const FADE_MS = 700;

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      musicVolume: typeof parsed.musicVolume === "number" ? parsed.musicVolume : DEFAULTS.musicVolume,
      sfxVolume: typeof parsed.sfxVolume === "number" ? parsed.sfxVolume : DEFAULTS.sfxVolume,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

const settings = loadSettings();
const listeners = new Set();

let audioCtx = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private browsing, etc.) — non-fatal,
    // the volumes just won't be remembered next visit.
  }
}

function notify() {
  listeners.forEach((fn) => fn({ ...settings }));
}

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/* ------------------------------------------------------------------ */
/* Background music: two real tracks, crossfaded on switch            */
/* ------------------------------------------------------------------ */

const trackElements = {}; // key -> <audio> element, created lazily
let unlocked = false; // becomes true on the first user gesture
let pendingTrackKey = "ui"; // whatever's requested before we're unlocked
let activeTrackKey = null;

function getTrackElement(key) {
  if (!trackElements[key]) {
    const el = new Audio(TRACKS[key]);
    el.loop = true;
    el.volume = 0;
    trackElements[key] = el;
  }
  return trackElements[key];
}

function fadeVolume(el, targetVolume, durationMs) {
  const startVolume = el.volume;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / durationMs);
    const value = startVolume + (targetVolume - startVolume) * t;
    el.volume = Math.min(1, Math.max(0, value));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function activateTrack(key) {
  if (!TRACKS[key] || activeTrackKey === key) return;
  const previousKey = activeTrackKey;
  activeTrackKey = key;

  const nextEl = getTrackElement(key);
  nextEl.currentTime = 0;
  nextEl.volume = 0;
  nextEl.play().catch(() => {
    // Autoplay blocked, or the file isn't at public/audio/ yet —
    // fail silently, the rest of the game keeps working either way.
  });
  fadeVolume(nextEl, settings.musicVolume, FADE_MS);

  if (previousKey && trackElements[previousKey]) {
    const prevEl = trackElements[previousKey];
    fadeVolume(prevEl, 0, FADE_MS);
    setTimeout(() => prevEl.pause(), FADE_MS + 60);
  }
}

/**
 * Which background track should be playing right now — "ui" or
 * "match". Safe to call anytime, including before the player has
 * interacted with the page yet; it just remembers the request until
 * startBackgroundMusicOnFirstClick() unlocks real playback.
 */
export function setActiveTrack(key) {
  if (!TRACKS[key]) return;
  pendingTrackKey = key;
  if (unlocked) activateTrack(key);
}

/**
 * Call once, on the very first user gesture anywhere in the app.
 * Required because browsers block audio from starting before that —
 * App.jsx wires this to the first pointerdown on the whole document.
 */
export function startBackgroundMusicOnFirstClick() {
  if (unlocked) return;
  unlocked = true;
  activateTrack(pendingTrackKey);
}

/* ------------------------------------------------------------------ */
/* Synthesized one-shots: click, victory, defeat                      */
/* ------------------------------------------------------------------ */

function scheduleTone(ctx, freq, startTime, duration, type, peakGain) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function scheduleBendingTone(ctx, freqStart, freqEnd, startTime, duration, type, peakGain) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Short synthesized "blip" for button clicks — no audio file needed. */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx || settings.sfxVolume <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.09);
  gain.gain.setValueAtTime(settings.sfxVolume * 0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

/** Bright ascending arpeggio — played once when you finish in first place. */
export function playVictorySound() {
  const ctx = getAudioContext();
  if (!ctx || settings.sfxVolume <= 0) return;
  const now = ctx.currentTime;
  const peak = settings.sfxVolume * 0.22;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    scheduleTone(ctx, freq, now + i * 0.11, 0.22, "square", peak);
  });
  scheduleTone(ctx, 1046.5, now + notes.length * 0.11 + 0.05, 0.35, "triangle", peak * 0.8);
}

/** Two descending, pitch-drooping notes — played once when you don't finish first. */
export function playDefeatSound() {
  const ctx = getAudioContext();
  if (!ctx || settings.sfxVolume <= 0) return;
  const now = ctx.currentTime;
  const peak = settings.sfxVolume * 0.22;
  scheduleBendingTone(ctx, 311.13, 264.46, now, 0.42, "sawtooth", peak); // Eb4 drooping
  scheduleBendingTone(ctx, 293.66, 249.61, now + 0.32, 0.5, "sawtooth", peak); // D4 drooping
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export function getSettings() {
  return { ...settings };
}

export function setMusicVolume(value) {
  settings.musicVolume = Math.min(1, Math.max(0, value));
  if (activeTrackKey && trackElements[activeTrackKey]) {
    trackElements[activeTrackKey].volume = settings.musicVolume;
  }
  persist();
  notify();
}

export function setSfxVolume(value) {
  settings.sfxVolume = Math.min(1, Math.max(0, value));
  persist();
  notify();
}

/** Subscribe to volume changes (used by SettingsOverlay's sliders). */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}