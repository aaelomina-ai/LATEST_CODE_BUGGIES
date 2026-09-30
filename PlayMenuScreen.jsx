import React, { useState } from "react";
import SceneFrame from "./components/SceneFrame";
import AuthHeader from "./components/AuthHeader";
import { findOrCreateQuickMatch, createPrivateRoom, joinPrivateRoomByCode } from "./services/roomService";
import "./components/auth-layout.css";
import "./components/auth-panel.css";

/**
 * PlayMenuScreen
 * --------------
 * Props:
 *  - onBack (function): back-arrow handler
 *  - user (object): the Firebase user (uid + displayName)
 *  - onRoomReady (function): called with the roomId once the player has
 *    joined a room (quick match, created private room, or joined by code)
 */
export default function PlayMenuScreen({ onBack, user, onRoomReady }) {
  const [mode, setMode] = useState("menu"); // "menu" | "join"
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleQuickPlay() {
    setError("");
    setBusy(true);
    try {
      const roomId = await findOrCreateQuickMatch(user.uid, user.displayName);
      onRoomReady(roomId);
    } catch (err) {
      setError("Couldn't find a match. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreatePrivate() {
    setError("");
    setBusy(true);
    try {
      const { roomId } = await createPrivateRoom(user.uid, user.displayName);
      onRoomReady(roomId);
    } catch (err) {
      setError("Couldn't create a room. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const roomId = await joinPrivateRoomByCode(code, user.uid, user.displayName);
      onRoomReady(roomId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SceneFrame>
      <div className="auth-screen">
        <AuthHeader onBack={onBack} />

        <div className="auth-screen__center">
          <div className="auth-panel">
            <h2 className="auth-panel__heading">READY UP</h2>
            <p className="auth-panel__subtext">Playing as {user?.displayName}</p>

            {error && <p className="auth-panel__error">{error}</p>}

            {mode === "menu" && (
              <>
                <button type="button" className="auth-button" onClick={handleQuickPlay} disabled={busy}>
                  {busy ? "FINDING MATCH..." : "QUICK PLAY"}
                </button>
                <button type="button" className="auth-button auth-button--secondary" onClick={handleCreatePrivate} disabled={busy}>
                  CREATE PRIVATE ROOM
                </button>
                <button type="button" className="auth-button auth-button--secondary" onClick={() => setMode("join")} disabled={busy}>
                  JOIN WITH CODE
                </button>
              </>
            )}

            {mode === "join" && (
              <form className="auth-panel__inline-form" onSubmit={handleJoinSubmit}>
                <label className="auth-field">
                  <span className="auth-field__label">ROOM CODE</span>
                  <input
                    className="auth-field__input auth-field__input--code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={5}
                    autoComplete="off"
                    required
                  />
                </label>
                <button type="submit" className="auth-button" disabled={busy}>
                  {busy ? "JOINING..." : "JOIN ROOM"}
                </button>
                <button type="button" className="auth-panel__switch-link" onClick={() => setMode("menu")}>
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}