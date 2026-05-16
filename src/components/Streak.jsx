import { collection, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase.js";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function weekDates() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

function currentStreak(keys) {
  const set = new Set(keys);
  let streak = 0;
  const cursor = new Date();
  while (set.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Streak({ user, setPage }) {
  const [studiedDays, setStudiedDays] = useState([]);
  const [habitsDone, setHabitsDone] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [activeGoals, setActiveGoals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = (user.displayName || "there").split(" ")[0];
  const week = useMemo(weekDates, []);
  const streak = currentStreak(studiedDays);

  async function loadHome() {
    setLoading(true);
    setError("");
    try {
      const [streakSnap, habitsSnap, tasksSnap, goalsSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "streak")),
        getDocs(collection(db, "users", user.uid, "habits")),
        getDocs(collection(db, "users", user.uid, "tasks")),
        getDocs(collection(db, "users", user.uid, "goals")),
      ]);
      setStudiedDays(streakSnap.docs.map((item) => item.id));
      setHabitsDone(
        habitsSnap.docs.reduce(
          (sum, item) => sum + Object.values(item.data().week || {}).filter(Boolean).length,
          0
        )
      );
      setTasksDone(tasksSnap.docs.filter((item) => item.data().done && item.data().createdKey === dateKey()).length);
      setActiveGoals(goalsSnap.size);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHome();
  }, [user.uid]);

  async function markToday() {
    try {
      const today = dateKey();
      await setDoc(doc(db, "users", user.uid, "streak", today), {
        studied: true,
        markedAt: serverTimestamp(),
      });
      setStudiedDays((days) => (days.includes(today) ? days : [...days, today]));
    } catch (err) {
      setError(err.message || "Could not mark today as studied.");
    }
  }

  if (loading) return <Panel>Loading your study dashboard...</Panel>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Hey, {firstName} 👋</h2>
        <p className="mt-2 text-muted">Your personal command center for focused study.</p>
      </div>
      {error ? <p className="rounded-cm border border-border bg-surface p-4 text-sm text-accent">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Current Streak" value={`${streak} days`} />
        <Stat label="Habits done this week" value={habitsDone} />
        <Stat label="Tasks completed today" value={tasksDone} />
        <Stat label="Active goals" value={activeGoals} />
      </div>
      <section className="rounded-cm border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold">Weekly streak</h3>
          <button className="rounded-[10px] bg-primary px-4 py-2 font-bold text-white" onClick={markToday}>
            Mark today as studied
          </button>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {week.map((date) => {
            const active = studiedDays.includes(dateKey(date));
            return (
              <div className="text-center" key={dateKey(date)}>
                <div className="mb-2 text-xs text-muted">{dayNames[date.getDay()]}</div>
                <div className={`mx-auto h-10 rounded-[10px] border ${active ? "border-primary bg-primary" : "border-border bg-bg"}`} />
              </div>
            );
          })}
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <button className="rounded-cm border border-border bg-surface p-5 text-left font-bold hover:border-primary" onClick={() => setPage("pomodoro")}>
          Go to Pomodoro →
        </button>
        <button className="rounded-cm border border-border bg-surface p-5 text-left font-bold hover:border-primary" onClick={() => setPage("habits")}>
          View Habits →
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-cm border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-cm border border-border bg-surface p-6 text-muted">{children}</div>;
}
