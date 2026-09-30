import React, { useEffect, useMemo, useRef, useState } from "react";
import SceneFrame from "./components/SceneFrame";
import { buildRound, checkAnswer, PASSING_RATIO } from "./data/quizQuestions";
import { addScore, listenToRoom, markFinished } from "./services/roomService";
import { markDifficultyPassed } from "./services/progressService";
import "./QuizScreen.css";

const OPTION_LETTERS = ["a", "b", "c", "d"];
const LANGUAGE_LABELS = { python: "PYTHON", javascript: "JAVASCRIPT", java: "JAVA", cpp: "C++" };
const FEEDBACK_MS = 2800; // long enough to read the explanation

/**
 * QuizScreen
 * ----------
 * 3-column layout:
 *   left   -> live rankings (everyone in the room, sorted by score)
 *   center -> status bar + terminal-style question panel
 *   right  -> countdown timer
 *
 * Questions come from data/quizQuestions.js (built from questionBank.json).
 * Each one carries its own points and time limit, and is either
 *   kind "choice" -> four buttons, or
 *   kind "text"   -> a typed answer (fill in the blank / predict the output).
 *
 * Props:
 *  - roomId, user, selection ({ language, difficulty })
 *  - onFinish (function): called once this player finishes all questions
 */
export default function QuizScreen({ roomId, user, selection, onFinish }) {
  const language = selection?.language;
  const difficulty = selection?.difficulty;

  // Fresh random order + shuffled options once per round.
  const questions = useMemo(() => buildRound(language, difficulty), [language, difficulty]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // choice questions
  const [typed, setTyped] = useState(""); // text questions
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [correctCount, setCorrectCount] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeMs ?? 0);
  const [finished, setFinished] = useState(false);
  const [room, setRoom] = useState(null);

  // true from the moment an answer (or timeout) is registered until the
  // next question is showing; stops a click and the timer expiring in
  // the same instant from both counting.
  const locked = useRef(false);
  const advanceTimer = useRef(null);
  const handleAnswerRef = useRef(null);
  const typedRef = useRef(""); // so the timer can submit whatever is typed when time runs out

  const question = questions[questionIndex];
  const limitMs = question?.timeMs || 1;
  const secondsLeft = Math.ceil(timeLeft / 1000);
  const accuracy = questionIndex > 0 ? Math.round((correctCount / questionIndex) * 100) : 0;

  useEffect(() => {
    const unsubscribe = listenToRoom(roomId, setRoom);
    return unsubscribe;
  }, [roomId]);

  // Don't let a pending "next question" fire after the screen is gone
  // (e.g. the player hit EXIT mid-quiz).
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // Always points at the newest handleAnswer, so the timer below never
  // calls a stale copy of it.
  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  useEffect(() => {
    if (feedback || finished) return;
    const current = questions[questionIndex];
    if (!current) return;

    const limit = current.timeMs;
    setTimeLeft(limit);
    const start = Date.now();
    const id = setInterval(() => {
      const remaining = limit - (Date.now() - start);
      if (remaining <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        // out of time: a typed answer still counts if it's right
        handleAnswerRef.current?.(current.kind === "text" ? typedRef.current : null);
      } else {
        setTimeLeft(remaining);
      }
    }, 200);

    return () => clearInterval(id);
  }, [questionIndex, feedback, finished, questions]);

  // `answer` is the chosen option index (choice) or the typed text (text).
  async function handleAnswer(answer) {
    if (locked.current) return;
    locked.current = true;

    const isCorrect = checkAnswer(question, answer);
    const isLast = questionIndex + 1 >= questions.length;
    const finalCorrect = correctCount + (isCorrect ? 1 : 0);
    const points = question.points;

    if (question.kind === "choice") setSelectedOption(answer);
    setFeedback(isCorrect ? "correct" : "wrong");

    // Advance on a timer that doesn't wait on the network, so a failed
    // or slow write can never leave the quiz stuck on this question.
    // On the last question `finished` flips in the same update that
    // clears the feedback, so the final question never becomes
    // clickable again while results are being saved.
    advanceTimer.current = setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setTyped("");
      typedRef.current = "";
      if (isLast) {
        setFinished(true);
      } else {
        locked.current = false;
        setQuestionIndex((i) => i + 1);
      }
    }, FEEDBACK_MS);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setMyScore((s) => s + points);
      try {
        await addScore(roomId, user.uid, points);
      } catch (err) {
        console.error("Couldn't save score:", err);
      }
    }

    if (isLast) await saveResults(finalCorrect);
  }

  // Runs after the last point has landed, so the leaderboard never sees
  // "finished" before the final score is in.
  async function saveResults(finalCorrect) {
    const passed = Boolean(selection) && finalCorrect / questions.length >= PASSING_RATIO;

    const writes = [markFinished(roomId, user.uid)];
    if (passed) writes.push(markDifficultyPassed(user.uid, selection.language, selection.difficulty));

    const results = await Promise.allSettled(writes);
    results.forEach((r) => {
      if (r.status === "rejected") console.error("Couldn't save quiz results:", r.reason);
    });
  }

  function handleTextChange(e) {
    setTyped(e.target.value);
    typedRef.current = e.target.value;
  }

  function handleTextSubmit(e) {
    e.preventDefault();
    if (!typed.trim()) return;
    handleAnswer(typed);
  }

  const players = room?.players ? Object.entries(room.players) : [];
  const rankings = players
    .filter(([, data]) => data.username)
    .map(([uid, data]) => ({ uid, username: data.username, score: data.score || 0 }))
    .sort((a, b) => b.score - a.score);

  if (!question) {
    return (
      <SceneFrame>
        <div className="quiz-screen">
          <div className="quiz-finished">
            <h2 className="quiz-finished__heading">NO QUESTIONS</h2>
            <p className="quiz-finished__score">Check the browser console for details.</p>
            <button type="button" className="quiz-finished__button" onClick={onFinish}>
              CONTINUE
            </button>
          </div>
        </div>
      </SceneFrame>
    );
  }

  return (
    <SceneFrame>
      <div className="quiz-screen">
        {/* ---------- left: live rankings ---------- */}
        <aside className="quiz-panel quiz-rankings">
          <h3 className="quiz-panel__title">LIVE RANKINGS</h3>
          <div className="quiz-rankings__list">
            {rankings.map((p, i) => (
              <div
                key={p.uid}
                className={"rank-row" + (p.uid === user.uid ? " rank-row--me" : "")}
              >
                <span className={"rank-row__badge rank-row__badge--" + (i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "plain")}>
                  {i + 1}
                </span>
                <span className="rank-row__name">{p.username}</span>
                <span className="rank-row__score">{p.score} pts</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ---------- center: status bar + terminal question ---------- */}
        <div className="quiz-center">
          {!finished ? (
            <>
              <div className="quiz-statusbar">
                <span className="status-pill">
                  {questionIndex + 1}/{questions.length}
                </span>
                <span className="status-pill status-pill--accent">{LANGUAGE_LABELS[language] || "JAVASCRIPT"}</span>
                <span className="status-pill status-pill--accent">{difficulty?.toUpperCase() || "BEGINNER"}</span>
                <span className="status-pill">{accuracy}%</span>
                <span className="status-pill status-pill--points">+{question.points}</span>
              </div>

              <div className="terminal">
                <div className="terminal__titlebar">
                  <span className="terminal__dot terminal__dot--red" />
                  <span className="terminal__dot terminal__dot--yellow" />
                  <span className="terminal__dot terminal__dot--green" />
                  <span className="terminal__title">TERMINAL — {question.typeLabel}</span>
                </div>

                <div className="terminal__body">
                  <p className="terminal__line terminal__line--muted">$ codeBuggies-cli --start</p>
                  <p className="terminal__line terminal__line--muted">&gt; loading question {questionIndex + 1}...</p>
                  <p className="terminal__line terminal__line--muted">
                    debug@codebuggies:~$ cat question_{questionIndex + 1}.txt
                  </p>
                  <p className="terminal__line terminal__prompt">// {question.prompt}</p>

                  {question.code && <pre className="terminal__code">{question.code}</pre>}

                  {question.kind === "choice" ? (
                    <div className="terminal__options">
                      {question.options.map((option, i) => {
                        let optionClass = "terminal-option";
                        if (feedback && i === question.correctIndex) optionClass += " terminal-option--correct";
                        else if (feedback && i === selectedOption) optionClass += " terminal-option--wrong";

                        return (
                          <button
                            key={i}
                            type="button"
                            className={optionClass}
                            onClick={() => handleAnswer(i)}
                            disabled={Boolean(feedback)}
                          >
                            <span className="terminal-option__letter">{OPTION_LETTERS[i]}.</span> {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <form className="terminal__answer" onSubmit={handleTextSubmit}>
                        <span className="terminal__answer-prompt">&gt;</span>
                        <input
                          key={questionIndex}
                          className={"terminal__input" + (feedback ? " terminal__input--" + feedback : "")}
                          type="text"
                          value={typed}
                          onChange={handleTextChange}
                          disabled={Boolean(feedback)}
                          placeholder="type your answer"
                          aria-label="Your answer"
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                          autoFocus
                        />
                        <button type="submit" className="terminal__run" disabled={Boolean(feedback) || !typed.trim()}>
                          RUN
                        </button>
                      </form>
                      {question.type === "Output Prediction" && !feedback && (
                        <p className="terminal__hint">// several lines of output? separate them with spaces</p>
                      )}
                    </>
                  )}

                  {feedback && (
                    <>
                      <p className={"terminal__line terminal__result terminal__result--" + feedback}>
                        {feedback === "correct" ? `✓ CORRECT  +${question.points}` : `✗ ANSWER: ${question.answerText}`}
                      </p>
                      {question.explanation && <p className="terminal__line terminal__explain">{question.explanation}</p>}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="quiz-finished">
              <h2 className="quiz-finished__heading">QUIZ COMPLETE</h2>
              <p className="quiz-finished__score">
                {correctCount} / {questions.length} correct — {myScore} points
              </p>
              <button type="button" className="quiz-finished__button" onClick={onFinish}>
                CONTINUE
              </button>
            </div>
          )}
        </div>

        {/* ---------- right: timer ---------- */}
        <aside className="quiz-panel quiz-timer-panel">
          <h3 className="quiz-panel__title">TIMER</h3>
          <div className="quiz-timer-panel__number">{finished ? "--" : secondsLeft}</div>
          <div className="quiz-timer-panel__bar">
            <div
              className="quiz-timer-panel__bar-fill"
              style={{ width: finished ? "0%" : `${(timeLeft / limitMs) * 100}%` }}
            />
          </div>
        </aside>
      </div>
    </SceneFrame>
  );
}