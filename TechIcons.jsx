import React from "react";
import PixelSprite from "../PixelSprite";

/* ---------------------------------------------------------------- */
/* Pixel-grid matrices — 1 = filled block, 0 = empty                */
/* ---------------------------------------------------------------- */
const INVADER_MATRIX = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1],
];

const BLOB_MATRIX = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
];

/* ---------------------------------------------------------------- */
/* Ladybug — reused everywhere as the "signature" bug                */
/* ---------------------------------------------------------------- */
export function Ladybug({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="24" y1="14" x2="16" y2="4" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="14" x2="48" y2="4" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="4" r="2.2" fill="#1a1a1a" />
      <circle cx="48" cy="4" r="2.2" fill="#1a1a1a" />
      <g stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round">
        <line x1="16" y1="30" x2="6" y2="24" />
        <line x1="14" y1="40" x2="4" y2="40" />
        <line x1="16" y1="50" x2="7" y2="56" />
        <line x1="48" y1="30" x2="58" y2="24" />
        <line x1="50" y1="40" x2="60" y2="40" />
        <line x1="48" y1="50" x2="57" y2="56" />
      </g>
      <circle cx="32" cy="16" r="10" fill="#1a1a1a" />
      <path
        d="M32 22 C48 22 54 34 54 44 C54 56 44 62 32 62 C20 62 10 56 10 44 C10 34 16 22 32 22 Z"
        fill="#e8241c"
        stroke="#1a1a1a"
        strokeWidth="2.5"
      />
      <line x1="32" y1="24" x2="32" y2="60" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="22" cy="34" r="4" fill="#1a1a1a" />
      <circle cx="42" cy="34" r="4" fill="#1a1a1a" />
      <circle cx="19" cy="48" r="4" fill="#1a1a1a" />
      <circle cx="45" cy="48" r="4" fill="#1a1a1a" />
      <circle cx="32" cy="52" r="3.5" fill="#1a1a1a" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Language badges                                                   */
/* ---------------------------------------------------------------- */
export function JsIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#f0db4f" stroke="#1a1a1a" strokeWidth="3" />
      <text x="32" y="42" fontFamily="'Press Start 2P', monospace" fontSize="18" fill="#1a1a1a" textAnchor="middle">
        JS
      </text>
    </svg>
  );
}

export function JavaIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#2b2140" stroke="#1a1a1a" strokeWidth="3" />
      {/* rising steam */}
      <path d="M24 14 q4 4 0 8 q-4 4 0 8" fill="none" stroke="#ff6a3d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M33 12 q4 4 0 8 q-4 4 0 8" fill="none" stroke="#ff6a3d" strokeWidth="2.2" strokeLinecap="round" />
      {/* mug body, rounded bottom */}
      <path d="M18 32 H38 V42 A10 10 0 0 1 18 42 Z" fill="#f2f2f2" stroke="#1a1a1a" strokeWidth="2" />
      {/* handle */}
      <path d="M38 35 a6 6 0 0 1 0 12" fill="none" stroke="#f2f2f2" strokeWidth="3" strokeLinecap="round" />
      {/* saucer */}
      <ellipse cx="28" cy="47" rx="15" ry="3" fill="none" stroke="#9a9ab0" strokeWidth="2" />
    </svg>
  );
}

export function PythonIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#1b1330" stroke="#1a1a1a" strokeWidth="3" />
      <path
        d="M32 12 c-8 0-8 5-8 5v6h8v2H16s-6 0-6 9 6 9 6 9h4v-6s0-4 4-4h8s4 0 4-4v-8s0-9-4-9Z"
        fill="#4b8bbe"
      />
      <path
        d="M32 52 c8 0 8-5 8-5v-6h-8v-2h16s6 0 6-9-6-9-6-9h-4v6s0 4-4 4h-8s-4 0-4 4v8s0 9 4 9Z"
        fill="#ffd43b"
      />
      <circle cx="26" cy="16" r="1.6" fill="#1b1330" />
      <circle cx="38" cy="48" r="1.6" fill="#1b1330" />
    </svg>
  );
}

export function CIcon({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#2a5fb8" stroke="#1a1a1a" strokeWidth="3" />
      <text x="32" y="39" fontFamily="'Press Start 2P', monospace" fontSize="15" fill="#f2f2f2" textAnchor="middle">
        C++
      </text>
    </svg>
  );
}

export function Cloud({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="#eef3ff">
        <ellipse cx="30" cy="38" rx="18" ry="14" />
        <ellipse cx="50" cy="26" rx="20" ry="18" />
        <ellipse cx="70" cy="34" rx="17" ry="15" />
        <ellipse cx="52" cy="40" rx="30" ry="13" />
      </g>
    </svg>
  );
}

export function Invader({ className = "", style = {}, color = "#9b5cff" }) {
  return <PixelSprite matrix={INVADER_MATRIX} color={color} className={className} style={style} />;
}

export function Blob({ className = "", style = {}, color = "#39ff6a" }) {
  return <PixelSprite matrix={BLOB_MATRIX} color={color} className={className} style={style} />;
}

/* ---------------------------------------------------------------- */
/* GlowBug — neon "code bug" mascot (cyan -> purple -> pink), the    */
/* arcade-screen star of the show. Curled antennae + a </> glyph     */
/* fused into its shell so it reads as "debugging", not just "bug".  */
/* ---------------------------------------------------------------- */
export function GlowBug({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="glowbug-grad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eebff" />
          <stop offset="50%" stopColor="#9b5cff" />
          <stop offset="100%" stopColor="#ff59d4" />
        </linearGradient>
      </defs>

      {/* curled antennae */}
      <path d="M25 17 C21 9 15 9 12 5" fill="none" stroke="url(#glowbug-grad)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M39 17 C43 9 49 9 52 5" fill="none" stroke="url(#glowbug-grad)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2.2" fill="#5eebff" />
      <circle cx="52" cy="5" r="2.2" fill="#ff59d4" />

      {/* legs */}
      <g stroke="url(#glowbug-grad)" strokeWidth="2.2" strokeLinecap="round">
        <line x1="14" y1="27" x2="5" y2="23" />
        <line x1="13" y1="38" x2="4" y2="40" />
        <line x1="15" y1="49" x2="8" y2="55" />
        <line x1="50" y1="27" x2="59" y2="23" />
        <line x1="51" y1="38" x2="60" y2="40" />
        <line x1="49" y1="49" x2="56" y2="55" />
      </g>

      {/* fused blob body */}
      <path
        d="M32 15 C45 15 53 25 53 37 C53 50 44 59 32 59 C20 59 11 50 11 37 C11 25 19 15 32 15 Z"
        fill="url(#glowbug-grad)"
      />
      <path d="M32 24 L32 51" stroke="rgba(10,7,20,0.3)" strokeWidth="2" strokeLinecap="round" />

      {/* </> code glyph, fused into the shell */}
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="'Press Start 2P', monospace"
        fontSize="13"
        fill="#f5faff"
      >
        {"</>"}
      </text>
    </svg>
  );
}