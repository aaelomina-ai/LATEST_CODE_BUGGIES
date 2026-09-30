import {
  ref,
  push,
  set,
  get,
  remove,
  onValue,
  onDisconnect,
  runTransaction,
} from "firebase/database";
import { db } from "../firebase";

export const COUNTDOWN_MS = 5000;
const MAX_PLAYERS = 4;
const MIN_PLAYERS_TO_COUNT = 2;

/* ------------------------------------------------------------------ */
/* Shared clock                                                        */
/* ------------------------------------------------------------------ */

// Firebase tells every client how far its own clock is from the
// server's. Using it for the countdown means a player whose computer
// clock is a few seconds off can't start the match early for everyone.
let serverOffset = 0;
onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
  serverOffset = snap.val() || 0;
});

/** "Now" on the server's clock. Use this instead of Date.now() for anything shared. */
export function serverNow() {
  return Date.now() + serverOffset;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function playerRef(roomId, uid) {
  return ref(db, `rooms/${roomId}/players/${uid}`);
}

function newPlayer(username) {
  return { username, joinedAt: serverNow(), score: 0, finished: false };
}

function playerCount(room) {
  return Object.keys(room?.players || {}).length;
}

/**
 * If this player's tab closes or their connection drops, Firebase
 * removes their entry itself. Without this, closing the tab left a
 * "ghost" player in the room forever.
 */
async function armDisconnectCleanup(roomId, uid) {
  try {
    await onDisconnect(playerRef(roomId, uid)).remove();
  } catch (err) {
    console.warn("Couldn't register disconnect cleanup:", err);
  }
}

/**
 * Adds the player to the room inside ONE transaction, so the "is it
 * full / has it started" checks and the write can't be split by another
 * player joining at the same moment.
 * Resolves true if the player is now in the room, false if it was full
 * or already in progress.
 */
async function joinRoom(roomId, uid, username) {
  const result = await runTransaction(ref(db, `rooms/${roomId}`), (room) => {
    // null can just mean "not in my local cache yet" — Firebase re-runs
    // this with the real data, so hand null back rather than aborting.
    if (!room) return room;

    room.players = room.players || {};

    if (!room.players[uid]) {
      if (room.status === "in_progress") return; // abort: already started
      if (playerCount(room) >= MAX_PLAYERS) return; // abort: full
      room.players[uid] = newPlayer(username);
    }

    if (room.status === "waiting" && playerCount(room) >= MIN_PLAYERS_TO_COUNT) {
      room.status = "counting";
      room.countdownStartedAt = serverNow();
    }

    return room;
  });

  const joined = result.committed && Boolean(result.snapshot.val()?.players?.[uid]);
  if (joined) await armDisconnectCleanup(roomId, uid);
  return joined;
}

/* ------------------------------------------------------------------ */
/* Finding / creating / joining rooms                                  */
/* ------------------------------------------------------------------ */

export async function findOrCreateQuickMatch(uid, username) {
  const roomsRef = ref(db, "rooms");
  const snapshot = await get(roomsRef);
  const rooms = snapshot.val() || {};

  // A room fills up during its countdown too, so "counting" rooms are
  // fair game. Fullest first, so matches fill instead of spreading thin.
  const candidates = Object.keys(rooms)
    .filter((id) => {
      const room = rooms[id];
      return room.type === "public" && room.status !== "in_progress" && playerCount(room) < MAX_PLAYERS;
    })
    .sort((a, b) => playerCount(rooms[b]) - playerCount(rooms[a]));

  // Someone else may grab the last seat between our read and our
  // write, so try each candidate in turn until one actually works.
  for (const id of candidates) {
    if (await joinRoom(id, uid, username)) return id;
  }

  const newRoomRef = push(roomsRef);
  await set(newRoomRef, {
    type: "public",
    status: "waiting",
    countdownStartedAt: null,
    createdAt: serverNow(),
    players: {
      [uid]: newPlayer(username),
    },
  });
  await armDisconnectCleanup(newRoomRef.key, uid);
  return newRoomRef.key;
}

export async function createPrivateRoom(uid, username) {
  const roomsRef = ref(db, "rooms");
  const newRoomRef = push(roomsRef);
  const code = randomCode();

  await set(newRoomRef, {
    type: "private",
    code,
    status: "waiting",
    countdownStartedAt: null,
    createdAt: serverNow(),
    players: {
      [uid]: newPlayer(username),
    },
  });

  await set(ref(db, `roomCodes/${code}`), newRoomRef.key);
  await armDisconnectCleanup(newRoomRef.key, uid);

  return { roomId: newRoomRef.key, code };
}

export async function joinPrivateRoomByCode(rawCode, uid, username) {
  const code = (rawCode || "").trim().toUpperCase();
  const codeSnap = await get(ref(db, `roomCodes/${code}`));
  const roomId = codeSnap.val();

  if (!roomId) {
    throw new Error("No room found with that code.");
  }

  const roomSnap = await get(ref(db, `rooms/${roomId}`));
  const room = roomSnap.val();

  if (!room) {
    throw new Error("That room no longer exists.");
  }
  if (room.status === "in_progress") {
    throw new Error("That room has already started.");
  }

  // The real full/started check happens inside the transaction.
  const joined = await joinRoom(roomId, uid, username);
  if (!joined) {
    throw new Error("That room is full or has just started.");
  }
  return roomId;
}

/* ------------------------------------------------------------------ */
/* Per-player writes                                                   */
/* ------------------------------------------------------------------ */
// These are transactions on the player's own node that only write if
// the player still exists. A plain set/update on a deeper path would
// re-create a half-empty player (no username) if they'd already left.

/**
 * Records the language/difficulty picked in the Learning Hub, and
 * starts this player's round fresh: score back to 0, not finished.
 * (Without the reset, "play again" kept adding to the last round's score.)
 */
export async function setPlayerSelection(roomId, uid, selection) {
  await runTransaction(playerRef(roomId, uid), (player) =>
    player ? { ...player, selection, score: 0, finished: false } : player
  );
}

/**
 * Atomically adds `points` to a player's score. A transaction (not a
 * plain set) so quick successive answers can't drop points in a race.
 */
export async function addScore(roomId, uid, points) {
  await runTransaction(playerRef(roomId, uid), (player) =>
    player ? { ...player, score: (player.score || 0) + points } : player
  );
}

/** Marks this player as done with their quiz, so the leaderboard knows. */
export async function markFinished(roomId, uid) {
  await runTransaction(playerRef(roomId, uid), (player) =>
    player ? { ...player, finished: true } : player
  );
}

export function listenToRoom(roomId, callback) {
  const roomRef = ref(db, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/* ------------------------------------------------------------------ */
/* Leaving and starting                                                */
/* ------------------------------------------------------------------ */

export async function leaveRoom(roomId, uid) {
  // Leaving on purpose, so the automatic disconnect cleanup isn't needed.
  try {
    await onDisconnect(playerRef(roomId, uid)).cancel();
  } catch {
    // best-effort
  }

  // One transaction, so two players leaving at the same moment can't
  // each think the other is still there and leave an empty room behind.
  let emptiedRoomCode = null;
  await runTransaction(ref(db, `rooms/${roomId}`), (room) => {
    emptiedRoomCode = null; // this function can run more than once; only the last run counts
    if (!room) return room;

    const players = { ...(room.players || {}) };
    delete players[uid];

    if (Object.keys(players).length === 0) {
      if (room.type === "private" && room.code) emptiedRoomCode = room.code;
      return null; // deletes the room
    }

    room.players = players;
    if (room.status === "counting" && Object.keys(players).length < MIN_PLAYERS_TO_COUNT) {
      room.status = "waiting";
      room.countdownStartedAt = null;
    }
    return room;
  });

  if (emptiedRoomCode) {
    await remove(ref(db, `roomCodes/${emptiedRoomCode}`));
  }
}

/**
 * Called by every lobby client when the countdown hits zero; the
 * transaction makes sure it only takes effect once. If people dropped
 * out during the countdown (e.g. closed the tab), fall back to
 * waiting instead of starting a match with one player.
 */
export async function tryStartMatch(roomId) {
  await runTransaction(ref(db, `rooms/${roomId}`), (room) => {
    if (!room) return room;
    if (room.status !== "counting") return; // already handled, nothing to do

    if (playerCount(room) >= MIN_PLAYERS_TO_COUNT) {
      room.status = "in_progress";
    } else {
      room.status = "waiting";
      room.countdownStartedAt = null;
    }
    return room;
  });
}