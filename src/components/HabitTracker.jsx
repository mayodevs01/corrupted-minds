import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase.js";

const tabs = ["Heatmap", "Table", "Stats"];
const weekKeys = ["M", "T", "W", "T2", "F", "S", "S2"];
const heatColors = ["#130f1e", "#2e1a5c", "#5b21b6", "#7c3aed", "#a78bfa"];
const categoryClasses = {
  Study: "border-primary text-accent",
  Health: "border-green-700 text-green-300",
  Mind: "border-yellow-700 text-yellow-300",
  Other: "border-fuchsia-700 text-fuchsia-300",
};

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function heatmapDays() {
  const days = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 25 * 7 + 1);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function streakFromKeys(keys) {
  const values = [...keys].sort();
  let longest = 0;
  let current = 0;
  let previous = null;
  for (const key of values) {
    const day = new Date(key);
    const expected = previous ? new Date(previous) : null;
    if (expected) expected.setDate(expected.getDate() + 1);
    current = expected && dateKey(expected) === key ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = day;
  }
  let active = 0;
  const cursor = new Date();
  while (keys.has(dateKey(cursor))) {
    active += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { active, longest };
}

export default function HabitTracker({ user }) {
  const [activeTab, setActiveTab] = useState("Heatmap");
  const [heatmap, setHeatmap] = useState({});
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [heatSnap, habitSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "habitHeatmap")),
        getDocs(collection(db, "users", user.uid, "habits")),
      ]);
      setHeatmap(Object.fromEntries(heatSnap.docs.map((entry) => [entry.id, entry.data().count || 0])));
      setHabits(habitSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
    } catch (err) {
      setError(err.message || "Could not load habits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.uid]);

  async function cycleHeatCell(key) {
    const next = ((heatmap[key] || 0) + 1) % 5;
    setHeatmap((value) => ({ ...value, [key]: next }));
    try {
      await setDoc(doc(db, "users", user.uid, "habitHeatmap", key), { count: next, updatedAt: serverTimestamp() });
    } catch (err) {
      setError(err.message || "Could not update heatmap.");
    }
  }

  async function addHabit(habit) {
    try {
      const created = { ...habit, streak: 0, week: {}, createdAt: serverTimestamp() };
      const ref = await addDoc(collection(db, "users", user.uid, "habits"), created);
      setHabits((items) => [...items, { id: ref.id, ...created }]);
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Could not add habit.");
    }
  }

  async function toggleHabit(habit, key) {
    const checked = !habit.week?.[key];
    const updated = {
      ...habit,
      week: { ...(habit.week || {}), [key]: checked },
      streak: Math.max(0, (habit.streak || 0) + (checked ? 1 : -1)),
    };
    setHabits((items) => items.map((item) => (item.id === habit.id ? updated : item)));
    try {
      await updateDoc(doc(db, "users", user.uid, "habits", habit.id), {
        [`week.${key}`]: checked,
        streak: increment(checked ? 1 : -1),
      });
    } catch (err) {
      setError(err.message || "Could not update habit.");
    }
  }

  async function deleteHabit(id) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "habits", id));
      setHabits((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete habit.");
    }
  }

  if (loading) return <Panel>Loading habit data...</Panel>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black">Habits</h2>
          <p className="mt-2 text-muted">Build your study rhythm one check-in at a time.</p>
        </div>
        {activeTab === "Table" ? (
          <button className="rounded-[10px] bg-primary px-4 py-2 font-bold text-white" onClick={() => setModalOpen(true)}>
            + New habit
          </button>
        ) : null}
      </div>
      <div className="flex rounded-cm border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            className={`flex-1 rounded-[10px] px-3 py-2 text-sm font-bold ${activeTab === tab ? "bg-primary text-white" : "text-muted"}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {error ? <p className="rounded-cm border border-border bg-surface p-4 text-sm text-accent">{error}</p> : null}
      {activeTab === "Heatmap" ? <Heatmap heatmap={heatmap} onCellClick={cycleHeatCell} /> : null}
      {activeTab === "Table" ? <HabitTable habits={habits} onToggle={toggleHabit} onDelete={deleteHabit} /> : null}
      {activeTab === "Stats" ? <HabitStats habits={habits} heatmap={heatmap} /> : null}
      {modalOpen ? <HabitModal onCancel={() => setModalOpen(false)} onSave={addHabit} /> : null}
    </div>
  );
}

function Heatmap({ heatmap, onCellClick }) {
  const days = useMemo(heatmapDays, []);
  const weeks = Array.from({ length: 25 }, (_, week) => days.slice(week * 7, week * 7 + 7));
  const completedKeys = new Set(Object.entries(heatmap).filter(([, count]) => count > 0).map(([key]) => key));
  const stats = streakFromKeys(completedKeys);
  const thisYear = Object.entries(heatmap).filter(([key, count]) => key.startsWith(String(new Date().getFullYear())) && count > 0).length;

  return (
    <section className="overflow-x-auto rounded-cm border border-border bg-surface p-5">
      <div className="ml-9 flex min-w-[820px] gap-[6px] text-xs text-muted">
        {weeks.map((week, index) => (
          <div className="w-7" key={index}>
            {index % 4 === 0 ? week[0].toLocaleString("default", { month: "short" }) : ""}
          </div>
        ))}
      </div>
      <div className="mt-2 flex min-w-[860px] gap-2">
        <div className="grid grid-rows-7 gap-[6px] text-xs text-muted">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
            <div className="h-7" key={`${label}-${index}`}>{label}</div>
          ))}
        </div>
        <div className="flex gap-[6px]">
          {weeks.map((week, weekIndex) => (
            <div className="grid grid-rows-7 gap-[6px]" key={weekIndex}>
              {week.map((day) => {
                const key = dateKey(day);
                const count = heatmap[key] || 0;
                return (
                  <button
                    aria-label={`${key}: ${count} habits`}
                    className="h-7 w-7 rounded-[6px] border border-border"
                    key={key}
                    onClick={() => onCellClick(key)}
                    style={{ backgroundColor: heatColors[count] }}
                    title={`${key}: ${count}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Pill label="Current streak" value={stats.active} />
          <Pill label="Longest streak" value={stats.longest} />
          <Pill label="This year" value={thisYear} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          Less {heatColors.map((color) => <span className="h-4 w-4 rounded-[4px] border border-border" key={color} style={{ backgroundColor: color }} />)} More
        </div>
      </div>
    </section>
  );
}

function HabitTable({ habits, onToggle, onDelete }) {
  if (!habits.length) return <Panel>No habits yet. Add one from the button above and start stacking wins.</Panel>;
  return (
    <section className="overflow-x-auto rounded-cm border border-border bg-surface">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            {["Habit", "Category", "Streak", "M", "T", "W", "T", "F", "S", "S", "Week progress", ""].map((head, index) => (
              <th className="px-4 py-3 font-semibold" key={`${head}-${index}`}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr className="border-b border-border last:border-0" key={habit.id}>
              <td className="px-4 py-3 font-bold">{habit.emoji || "📌"} {habit.name}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full border px-2 py-1 text-xs ${categoryClasses[habit.category] || categoryClasses.Other}`}>
                  {habit.category}
                </span>
              </td>
              <td className="px-4 py-3">🔥 {habit.streak || 0}</td>
              {weekKeys.map((key) => (
                <td className="px-4 py-3" key={key}>
                  <input checked={Boolean(habit.week?.[key])} onChange={() => onToggle(habit, key)} type="checkbox" />
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {weekKeys.map((key) => <span className={`h-3 w-3 rounded-[3px] ${habit.week?.[key] ? "bg-primary" : "bg-bg"}`} key={key} />)}
                </div>
              </td>
              <td className="px-4 py-3">
                <button className="text-muted hover:text-accent" onClick={() => onDelete(habit.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function HabitStats({ habits, heatmap }) {
  const totalCheckIns = Object.values(heatmap).reduce((sum, count) => sum + count, 0);
  const completions = habits.map((habit) => Object.values(habit.week || {}).filter(Boolean).length);
  const avg = habits.length ? Math.round((completions.reduce((a, b) => a + b, 0) / (habits.length * 7)) * 100) : 0;
  const ranked = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Total check-ins" value={totalCheckIns} />
        <Metric label="Avg weekly completion" value={`${avg}%`} />
        <Metric label="Number of habits" value={habits.length} />
      </div>
      <section className="rounded-cm border border-border bg-surface p-5">
        <h3 className="font-bold">Weekly completion</h3>
        {habits.length ? (
          <div className="mt-6 flex h-56 items-end gap-4 overflow-x-auto">
            {habits.map((habit) => {
              const pct = Math.round((Object.values(habit.week || {}).filter(Boolean).length / 7) * 100);
              return (
                <div className="flex min-w-16 flex-col items-center gap-2" key={habit.id}>
                  <div className="w-10 rounded-t-[8px] bg-primary" style={{ height: `${Math.max(8, pct * 1.8)}px` }} />
                  <span className="text-xl">{habit.emoji || "📌"}</span>
                  <span className="text-xs text-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        ) : <p className="mt-4 text-muted">No habits to chart yet.</p>}
      </section>
      <section className="rounded-cm border border-border bg-surface p-5">
        <h3 className="font-bold">Best streaks</h3>
        {ranked.length ? ranked.map((habit, index) => (
          <div className="mt-3 flex items-center justify-between rounded-[10px] border border-border bg-bg p-3" key={habit.id}>
            <span>{index + 1}. {habit.emoji || "📌"} {habit.name}</span>
            <span className="text-accent">🔥 {habit.streak || 0}</span>
          </div>
        )) : <p className="mt-4 text-muted">Streaks will appear after you add habits.</p>}
      </section>
    </div>
  );
}

function HabitModal({ onCancel, onSave }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [category, setCategory] = useState("Study");

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji: emoji.slice(0, 2), category });
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-bg/80 p-4">
      <form className="w-full max-w-md rounded-cm border border-border bg-surface p-5" onSubmit={submit}>
        <h3 className="text-xl font-bold">New habit</h3>
        <label className="mt-4 block text-sm text-muted">Name</label>
        <input className="mt-2 w-full rounded-[10px] border border-border bg-bg px-3 py-2 text-body" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="mt-4 block text-sm text-muted">Emoji</label>
        <input className="mt-2 w-full rounded-[10px] border border-border bg-bg px-3 py-2 text-body" maxLength={2} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        <label className="mt-4 block text-sm text-muted">Category</label>
        <select className="mt-2 w-full rounded-[10px] border border-border bg-bg px-3 py-2 text-body" value={category} onChange={(e) => setCategory(e.target.value)}>
          {["Study", "Health", "Mind", "Other"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-[10px] border border-border px-4 py-2" onClick={onCancel} type="button">Cancel</button>
          <button className="rounded-[10px] bg-primary px-4 py-2 font-bold text-white" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-cm border border-border bg-surface p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

function Pill({ label, value }) {
  return <span className="rounded-full border border-border bg-bg px-3 py-1 text-sm"><span className="text-muted">{label}: </span>{value}</span>;
}

function Panel({ children }) {
  return <div className="rounded-cm border border-border bg-surface p-6 text-muted">{children}</div>;
}
