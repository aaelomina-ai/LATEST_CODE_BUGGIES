import React, { useEffect, useRef, useState } from "react";
import { GearIcon, MusicNoteIcon, SpeakerIcon } from "./icons/UiIcons";
import { getSettings, setMusicVolume, setSfxVolume, subscribe } from "../services/audioService";
import "./SettingsOverlay.css";

// Mirrors audioService's own DEFAULTS — used only as a fallback volume
// to restore to if the player un-mutes without ever having a nonzero
// volume recorded yet (e.g. right after a fresh page load while muted).
const FALLBACK_MUSIC_VOLUME = 0.4;
const FALLBACK_SFX_VOLUME = 0.6;

/**
 * SettingsOverlay
 * ---------------
 * Rendered once at the App root (not per-screen), so the gear button
 * and its panel are available identically on every stage. Reads and
 * writes volumes through audioService's pub-sub API — no props needed.
 */
export default function SettingsOverlay() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());

  // Remembers the last nonzero volume for each channel, so clicking
  // "unmute" restores whatever it was before, not just some fixed value.
  const lastMusicVolume = useRef(settings.musicVolume > 0 ? settings.musicVolume : FALLBACK_MUSIC_VOLUME);
  const lastSfxVolume = useRef(settings.sfxVolume > 0 ? settings.sfxVolume : FALLBACK_SFX_VOLUME);

  useEffect(() => {
    const unsubscribe = subscribe((next) => {
      setSettings(next);
      if (next.musicVolume > 0) lastMusicVolume.current = next.musicVolume;
      if (next.sfxVolume > 0) lastSfxVolume.current = next.sfxVolume;
    });
    return unsubscribe;
  }, []);

  function toggleMusicMute() {
    if (settings.musicVolume > 0) {
      setMusicVolume(0);
    } else {
      setMusicVolume(lastMusicVolume.current || FALLBACK_MUSIC_VOLUME);
    }
  }

  function toggleSfxMute() {
    if (settings.sfxVolume > 0) {
      setSfxVolume(0);
    } else {
      setSfxVolume(lastSfxVolume.current || FALLBACK_SFX_VOLUME);
    }
  }

  return (
    <>
      <button type="button" className="scene__settings-btn" aria-label="Settings" onClick={() => setOpen(true)}>
        <GearIcon />
      </button>

      {open && (
        <div className="scene__overlay" role="dialog" aria-label="Settings">
          <div className="settings-panel">
            <h2 className="settings-panel__title">SETTINGS</h2>

            <div className="settings-row">
              <div className="settings-row__label">
                <button
                  type="button"
                  className="settings-icon-btn"
                  onClick={toggleMusicMute}
                  aria-label={settings.musicVolume > 0 ? "Mute background music" : "Unmute background music"}
                >
                  <MusicNoteIcon muted={settings.musicVolume <= 0} />
                </button>
                <span className="settings-row__label-text">BACKGROUND MUSIC</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.musicVolume * 100)}
                onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              />
            </div>

            <div className="settings-row">
              <div className="settings-row__label">
                <button
                  type="button"
                  className="settings-icon-btn"
                  onClick={toggleSfxMute}
                  aria-label={settings.sfxVolume > 0 ? "Mute sound effects" : "Unmute sound effects"}
                >
                  <SpeakerIcon muted={settings.sfxVolume <= 0} />
                </button>
                <span className="settings-row__label-text">SOUND FX</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.sfxVolume * 100)}
                onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
              />
            </div>

            <div className="settings-panel__divider" />

            <button type="button" className="settings-btn settings-btn--close" onClick={() => setOpen(false)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}