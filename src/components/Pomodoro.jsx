import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase.js";

const modes = [
  { key: "focus", label: "Focus 25m", minutes: 25 },
  { key: "short", label: "Short break 5m", minutes: 5 },
  { key: "long", label: "Long break 15m", minutes: 15 },
];

const sounds = [
  { name: "White Noise", icon: "🌫️", url: "https://www.soundjay.com/misc/sounds/white-noise-1.mp3" },
  { name: "Fireplace", icon: "🔥", url: "https://www.soundjay.com/nature/sounds/fire-campfire-1.mp3" },
  { name: "Rain", icon: "🌧️", url: "https://www.soundjay.com/nature/sounds/rain-01.mp3" },
  { name: "Forest", icon: "🌲", url: "https://www.soundjay.com/nature/sounds/birds-forest-1.mp3" },
];

const emptyStats = {
  date: new Date().toISOString().slice(0, 10),
  sessionsToday: 0,
  minutesToday: 0,
  sessionsTotal: 0,
  minutesTotal: 0,
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Pomodoro({ user }) {
  const [mode, setMode] = useState(modes[0]);
  const [secondsLeft, setSecondsLeft] = useState(modes[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionsInCycle, setSessionsInCycle] = useState(0);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSound, setActiveSound] = useState(null);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const completedRef = useRef(false);

  const durationSeconds = mode.minutes * 60;
  const progress = 1 - secondsLeft / durationSeconds;
  const circumference = 2 * Math.PI * 92;
  const dashOffset = circumference * (1 - progress);

  async function loadStats() {
    setLoading(true);
    setError("");
    try {
      const ref = doc(db, "users", user.uid, "pomodoroStats", "summary");
      const snap = await getDoc(ref);
      const saved = snap.exists() ? snap.data() : emptyStats;
      const normalized = saved.date === todayKey() ? saved : { ...saved, date: todayKey(), sessionsToday: 0, minutesToday: 0 };
      setStats({ ...emptyStats, ...normalized });
      if (saved.date !== todayKey()) await setDoc(ref, normalized, { merge: true });
    } catch (err) {
      setError(err.message || "Could not load Pomodoro stats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [user.uid]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (secondsLeft !== 0 || completedRef.current) return;
    completedRef.current = true;
    setRunning(false);
    handleComplete();
  }, [secondsLeft]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setSecondsLeft(nextMode.minutes * 60);
    setRunning(false);
    completedRef.current = false;
  }

  async function handleComplete() {
    if (mode.key !== "focus") return;
    const nextStats = {
      ...stats,
      date: todayKey(),
      sessionsToday: stats.date === todayKey() ? stats.sessionsToday + 1 : 1,
      minutesToday: stats.date === todayKey() ? stats.minutesToday + 25 : 25,
      sessionsTotal: (stats.sessionsTotal || 0) + 1,
      minutesTotal: (stats.minutesTotal || 0) + 25,
    };
    setStats(nextStats);
    setSessionsInCycle((count) => (count + 1) % 4);
    try {
      await Promise.all([
        setDoc(doc(db, "users", user.uid, "pomodoroStats", "summary"), nextStats, { merge: true }),
        addDoc(collection(db, "users", user.uid, "sessions"), { duration: 25, completedAt: serverTimestamp() }),
      ]);
    } catch (err) {
      setError(err.message || "Could not save completed session.");
    }
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(mode.minutes * 60);
    completedRef.current = false;
  }

  function toggleSound(sound) {
    if (activeSound?.name === sound.name) {
      audioRef.current?.pause();
      audioRef.current = null;
      setActiveSound(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = muted ? 0 : volume / 100;
    audio.play().catch(() => setError("Audio playback was blocked. Click the sound card again to retry."));
    audioRef.current = audio;
    setActiveSound(sound);
  }

  const statCards = useMemo(
    () => [
      { label: "Sessions today", value: stats.sessionsToday || 0 },
      { label: "Hours today", value: formatHours(stats.minutesToday || 0) },
      { label: "Sessions total", value: stats.sessionsTotal || 0 },
      { label: "Hours total", value: formatHours(stats.minutesTotal || 0) },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Pomodoro</h2>
        <p className="mt-2 text-muted">Focus timer, session logging, and ambient sound in one place.</p>
      </div>
      {error ? <p className="rounded-cm border border-border bg-surface p-4 text-sm text-accent">{error}</p> : null}
      <section className="rounded-cm border border-border bg-surface p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {modes.map((item) => (
            <button className={`rounded-[10px] border px-3 py-2 font-bold ${mode.key === item.key ? "border-primary bg-primary text-white" : "border-border text-muted"}`} key={item.key} onClick={() => changeMode(item)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center">
          <div className="relative h-64 w-64">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="none" r="92" stroke="#2a2040" strokeWidth="14" />
              <circle cx="110" cy="110" fill="none" r="92" stroke="#7c3aed" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="14" />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-5xl font-black">{formatTime(secondsLeft)}</div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="rounded-[10px] bg-primary px-5 py-2 font-bold text-white" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : "Start"}
            </button>
            <button className="rounded-[10px] border border-border px-5 py-2 font-bold" onClick={resetTimer}>Reset</button>
          </div>
          <div className="mt-5 flex gap-2">
            {[0, 1, 2, 3].map((dot) => <span className={`h-3 w-3 rounded-full ${dot < sessionsInCycle ? "bg-primary" : "bg-bg"}`} key={dot} />)}
          </div>
          <p className="mt-3 text-sm text-muted">{stats.sessionsToday || 0} sessions completed today</p>
        </div>
      </section>

      <section className="rounded-cm border border-border bg-surface p-5">
        <h3 className="text-xl font-bold">Ambient sound</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sounds.map((sound) => (
            <button className={`rounded-cm border p-4 text-left ${activeSound?.name === sound.name ? "border-primary" : "border-border"}`} key={sound.name} onClick={() => toggleSound(sound)}>
              <span className="text-2xl">{sound.icon}</span>
              <span className="ml-3 font-bold">{sound.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="rounded-[10px] border border-border px-4 py-2" onClick={() => setMuted((value) => !value)}>
            {muted ? "Unmute" : "Mute"}
          </button>
          <input className="w-full accent-[#7c3aed]" max="100" min="0" onChange={(e) => setVolume(Number(e.target.value))} type="range" value={volume} />
          <span className="w-12 text-sm text-muted">{volume}%</span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div className="rounded-cm border border-border bg-surface p-5" key={card.label}>
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-black">{loading ? "..." : card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
