import React, { useState } from "react";
import SceneFrame from "./components/SceneFrame";
import AuthHeader from "./components/AuthHeader";
import { enterWithUsername } from "./services/authService";
import "./components/auth-layout.css";
import "./components/auth-panel.css";

/**
 * UsernameScreen
 * --------------
 * Replaces the old LoginScreen + CreateAccountScreen. There's no
 * password anymore — a player just picks a username and starts
 * playing. Firebase Anonymous Auth still runs underneath so every
 * player has a real, secure uid (see authService.enterWithUsername).
 *
 * Props:
 *  - onBack (function): back-arrow handler — returns to StartScreen
 *  - onEnterSuccess (function): called with the Firebase user object once the username is claimed
 */
export default function UsernameScreen({ onBack, onEnterSuccess }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { user } = await enterWithUsername(username);
      onEnterSuccess?.(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SceneFrame>
      <div className="auth-screen">
        <AuthHeader onBack={onBack} />

        <div className="auth-screen__center">
          <form className="auth-panel" onSubmit={handleSubmit}>
            <h2 className="auth-panel__heading">ENTER THE ARENA</h2>
            <p className="auth-panel__subtext">Pick a username. Start competing.</p>

            <label className="auth-field">
              <span className="auth-field__label">USERNAME</span>
              <input
                className="auth-field__input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                maxLength={16}
                required
              />
            </label>

            {error && <p className="auth-panel__error">{error}</p>}

            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? "ENTERING..." : "PLAY"}
            </button>
          </form>
        </div>
      </div>
    </SceneFrame>
  );
}