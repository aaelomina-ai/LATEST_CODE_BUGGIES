import React, { useEffect, useState } from "react";
import SceneFrame from "./components/SceneFrame";
import { Ladybug, JsIcon, JavaIcon, PythonIcon, CIcon, Invader, Blob, Cloud } from "./components/icons/TechIcons";
import "./components/critters.css";
import "./LoadScreen.css";

/**
 * LoadScreen
 * ----------
 * Fullscreen "Code Buggies" loading screen.
 *
 * Props:
 *  - progress (number, optional): 0-100. Omit it and the component
 *    fakes its own progress so it still looks alive standalone.
 *  - label (string, optional): text under the bar. Defaults to "LOADING..."
 */
export default function LoadScreen({ progress, label = "LOADING..." }) {
  const [internalProgress, setInternalProgress] = useState(0);

  useEffect(() => {
    if (progress !== undefined) return;
    const id = setInterval(() => {
      setInternalProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 60);
    return () => clearInterval(id);
  }, [progress]);

  const pct = progress !== undefined ? progress : internalProgress;
  const totalSegments = 20;
  const filledSegments = Math.round((pct / 100) * totalSegments);

  return (
    <SceneFrame>
      <div className="loadscreen">
        {/* wandering decoration — every creature here drifts on its own loop */}
        <Cloud className="critter critter--cloud loadscreen__cloud loadscreen__cloud--1" />
        <Cloud className="critter critter--cloud loadscreen__cloud loadscreen__cloud--2" />

        <JsIcon className="critter critter--a loadscreen__deco loadscreen__deco--js" />
        <JavaIcon className="critter critter--b loadscreen__deco loadscreen__deco--java" />
        <PythonIcon className="critter critter--c loadscreen__deco loadscreen__deco--python" />
        <CIcon className="critter critter--d loadscreen__deco loadscreen__deco--c" />
        <Invader className="critter critter--e loadscreen__deco loadscreen__deco--invader" />
        <Blob className="critter critter--f loadscreen__deco loadscreen__deco--blob" />

        <Ladybug className="critter critter--a loadscreen__bug loadscreen__bug--tl" />
        <Ladybug className="critter critter--c loadscreen__bug loadscreen__bug--tr" />
        <Ladybug className="critter critter--e loadscreen__bug loadscreen__bug--bl" />
        <Ladybug className="critter critter--b loadscreen__bug loadscreen__bug--br" />

        <div className="loadscreen__content">
          <h1 className="loadscreen__title">
            <span className="loadscreen__title-line">CODE</span>
            <span className="loadscreen__title-line loadscreen__title-line--buggies">BUGGIES</span>
          </h1>

          <div className="loadscreen__bar-wrap">
            <div className="loadscreen__walker" style={{ left: `calc(${pct}% - 14px)` }}>
              <Ladybug className="bug--walker" />
            </div>

            <div
              className="loadscreen__bar"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {Array.from({ length: totalSegments }).map((_, i) => (
                <span
                  key={i}
                  className={
                    "loadscreen__segment" +
                    (i < filledSegments ? " loadscreen__segment--filled" : "")
                  }
                />
              ))}
            </div>
          </div>

          <p className="loadscreen__label">{label}</p>
        </div>
      </div>
    </SceneFrame>
  );
}