import React, { useEffect, useState } from "react";
import SceneFrame from "./components/SceneFrame";
import AuthHeader from "./components/AuthHeader";
import { PythonIcon, JsIcon, JavaIcon, CIcon } from "./components/icons/TechIcons";
import { getProgress, isDifficultyUnlocked, DIFFICULTIES } from "./services/progressService";
import { setPlayerSelection, leaveRoom } from "./services/roomService";
import "./components/auth-layout.css";
import "./GameSelectScreen.css";

const LANGUAGE_CARDS = [
  { id: "python", label: "PYTHON FUNDAMENTALS", Icon: PythonIcon },
  { id: "javascript", label: "JAVASCRIPT ESSENTIALS", Icon: JsIcon },
  { id: "java", label: "JAVA PROGRAMMING", Icon: JavaIcon },
  { id: "cpp", label: "C++ ADVANCED", Icon: CIcon },
];

const DIFFICULTY_LABELS = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  hard: "HARD",
};

/**
 * GameSelectScreen ("Learning Hub")
 * ----------------------------------
 * Two steps in one screen: pick a language, then pick a difficulty.
 * Intermediate/Hard are locked until the player has passed the tier
 * below them (see progressService.isDifficultyUnlocked).
 *
 * Props:
 *  - user (object): Firebase user (uid + displayName)
 *  - roomId (string): the room the player already joined
 *  - onBack (function): back-arrow handler — returns to Play Menu
 *  - onContinue (function): called with { language, difficulty } once picked
 */
export default function GameSelectScreen({ user, roomId, onBack, onContinue }) {
  const [progress, setProgress] = useState({});
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress(user.uid).then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, [user.uid]);

  async function handlePickDifficulty(difficulty) {
    if (!isDifficultyUnlocked(progress, language, difficulty)) return;
    await setPlayerSelection(roomId, user.uid, { language, difficulty });
    onContinue({ language, difficulty });
  }

  // Stepping back out of the language grid (not just out of the
  // difficulty list) means leaving the match entirely, same as
  // LobbyScreen's back arrow — so it needs the same leaveRoom() call,
  // or the player's row in rooms/{roomId}/players never gets cleaned up.
  async function handleBack() {
    if (language) {
      setLanguage(null);
      return;
    }
    await leaveRoom(roomId, user.uid);
    onBack();
  }

  return (
    <SceneFrame>
      <div className="auth-screen">
        <AuthHeader onBack={handleBack} />

        <div className="auth-screen__center learning-hub">
          {language === null ? (
            <>
              <h2 className="learning-hub__heading">SELECT PROGRAMMING LANGUAGE</h2>
              <div className="learning-hub__grid">
                {LANGUAGE_CARDS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className="lang-card"
                    onClick={() => setLanguage(id)}
                    disabled={loading}
                  >
                    <Icon className="lang-card__icon" />
                    <span className="lang-card__label">{label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="learning-hub__heading">
                {LANGUAGE_CARDS.find((l) => l.id === language)?.label}
              </h2>
              <p className="auth-panel__subtext">Choose a difficulty</p>
              <div className="learning-hub__difficulty-list">
                {DIFFICULTIES.map((difficulty) => {
                  const unlocked = isDifficultyUnlocked(progress, language, difficulty);
                  const passed = Boolean(progress?.[language]?.[difficulty]);
                  return (
                    <button
                      key={difficulty}
                      type="button"
                      className={"diff-card" + (unlocked ? "" : " diff-card--locked")}
                      onClick={() => handlePickDifficulty(difficulty)}
                      disabled={!unlocked}
                    >
                      <span className="diff-card__label">{DIFFICULTY_LABELS[difficulty]}</span>
                      {passed && <span className="diff-card__badge">CLEARED</span>}
                      {!unlocked && <span className="diff-card__lock">LOCKED</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </SceneFrame>
  );
}