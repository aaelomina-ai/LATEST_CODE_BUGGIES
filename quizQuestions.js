/**
 * quizQuestions
 * -------------
 * Adapter between the question bank (questionBank.json, the file you
 * edit to change content) and QuizScreen (which needs ready-to-play
 * questions). Nothing here holds question text any more.
 *
 * How each type in the bank is played:
 *   Multiple Choice    -> 4 buttons
 *   Debugging          -> 4 buttons (wrong options come from debugChoices.js)
 *   Fill in the Blank  -> typed answer, graded against accepted_answers
 *   Output Prediction  -> typed answer, graded against accepted_answers
 *
 * Points and time limit come from each question (10/20/40 points and
 * 20/30/50 seconds by difficulty). Anything malformed is skipped with
 * a console warning instead of breaking the quiz, so check the browser
 * console after editing the bank.
 *
 * QUIZ_QUESTIONS_BY_LANGUAGE[language][difficulty] uses the ids from
 * GameSelectScreen (python / javascript / java / cpp) and progressService
 * (beginner / intermediate / hard).
 */

import bank from "./questionBank.json";
import { DEBUG_CHOICES } from "./debugChoices";

export const PASSING_RATIO = 0.65; // 7 of 10 correct clears a tier

const LANGUAGE_IDS = { Python: "python", JavaScript: "javascript", Java: "java", "C++": "cpp" };
const DIFFICULTY_IDS = { Beginner: "beginner", Intermediate: "intermediate", Hard: "hard" };
const TYPE_LABELS = {
  "Multiple Choice": "MULTIPLE CHOICE",
  "Fill in the Blank": "FILL IN THE BLANK",
  "Output Prediction": "PREDICT THE OUTPUT",
  Debugging: "FIND THE BUG",
};

function warn(id, message) {
  console.warn(`[quizQuestions] ${id}: ${message} (question skipped)`);
}

/* ------------------------------------------------------------------ */
/* Bank -> playable questions                                          */
/* ------------------------------------------------------------------ */

function toQuestion(raw) {
  const id = raw.question_id;
  const base = {
    id,
    type: raw.type,
    typeLabel: TYPE_LABELS[raw.type] || String(raw.type).toUpperCase(),
    prompt: raw.question,
    code: raw.code_snippet || null,
    explanation: raw.explanation || "",
    points: raw.points,
    timeMs: raw.time_limit_seconds * 1000,
    answerText: raw.correct_answer,
  };

  if (raw.type === "Multiple Choice") {
    const correctIndex = (raw.choices || []).indexOf(raw.correct_answer);
    if (correctIndex === -1) {
      warn(id, "correct_answer is not one of the choices");
      return null;
    }
    return { ...base, kind: "choice", options: raw.choices, correctIndex };
  }

  if (raw.type === "Debugging") {
    const entry = DEBUG_CHOICES[id];
    if (!entry) {
      warn(id, "no entry in debugChoices.js");
      return null;
    }
    // correct answer first; QuizScreen's round builder shuffles the positions
    return {
      ...base,
      kind: "choice",
      options: [entry.correct, ...entry.wrong],
      correctIndex: 0,
      answerText: entry.correct,
    };
  }

  if (raw.type === "Fill in the Blank" || raw.type === "Output Prediction") {
    return {
      ...base,
      kind: "text",
      matchMode: raw.type === "Fill in the Blank" ? "code" : "output",
      accepted: [raw.correct_answer, ...(raw.accepted_answers || [])],
    };
  }

  warn(id, `unknown type "${raw.type}"`);
  return null;
}

export const QUIZ_QUESTIONS_BY_LANGUAGE = {};

for (const raw of bank.questions) {
  const language = LANGUAGE_IDS[raw.language];
  const difficulty = DIFFICULTY_IDS[raw.difficulty];
  if (!language || !difficulty) {
    warn(raw.question_id, `unknown language/difficulty "${raw.language}" / "${raw.difficulty}"`);
    continue;
  }
  const question = toQuestion(raw);
  if (!question) continue;

  if (!QUIZ_QUESTIONS_BY_LANGUAGE[language]) QUIZ_QUESTIONS_BY_LANGUAGE[language] = {};
  if (!QUIZ_QUESTIONS_BY_LANGUAGE[language][difficulty]) QUIZ_QUESTIONS_BY_LANGUAGE[language][difficulty] = [];
  QUIZ_QUESTIONS_BY_LANGUAGE[language][difficulty].push(question);
}

for (const language of Object.values(LANGUAGE_IDS)) {
  for (const difficulty of Object.values(DIFFICULTY_IDS)) {
    if (!QUIZ_QUESTIONS_BY_LANGUAGE[language]?.[difficulty]?.length) {
      console.warn(`[quizQuestions] no playable questions for ${language}/${difficulty}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* One round of a quiz                                                 */
/* ------------------------------------------------------------------ */

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function withShuffledOptions(question) {
  const order = shuffle(question.options.map((_, i) => i));
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

/**
 * The questions for one play-through: the tier's questions in a fresh
 * random order, with each multiple-choice question's options shuffled
 * too (so the right answer isn't always in the same slot). Falls back
 * to javascript/beginner if the requested tier has nothing playable.
 */
export function buildRound(language, difficulty) {
  const pool =
    QUIZ_QUESTIONS_BY_LANGUAGE[language]?.[difficulty] ||
    QUIZ_QUESTIONS_BY_LANGUAGE.javascript?.beginner ||
    [];
  return shuffle(pool).map((q) => (q.kind === "choice" ? withShuffledOptions(q) : q));
}

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

// Code answers: spacing, quotes, $ { } and a trailing ; or : don't matter.
//   "count+=1" == "count += 1",  "else:" == "else",  "age" == "{age}"
function normalizeCode(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[$`'"{}]/g, "")
    .replace(/[;:]+$/, "");
}

// Output answers: line breaks, commas, brackets, quotes and the words
// "then"/"and" are all just separators.
//   "52 then 3" == "52, 3" == "52\n3",   "[2, 4, 6]" == "2 4 6"
function normalizeOutput(text) {
  return String(text)
    .toLowerCase()
    .replace(/[[\]'"`,;]/g, " ")
    .replace(/\b(then|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Is `answer` right for `question`?
 *   choice questions: answer is the chosen option index
 *   text questions:   answer is the typed string
 * null/undefined (time ran out with nothing chosen or typed) is wrong.
 */
export function checkAnswer(question, answer) {
  if (answer === null || answer === undefined) return false;
  if (question.kind === "choice") return answer === question.correctIndex;

  const normalize = question.matchMode === "code" ? normalizeCode : normalizeOutput;
  const typed = normalize(answer);
  return typed !== "" && question.accepted.some((accepted) => normalize(accepted) === typed);
}