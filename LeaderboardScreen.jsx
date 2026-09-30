import React, { useEffect, useRef, useState } from "react";
import SceneFrame from "./components/SceneFrame";
import { listenToRoom } from "./services/roomService";
import { playVictorySound, playDefeatSound } from "./services/audioService";
import "./components/auth-panel.css";
import "./LeaderboardScreen.css";

/**
 * LeaderboardScreen
 * -----------------
 * Shown after a player finishes a quiz. Reads the room's current
 * standings live from Firebase — the same `rooms/{roomId}/players`
 * data QuizScreen already uses for its rankings sidebar — and
 * presents them as a podium + list instead of a bare score line.
 *
 * Props:
 *  - roomId, user
 *  - onPlayAgain (function): back to the language/difficulty picker
 *  - onLeaveRoom (function): leave the room entirely, back to the play menu
 */
export default function LeaderboardScreen({ roomId, user, onPlayAgain, onLeaveRoom }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToRoom(roomId, setRoom);
    return unsubscribe;
  }, [roomId]);

  const players = room?.players ? Object.entries(room.players) : [];
  const ranked = players
    .map(([uid, data]) => ({ uid, username: data.username, score: data.score || 0 }))
    .sort((a, b) => b.score - a.score);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  // Visual order on the stands is 2nd - 1st - 3rd, so 1st place sits
  // tallest in the middle — the actual rank still comes from `podium`.
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  // Play the win/lose stinger exactly once, the moment standings first
  // arrive — not on every subsequent Firebase update, which is why
  // this is a ref (doesn't trigger re-renders) rather than state.
  const hasPlayedResultSound = useRef(false);
  useEffect(() => {
    if (hasPlayedResultSound.current) return;
    if (ranked.length === 0) return;
    hasPlayedResultSound.current = true;

    // Tie-aware: anyone sharing the top score counts as a win, not
    // just whoever happens to sort into index 0.
    const topScore = ranked[0].score;
    const me = ranked.find((p) => p.uid === user?.uid);
    const isWinner = Boolean(me) && me.score === topScore;

    if (isWinner) playVictorySound();
    else playDefeatSound();
  }, [ranked, user]);

  return (
    <SceneFrame>
      <div className="leaderboard-screen">
        <h2 className="leaderboard-screen__heading">🏆 LEADERBOARD</h2>

        {podium.length > 0 && (
          <div className="podium">
            {podiumOrder.map((p) => {
              const place = podium.indexOf(p) + 1;
              return (
                <div key={p.uid} className={"podium__column podium__column--" + place}>
                  <span className="podium__place">{place}</span>
                  <span className={"podium__name" + (p.uid === user?.uid ? " podium__name--me" : "")}>
                    {p.username}
                  </span>
                  <span className="podium__score">{p.score} pts</span>
                  <div className="podium__stand" />
                </div>
              );
            })}
          </div>
        )}

        {rest.length > 0 && (
          <div className="leaderboard-rest">
            {rest.map((p, i) => (
              <div
                key={p.uid}
                className={"leaderboard-rest__row" + (p.uid === user?.uid ? " leaderboard-rest__row--me" : "")}
              >
                <span className="leaderboard-rest__rank">{i + 4}</span>
                <span className="leaderboard-rest__name">{p.username}</span>
                <span className="leaderboard-rest__score">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {podium.length === 0 && <p className="auth-panel__subtext">Waiting for scores to load…</p>}

        <div className="leaderboard-screen__actions">
          <button type="button" className="auth-button" onClick={onPlayAgain}>
            PLAY AGAIN
          </button>
          <button type="button" className="auth-button auth-button--secondary" onClick={onLeaveRoom}>
            RETURN TO MENU
          </button>
        </div>
      </div>
    </SceneFrame>
  );
}