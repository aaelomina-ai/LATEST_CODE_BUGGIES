import React from "react";
import { BackArrow, StarRow } from "./icons/UiIcons";
import { Ladybug, JsIcon, JavaIcon, PythonIcon, CIcon, Invader, Blob, Cloud } from "./icons/TechIcons";
import "./critters.css";
import "./AuthHeader.css";

/**
 * AuthHeader
 * ----------
 * The header treatment shared by LoginScreen and CreateAccountScreen:
 * back button (top-left), star row + title + tagline (top-center),
 * cloud (top-right), and language/monster icons drifting down each side.
 *
 * Kept in one place so both auth screens always look like they belong
 * to the same app — change this once, both screens update.
 */
export default function AuthHeader({ onBack }) {
  return (
    <>
      <BackArrow className="auth-header__back" onClick={onBack} />

      <div className="auth-header__top">
        <StarRow className="auth-header__stars" />
        <h1 className="auth-header__title">
          <span className="auth-header__title-line">CODE</span>{" "}
          <span className="auth-header__title-line auth-header__title-line--buggies">BUGGIES</span>
        </h1>
        <p className="auth-header__tagline">DEBUG &bull; COMPETE &bull; DOMINATE</p>
      </div>

      <Cloud className="critter critter--cloud auth-header__cloud" />

      <Invader className="critter critter--e auth-header__deco auth-header__deco--invader" />
      <Ladybug className="critter critter--a auth-header__deco auth-header__deco--bug" />
      <PythonIcon className="critter critter--c auth-header__deco auth-header__deco--python" />
      <JavaIcon className="critter critter--b auth-header__deco auth-header__deco--java" />
      <Blob className="critter critter--f auth-header__deco auth-header__deco--blob" />
      <CIcon className="critter critter--d auth-header__deco auth-header__deco--c" />
      <JsIcon className="critter critter--a auth-header__deco auth-header__deco--js" />
    </>
  );
}