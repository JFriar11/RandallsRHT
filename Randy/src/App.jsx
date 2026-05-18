import React, { useEffect, useRef, useState } from "react";
import { Play, Square, RotateCcw, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const PITCH_COOLDOWN_SECONDS = 15;
const CUE_DURATION_MS = 1500;
const MIN_DECISION_DELAY_MS = 500;
const MAX_DECISION_DELAY_MS = 700;

function getRandomCall() {
  return Math.random() < 0.7 ? "SWING" : "TAKE";
}

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [screenState, setScreenState] = useState("ready");
  const [call, setCall] = useState(null);
  const [countdown, setCountdown] = useState(PITCH_COOLDOWN_SECONDS);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  function clearTimers() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function playPitchSound() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const voiceCue = new SpeechSynthesisUtterance("Pitch");
      voiceCue.rate = 1.1;
      voiceCue.pitch = 1;
      voiceCue.volume = 1;

      window.speechSynthesis.speak(voiceCue);
    }

    if (navigator.vibrate) {
      navigator.vibrate(150);
    }
  }

  function resetDrill() {
    clearTimers();
    setIsRunning(false);
    setScreenState("ready");
    setCall(null);
    setCountdown(PITCH_COOLDOWN_SECONDS);
  }

  function startDrill() {
    playPitchSound();
    clearTimers();
    setIsRunning(true);
    setScreenState("waiting");
    setCall(null);
    setCountdown(PITCH_COOLDOWN_SECONDS);
  }

  function stopDrill() {
    clearTimers();
    setIsRunning(false);
    setScreenState("paused");
    setCall(null);
  }

  function getRandomDecisionDelay() {
    return (
      Math.floor(
        Math.random() *
          (MAX_DECISION_DELAY_MS - MIN_DECISION_DELAY_MS + 1)
      ) + MIN_DECISION_DELAY_MS
    );
  }

  useEffect(() => {
    clearTimers();

    if (!isRunning) {
      return;
    }

    if (screenState === "waiting") {
      setCountdown(PITCH_COOLDOWN_SECONDS);

      intervalRef.current = setInterval(() => {
        setCountdown((current) => {
          if (current <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            return 0;
          }

          return current - 1;
        });
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        playPitchSound();
        setScreenState("pitch");
      }, PITCH_COOLDOWN_SECONDS * 1000);
    }

    if (screenState === "pitch") {
      timeoutRef.current = setTimeout(() => {
        setCall(getRandomCall());
        setScreenState("decision");
      }, getRandomDecisionDelay());
    }

    if (screenState === "decision") {
      timeoutRef.current = setTimeout(() => {
        setCall(null);
        setScreenState("waiting");
      }, CUE_DURATION_MS);
    }

    return clearTimers;
  }, [isRunning, screenState]);

  const backgroundColor =
    call === "SWING" ? "black" : call === "TAKE" ? "#ef4444" : "#000000";

  const mainText =
    screenState === "ready"
      ? "Ready"
      : screenState === "paused"
      ? "Paused"
      : screenState === "waiting"
      ? countdown
      : "";

  const subText =
    screenState === "ready"
      ? "Press start!"
      : screenState === "paused"
      ? "Press start to continue."
      : screenState === "waiting"
      ? "Seconds until pitch voice cue."
      : "";

  const showMainText =
    screenState === "ready" || screenState === "paused" || screenState === "waiting";

  const buttonStyle = {
    height: "clamp(80px, 12vw, 120px)",
    borderRadius: "28px",
    fontSize: "clamp(24px, 4vw, 48px)",
    fontWeight: 800,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor,
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        boxSizing: "border-box",
        transition: "background-color 100ms linear",
      }}
    >
      <header style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 1,
            fontWeight: 900,
            margin: 0,
            color: "white",
          }}
        >
          RHT
        </h1>
        <p style={{ fontSize: "clamp(18px, 3vw, 36px)", marginTop: "18px", opacity: 0.8 }}>
          Randall
        </p>
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {showMainText && (
          <motion.div
            key={`${screenState}-${countdown}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div
              style={{
                fontSize: screenState === "waiting" ? "clamp(140px, 30vw, 320px)" : "clamp(72px, 10vw, 110px)",
                lineHeight: 1,
                fontWeight: 1000,
              }}
            >
              {mainText}
            </div>
            <p style={{ fontSize: "clamp(20px, 4vw, 44px)", marginTop: "28px", opacity: 0.82 }}>
              {subText}
            </p>
          </motion.div>
        )}
      </section>

      <footer
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {/* Test Voice Cue button removed for cleaner mobile layout */}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }}>
          {!isRunning ? (
            <button
              onClick={startDrill}
              style={{ ...buttonStyle, background: "white", color: "black" }}
            >
              <Play size={64} />
              Start
            </button>
          ) : (
            <button
              onClick={stopDrill}
              style={{ ...buttonStyle, background: "#d1d5db", color: "black" }}
            >
              <Square size={64} />
              Stop
            </button>
          )}

          <button
            onClick={resetDrill}
            style={{
              ...buttonStyle,
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "3px solid rgba(255,255,255,0.55)",
            }}
          >
            <RotateCcw size={64} />
            Reset
          </button>
        </div>
      </footer>
    </main>
  );
}
