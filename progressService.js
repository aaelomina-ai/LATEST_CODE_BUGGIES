import { ref, get, set } from "firebase/database";
import { db } from "../firebase";

/**
 * progressService
 * ----------------
 * Tracks, per player, which (language, difficulty) tiers they've
 * cleared in the Learning Hub. Stored at `progress/{uid}` in the
 * Realtime Database, shaped like:
 *
 *   progress/{uid}/python/beginner       -> true
 *   progress/{uid}/python/intermediate   -> true
 *   progress/{uid}/javascript/beginner   -> true
 *   ...
 *
 * A tier that has never been passed simply has no key — treat any
 * missing value as "not passed" rather than writing explicit `false`s.
 */

export const DIFFICULTIES = ["beginner", "intermediate", "hard"];

/**
 * Fetches this player's full progress map once (not a live listener —
 * GameSelectScreen only needs it at load time to decide what's locked).
 * Returns {} for a brand-new player who hasn't passed anything yet.
 */
export async function getProgress(uid) {
  const snapshot = await get(ref(db, `progress/${uid}`));
  return snapshot.val() || {};
}

/**
 * beginner is always open. intermediate/hard unlock only once the
 * tier directly below them has been passed for that same language.
 */
export function isDifficultyUnlocked(progress, language, difficulty) {
  if (!language || !difficulty) return false;

  const index = DIFFICULTIES.indexOf(difficulty);
  if (index <= 0) return true; // beginner, or an unrecognized value — don't lock it

  const previousTier = DIFFICULTIES[index - 1];
  return Boolean(progress?.[language]?.[previousTier]);
}

/**
 * Called by QuizScreen once a player clears a quiz at >= PASSING_RATIO.
 * Idempotent — passing the same tier twice just writes `true` again.
 */
export async function markDifficultyPassed(uid, language, difficulty) {
  await set(ref(db, `progress/${uid}/${language}/${difficulty}`), true);
}