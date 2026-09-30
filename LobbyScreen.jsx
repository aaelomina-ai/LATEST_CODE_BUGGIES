import React, { useEffect, useState } from "react";
import SceneFrame from "./components/SceneFrame";
import AuthHeader from "./components/AuthHeader";
import { listenToRoom, leaveRoom, tryStartMatch, COUNTDOWN_MS } from "./services/roomService";
import "./components/auth-layout.css";
import "./components/auth-panel.css";
import "./LobbyScreen.css";

const MAX_PLAYERS = 4;

/**
 * LobbyScreen
 * -----------
 * Props:
 *  - roomId (string)
 *  - user (object): the Firebase user (uid + displayName)
 *  - onBack (function): leave the room, return to the play menu
 *  - onMatchStart (function): called once the room's status flips to "in_progress"
 */
export default function LobbyScreen({ roomId, user, onBack, onMatchStart }) {
  const [room, setRoom] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Subscribe to the room's live state.
  useEffect(() => {
    const unsubscribe = listenToRoom(roomId, setRoom);
    return unsubscribe;
  }, [roomId]);

  // Once the room flips to "in_progress" (countdown expired, or room
  // filled up instantly), hand off to the game.
  useEffect(() => {
    if (room?.status === "in_progress") {
      onMatchStart(roomId);
    }
  }, [room?.status, roomId, onMatchStart]);

  // Tick the locally-displayed countdown off the SHARED start timestamp,
  // so every player's screen agrees regardless of when their own tab
  // happened to load. When it hits zero, ask the server to start.
  useEffect(() => {
    if (room?.status !== "counting" || !room.countdownStartedAt) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - room.countdownStartedAt;
      const remaining = Math.max(0, COUNTDOWN_MS - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        tryStartMatch(roomId);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [room?.status, room?.countdownStartedAt, roomId]);

  async function handleLeave() {
    await leaveRoom(roomId, user.uid);
    onBack();
  }

  const players = room?.players ? Object.entries(room.players) : [];
  const slots = Array.from({ length: MAX_PLAYERS }, (_, i) => players[i] || null);

  return (
    <SceneFrame>
      <div className="auth-screen">
        <AuthHeader onBack={handleLeave} />

        <div className="auth-screen__center">
          <div className="auth-panel lobby-panel">
            <h2 className="auth-panel__heading">LOBBY</h2>

            {room?.type === "private" && room?.code && (
              <p className="lobby-code">
                ROOM CODE: <span className="lobby-code__value">{room.code}</span>
              </p>
            )}

            <div className="lobby-players">
              {slots.map((entry, i) => {
                const [uid, playerData] = entry || [];
                return (
                  <div key={uid || `empty-${i}`} className={"lobby-slot" + (entry ? " lobby-slot--filled" : "")}>
                    {entry ? playerData.username : "Waiting for player..."}
                  </div>
                );
              })}
            </div>

            {secondsLeft !== null ? (
              <p className="lobby-countdown">STARTING IN {secondsLeft}s</p>
            ) : (
              <p className="auth-panel__subtext">Waiting for at least 2 players to begin the countdown...</p>
            )}
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}