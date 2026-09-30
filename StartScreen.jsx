import React from "react";
import SceneFrame from "./components/SceneFrame";
import { Ladybug, Cloud } from "./components/icons/TechIcons";
import "./components/critters.css";
import "./StartScreen.css";

/**
 * StartScreen
 * -----------
 * Fullscreen arcade hero shown once loading finishes. Recreates the
 * reference banner: title + tagline + roaming bugs/language icons on
 * the left, an arcade cabinet on the right whose screen now prompts
 * the player to start instead of showing gameplay footage.
 *
 * Props:
 *  - onStart (function, optional): called when the player presses
 *    the "CLICK TO START" button — wire this to however your game
 *    actually boots up (route change, setState, etc).
 */

// --- Language icons ---------------------------------------------------
// Self-contained SVG badges: each one draws its own rounded-square
// background + symbol, so they work identically whether used as a
// small floating decoration (via startscreen__deco--*) or as an
// arcade panel badge (via arcade__lang-icon). No external image
// assets needed, and no risk of the badges overlapping or clipping.

function PythonIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Python">
      <rect x="2" y="2" width="96" height="96" rx="18" fill="#16213e" />
      <path

        d="M50 12c-9 0-16 3-16 12v9h16v3H27c-9 0-13 6-13 15s4 15 13 15h7v-9c0-9 6-15 15-15h15c6 0 11-6 11-12V24c0-9-7-12-16-12h-9z"
        fill="#4B8BBE"
      />
      <path
        d="M50 88c9 0 16-3 16-12v-9H50v-3h23c9 0 13-6 13-15s-4-15-13-15h-7v9c0 9-6 15-15 15H36c-6 0-11 6-11 12v9c0 9 7 12 16 12h9z"
        fill="#FFD43B"
      />
      <circle cx="39" cy="21" r="3" fill="#16213e" />
      <circle cx="61" cy="79" r="3" fill="#16213e" />
    </svg>
  );
}

function JsIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="JavaScript">
      <rect x="2" y="2" width="96" height="96" rx="18" fill="#f0db4f" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill="#1a1a1a"
      >
        JS
      </text>
    </svg>
  );
}


function JavaIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Java">
      <rect x="2" y="2" width="96" height="96" rx="18" fill="#2b1810" />
      <path d="M35 20c8 6 8 12 2 18" fill="none" stroke="#f89820" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 16c8 6 8 12 2 18" fill="none" stroke="#f89820" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 55h44c2 10-6 18-22 18s-24-8-22-18z" fill="#f89820" />
      <ellipse cx="50" cy="55" rx="22" ry="5" fill="#2b1810" />
      <path d="M70 58c6 2 9 6 9 10 0 6-9 10-20 10" fill="none" stroke="#f89820" strokeWidth="3" />
    </svg>
  );
}

function CppIcon({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="C++">
      <rect x="2" y="2" width="96" height="96" rx="18" fill="#3d7dca" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="800"
        fontSize="34"
        fill="#ffffff"
      >
        C++
      </text>
    </svg>
  );
}


export default function StartScreen({ onStart }) {
  return (
    <SceneFrame>
      <div className="startscreen">
        <Cloud className="critter critter--cloud startscreen__cloud" />

        <JsIcon className="critter critter--a startscreen__deco startscreen__deco--js" />
        <JavaIcon className="critter critter--b startscreen__deco startscreen__deco--java" />
        <PythonIcon className="critter critter--c startscreen__deco startscreen__deco--python" />
        <CppIcon className="critter critter--d startscreen__deco startscreen__deco--c" />
        <Ladybug className="critter critter--e startscreen__deco startscreen__deco--invader" />
        <Ladybug className="critter critter--f startscreen__deco startscreen__deco--blob" />
        <Ladybug className="critter critter--a startscreen__deco startscreen__deco--bug" />

        <div className="startscreen__left">
          <h1 className="startscreen__title">
            <span className="startscreen__title-line">CODE</span>
            <span className="startscreen__title-line startscreen__title-line--buggies">BUGGIES</span>
          </h1>
          <p className="startscreen__tagline">DEBUG &bull; COMPETE &bull; DOMINATE</p>
        </div>

        <div className="startscreen__right">
          <div className="arcade">
            <div className="arcade__marquee">
              <span className="arcade__star">&#9733;</span>
              <span className="arcade__marquee-text">PLAY NOW</span>
              <span className="arcade__star">&#9733;</span>
            </div>

            <div className="arcade__screen-bezel">
              <div className="arcade__screen">

                <p className="arcade__screen-text">CLICK TO START</p>
                <button
                  type="button"
                  className="arcade__play-button"
                  onClick={onStart}
                  aria-label="Click to start the game"
                >
                  <span className="arcade__play-triangle" />
                </button>
              </div>
            </div>

            <div className="arcade__panel">
              <p className="arcade__panel-text">CODING GAME</p>
              <div className="arcade__langs">
                <PythonIcon className="arcade__lang-icon" />
                <JsIcon className="arcade__lang-icon" />
                <JavaIcon className="arcade__lang-icon" />
                <CppIcon className="arcade__lang-icon" />
              </div>
            </div>

            <div className="arcade__base">
              <span className="arcade__speaker" />
              <span className="arcade__speaker" />
            </div>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}