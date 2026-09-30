import React from "react";
import "./SceneFrame.css";

/**
 * SceneFrame
 * ----------
 * The reusable "world" both screens live in: fullscreen navy background,
 * faint circuit/web line texture, glowing blue vortex in the corner,
 * and the neon-green rounded border that frames everything.
 *
 * Keeping this in one place means LoadScreen and StartScreen never
 * drift apart visually — change the theme once, both screens update.
 */
export default function SceneFrame({ children }) {
  return (
    <div className="scene">
      <div className="scene__texture" aria-hidden="true" />
      <div className="scene__vortex" aria-hidden="true" />
      <div className="scene__border" aria-hidden="true" />
      <div className="scene__content">{children}</div>
    </div>
  );
}