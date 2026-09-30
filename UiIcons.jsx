import React from "react";

export function BackArrow({ className = "", style = {}, onClick }) {
  return (
    <button type="button" className={className} style={style} onClick={onClick} aria-label="Go back">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="2" y="2" width="36" height="36" rx="8" fill="#241832" stroke="#39ff6a" strokeWidth="2.5" />
        <path d="M24 12 L14 20 L24 28" fill="none" stroke="#39ff6a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function StarRow({ className = "" }) {
  return (
    <div className={className} aria-hidden="true">
      <span>&#9733;</span>
      <span>&#9733;</span>
      <span>&#9733;</span>
    </div>
  );
}

/**
 * GearIcon — the Settings button. A single filled silhouette (the
 * classic 8-tooth castellated gear + a punched-out center hole via
 * fill-rule="evenodd"), not a ring of separate shapes — that's what
 * keeps it reading clearly as a mechanical gear even at the small
 * 22px it renders at inside the settings button, rather than
 * blurring into a flower/sun shape the way loose rounded teeth do.
 */
export function GearIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.69 3.70 L11.12 1.84 L12.88 1.84 L13.31 3.70
           A8.40 8.40 0 0 1 16.94 5.20 L16.94 5.20 L18.56 4.19 L19.81 5.44 L18.80 7.06
           A8.40 8.40 0 0 1 20.30 10.69 L20.30 10.69 L22.16 11.12 L22.16 12.88 L20.30 13.31
           A8.40 8.40 0 0 1 18.80 16.94 L18.80 16.94 L19.81 18.56 L18.56 19.81 L16.94 18.80
           A8.40 8.40 0 0 1 13.31 20.30 L13.31 20.30 L12.88 22.16 L11.12 22.16 L10.69 20.30
           A8.40 8.40 0 0 1 7.06 18.80 L7.06 18.80 L5.44 19.81 L4.19 18.56 L5.20 16.94
           A8.40 8.40 0 0 1 3.70 13.31 L3.70 13.31 L1.84 12.88 L1.84 11.12 L3.70 10.69
           A8.40 8.40 0 0 1 5.20 7.06 L5.20 7.06 L4.19 5.44 L5.44 4.19 L7.06 5.20
           A8.40 8.40 0 0 1 10.69 3.70 Z
           M12 8.8 a3.2 3.2 0 1 0 0 6.4 a3.2 3.2 0 0 0 0 -6.4 Z"
      />
    </svg>
  );
}

/**
 * SpeakerIcon — one shape, two states via the `muted` prop: sound-wave
 * arcs when active, a plain X when muted. Used for the Sound FX row.
 */
export function SpeakerIcon({ className = "", style = {}, muted = false }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      {muted ? (
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="15.5" y1="9" x2="20.5" y2="15" />
          <line x1="20.5" y1="9" x2="15.5" y2="15" />
        </g>
      ) : (
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M15.3 9.3a3.6 3.6 0 0 1 0 5.4" />
          <path d="M17.6 7a6.8 6.8 0 0 1 0 10" />
        </g>
      )}
    </svg>
  );
}

/**
 * MusicNoteIcon — same pattern as SpeakerIcon: one shape, and a
 * diagonal slash overlay when `muted`. Used for the Background Music row.
 */
export function MusicNoteIcon({ className = "", style = {}, muted = false }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="7" cy="17.5" r="2.6" fill="currentColor" />
      <circle cx="16" cy="15.5" r="2.6" fill="currentColor" />
      <path
        d="M9.6 17.5V6.2L18.6 4v11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {muted && <line x1="3.5" y1="20.5" x2="20.5" y2="3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  );
}