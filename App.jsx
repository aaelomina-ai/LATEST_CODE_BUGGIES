import React, { useEffect, useState } from "react";
import LoadScreen from "./LoadScreen";
import StartScreen from "./StartScreen";
import UsernameScreen from "./UsernameScreen";
import PlayMenuScreen from "./PlayMenuScreen";
import LobbyScreen from "./LobbyScreen";
import GameSelectScreen from "./GameSelectScreen";
import QuizScreen from "./QuizScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import SettingsOverlay from "./components/SettingsOverlay";
import { onAuthChange, logOut } from "./services/authService";
import { leaveRoom } from "./services/roomService";
import { startBackgroundMusicOnFirstClick, playClickSound, setActiveTrack } from "./services/audioService";
import "./index.css";

/**
 * App
 * ---
 * Owns which fullscreen "stage" is showing:
 *   "loading"     -> LoadScreen, also checks for an existing anonymous session
 *   "start"       -> the arcade hero, waiting for the player to press play
 *   "username"    -> pick a username
 *   "playmenu"    -> quick play / create private room / join by code
 *   "lobby"       -> live player list + countdown, waiting for the match to start
 *   "gameselect"  -> Learning Hub: pick a language, then a difficulty
 *   "quiz"        -> the actual quiz (terminal-style questions + live rankings + timer)
 *   "leaderboard" -> podium + rankings shown once a player finishes a quiz
 *
 * SettingsOverlay (gear icon, top-right) is mounted once here, on top
 * of whichever stage is active, instead of being wired into every
 * individual screen — see components/SettingsOverlay.jsx.
 */
export default function App() {
  const [stage, setStage] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (stage !== "loading") return;
    if (!authChecked) return;

    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => setStage(user?.displayName ? "playmenu" : "start"), 400);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(id);
  }, [stage, authChecked, user]);

  // Global audio wiring, set up once for the app's whole lifetime:
  //  - first pointerdown anywhere starts background music (browsers
  //    block autoplay before any user gesture, so this can't run any
  //    earlier than that)
  //  - every button click anywhere gets a UI blip, via delegation —
  //    no need to touch a single button in any screen file
  useEffect(() => {
    function handleFirstInteraction() {
      startBackgroundMusicOnFirstClick();
    }
    function handleClick(e) {
      if (e.target.closest("button")) playClickSound();
    }
    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  // Background music tracks by context: the live quiz gets its own
  // more intense track, everything else (menus, lobby, hub, results)
  // shares the calmer one. audioService handles the actual crossfade
  // and remembers this even before the player's first click unlocks
  // real playback.
  useEffect(() => {
    setActiveTrack(stage === "quiz" ? "match" : "ui");
  }, [stage]);

  // Settings' EXIT button can fire from any stage, including mid-match,
  // so it takes the same care LobbyScreen/GameSelectScreen's back
  // buttons do: leave the room first (best-effort) so no player entry
  // is left orphaned in Firebase, then log out and reset to the start.
  async function handleExit() {
    if (roomId && user) {
      try {
        await leaveRoom(roomId, user.uid);
      } catch {
        // best-effort — exiting should never get stuck on a network hiccup
      }
    }
    await logOut();
    setRoomId(null);
    setSelection(null);
    setStage("start");
  }

  let screen;

  if (stage === "loading" || !authChecked) {
    screen = <LoadScreen progress={Math.min(progress, 100)} />;
  } else if (stage === "start") {
    screen = <StartScreen onStart={() => setStage("username")} />;
  } else if (stage === "username") {
    screen = (
      <UsernameScreen
        onBack={() => setStage("start")}
        onEnterSuccess={(firebaseUser) => {
          setUser(firebaseUser);
          setStage("playmenu");
        }}
      />
    );
  } else if (stage === "playmenu") {
    screen = (
      <PlayMenuScreen
        user={user}
        onBack={() => setStage("start")}
        onRoomReady={(id) => {
          setRoomId(id);
          setStage("lobby");
        }}
      />
    );
  } else if (stage === "lobby") {
    screen = (
      <LobbyScreen
        roomId={roomId}
        user={user}
        onBack={() => {
          setRoomId(null);
          setStage("playmenu");
        }}
        onMatchStart={(id) => {
          setRoomId(id);
          setStage("gameselect");
        }}
      />
    );
  } else if (stage === "gameselect") {
    screen = (
      <GameSelectScreen
        user={user}
        roomId={roomId}
        onBack={() => {
          setRoomId(null);
          setStage("playmenu");
        }}
        onContinue={(pickedSelection) => {
          setSelection(pickedSelection);
          setStage("quiz");
        }}
      />
    );
  } else if (stage === "quiz") {
    screen = (
      <QuizScreen
        roomId={roomId}
        user={user}
        selection={selection}
        onFinish={() => setStage("leaderboard")}
      />
    );
  } else if (stage === "leaderboard") {
    screen = (
      <LeaderboardScreen
        roomId={roomId}
        user={user}
        onPlayAgain={() => setStage("gameselect")}
        onLeaveRoom={async () => {
          if (roomId && user) {
            try {
              await leaveRoom(roomId, user.uid);
            } catch {
              // best-effort, same reasoning as handleExit above
            }
          }
          setRoomId(null);
          setSelection(null);
          setStage("playmenu");
        }}
      />
    );
  } else {
    // Unreachable in normal use — every real stage is handled above.
    // Kept only as a safety net so an unexpected stage value never
    // renders a blank screen.
    screen = (
      <div style={{ position: "fixed", inset: 0, background: "#0a0714", color: "#39ff6a", padding: 24 }}>
        <p>Unknown stage: "{stage}"</p>
        <button onClick={handleExit}>Log out</button>
      </div>
    );
  }

  return (
    <>
      {screen}
      {stage !== "loading" && <SettingsOverlay onExit={handleExit} />}
    </>
  );
}