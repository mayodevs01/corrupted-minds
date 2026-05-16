import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysLeft(end) {
  return Math.max(0, Math.ceil((new Date(end) - new Date()) / 86400000));
}

function elapsed(start, end) {
  const total = new Date(end) - new Date(start);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((new Date() - new Date(start)) / total) * 100)));
}

export default function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState(dateKey(new Date(Date.now() + 7 * 86400000)));
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "goals"));
      setGoals(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
    } catch (err) {
      setError(err.message || "Could not load goals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.uid]);

  async function addGoal(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const goal = { title: title.trim(), startDate: dateKey(), endDate, progress: 0, createdAt: serverTimestamp() };
    try {
      const ref = await addDoc(collection(db, "users", user.uid, "goals"), goal);
      setGoals((items) => [{ id: ref.id, ...goal }, ...items]);
      setTitle("");
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not add goal.");
    }
  }

  async function changeProgress(goal, delta) {
    const progress = Math.min(100, Math.max(0, (goal.progress || 0) + delta));
    try {
      await updateDoc(doc(db, "users", user.uid, "goals", goal.id), { progress });
      setGoals((items) => items.map((item) => (item.id === goal.id ? { ...item, progress } : item)));
    } catch (err) {
      setError(err.message || "Could not update goal.");
    }
  }

  async function deleteGoal(id) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "goals", id));
      setGoals((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete goal.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black">Goals</h2>
          <p className="mt-2 text-muted">Active goals with manual progress and time tracking.</p>
        </div>
        <button className="rounded-[10px] bg-primary px-4 py-2 font-bold text-white" onClick={() => setShowForm((value) => !value)}>+ New goal</button>
      </div>
      {showForm ? (
        <form className="grid gap-3 rounded-cm border border-border bg-surface p-4 sm:grid-cols-[1fr_180px_auto]" onSubmit={addGoal}>
          <input className="rounded-[10px] border border-border bg-bg px-3 py-2" onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" value={title} />
          <input className="rounded-[10px] border border-border bg-bg px-3 py-2" min={dateKey()} onChange={(e) => setEndDate(e.target.value)} type="date" value={endDate} />
          <button className="rounded-[10px] bg-primary px-5 py-2 font-bold text-white">Save</button>
        </form>
      ) : null}
      {error ? <p className="rounded-cm border border-border bg-surface p-4 text-sm text-accent">{error}</p> : null}
      {loading ? <Panel>Loading goals...</Panel> : null}
      {!loading && !goals.length ? <Panel>No active goals yet. Create one target with a real finish line.</Panel> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const time = elapsed(goal.startDate, goal.endDate);
          return (
            <article className="rounded-cm border border-border bg-surface p-5" key={goal.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{goal.title}</h3>
                  <p className="mt-2 text-sm text-muted">{goal.startDate} → {goal.endDate}</p>
                </div>
                <button className="text-sm text-muted hover:text-accent" onClick={() => deleteGoal(goal.id)}>Delete</button>
              </div>
              <p className="mt-4 text-accent">{daysLeft(goal.endDate)} days left</p>
              <Progress label="Your progress" value={goal.progress || 0} />
              <Progress label="Time elapsed" value={time} />
              <div className="mt-5 flex flex-wrap gap-2">
                {[-5, 5, 10].map((delta) => (
                  <button className="rounded-[10px] border border-border px-3 py-2 text-sm hover:border-primary" key={delta} onClick={() => changeProgress(goal, delta)}>
                    {delta > 0 ? "+" : ""}{delta}%
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex justify-between text-sm"><span className="text-muted">{label}</span><span>{value}%</span></div>
      <div className="h-3 rounded-full bg-bg"><div className="h-3 rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-cm border border-border bg-surface p-6 text-muted">{children}</div>;
}
