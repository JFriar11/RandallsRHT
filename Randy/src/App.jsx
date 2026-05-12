import React, { useEffect, useRef, useState } from "react";
import { Play, Square, RotateCcw, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const PITCH_COOLDOWN_SECONDS = 15;
const CUE_DURATION_MS = 1200;
const DECISION_DELAY_AFTER_SOUND_MS = 500;

function getRandomCall() {
  return Math.random() < 0.5 ? "SWING" : "TAKE";
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
      }, DECISION_DELAY_AFTER_SOUND_MS);
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
    call === "SWING" ? "#22c55e" : call === "TAKE" ? "#ef4444" : "#000000";

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
    height: "120px",
    borderRadius: "28px",
    fontSize: "48px",
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
            fontSize: "96px",
            lineHeight: 1,
            fontWeight: 900,
            margin: 0,
            color: "white",
          }}
        >
          Decision Trainer
        </h1>
        <p style={{ fontSize: "36px", marginTop: "18px", opacity: 0.8 }}>
          15-second tee drill
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
                fontSize: screenState === "waiting" ? "320px" : "110px",
                lineHeight: 1,
                fontWeight: 1000,
              }}
            >
              {mainText}
            </div>
            <p style={{ fontSize: "44px", marginTop: "28px", opacity: 0.82 }}>
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
