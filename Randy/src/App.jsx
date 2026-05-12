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
  const [repCount, setRepCount] = useState(0);
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
    setRepCount(0);
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
        const nextCall = getRandomCall();
        setCall(nextCall);
        setRepCount((current) => current + 1);
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

  const isSwing = call === "SWING";
  const isTake = call === "TAKE";

  const backgroundColor = isSwing
    ? "#22c55e"
    : isTake
    ? "#ef4444"
    : "#000000";

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
      ? "Press start. You should hear a test voice first."
      : screenState === "paused"
      ? "Press start to continue."
      : screenState === "waiting"
      ? "Seconds until pitch voice cue."
      : "";

  const showMainText =
    screenState === "ready" ||
    screenState === "paused" ||
    screenState === "waiting";

  return (
    <main
      className="min-h-screen text-white transition-colors duration-100"
      style={{ backgroundColor }}
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Decision Trainer</h1>
            <p className="text-sm opacity-80">15-second tee drill</p>
          </div>

          <div className="rounded-full bg-white/20 px-4 py-2">
            Rep {repCount}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {showMainText && (
            <motion.div
              key={`${screenState}-${countdown}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-center"
            >
              <div className="text-8xl font-black">{mainText}</div>
              <p className="mt-5 text-lg opacity-80">{subText}</p>
            </motion.div>
          )}
        </div>

        <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
          <div className="mb-4 grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="font-bold">Green Flash</div>
              <div className="opacity-75">Swing</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <div className="font-bold">Red Flash</div>
              <div className="opacity-75">Take</div>
            </div>
          </div>

          <button
            onClick={playPitchSound}
            className="mb-3 flex h-12 w-full items-center justify-center rounded-2xl bg-white/20 font-bold"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Test Voice Cue
          </button>

          <div className="grid grid-cols-2 gap-3">
            {!isRunning ? (
              <button
                onClick={startDrill}
                className="flex h-14 items-center justify-center rounded-2xl bg-white text-black font-bold"
              >
                <Play className="mr-2 h-5 w-5" />
                Start
              </button>
            ) : (
              <button
                onClick={stopDrill}
                className="flex h-14 items-center justify-center rounded-2xl bg-gray-300 text-black font-bold"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop
              </button>
            )}

            <button
              onClick={resetDrill}
              className="flex h-14 items-center justify-center rounded-2xl border border-white bg-transparent font-bold"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
