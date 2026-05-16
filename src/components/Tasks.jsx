import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.js";

const tags = ["Maths", "Physics", "Chemistry", "Biology", "Coding", "English", "General"];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("General");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "tasks"));
      setTasks(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })).filter((task) => task.createdKey === todayKey()));
    } catch (err) {
      setError(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user.uid]);

  async function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;
    const task = { text: text.trim(), tag, done: false, createdKey: todayKey(), createdAt: serverTimestamp() };
    try {
      const ref = await addDoc(collection(db, "users", user.uid, "tasks"), task);
      setTasks((items) => [{ id: ref.id, ...task }, ...items]);
      setText("");
    } catch (err) {
      setError(err.message || "Could not add task.");
    }
  }

  async function toggleTask(task) {
    try {
      await updateDoc(doc(db, "users", user.uid, "tasks", task.id), { done: !task.done });
      setTasks((items) => items.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)));
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  }

  async function removeTask(id) {
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      setTasks((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  }

  const done = tasks.filter((task) => task.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black">Tasks</h2>
          <p className="mt-2 text-muted">Today's task list</p>
        </div>
        <p className="text-accent">{done} / {tasks.length} completed</p>
      </div>
      <form className="grid gap-3 rounded-cm border border-border bg-surface p-4 sm:grid-cols-[1fr_170px_auto]" onSubmit={addTask}>
        <input className="rounded-[10px] border border-border bg-bg px-3 py-2" onChange={(e) => setText(e.target.value)} placeholder="Add a study task..." value={text} />
        <select className="rounded-[10px] border border-border bg-bg px-3 py-2" onChange={(e) => setTag(e.target.value)} value={tag}>
          {tags.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button className="rounded-[10px] bg-primary px-5 py-2 font-bold text-white">Add</button>
      </form>
      {error ? <p className="rounded-cm border border-border bg-surface p-4 text-sm text-accent">{error}</p> : null}
      <section className="rounded-cm border border-border bg-surface p-4">
        {loading ? <p className="text-muted">Loading tasks...</p> : null}
        {!loading && !tasks.length ? <p className="text-muted">No tasks yet. Add one thing worth finishing today.</p> : null}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-bg p-3 sm:flex-row sm:items-center" key={task.id}>
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input checked={task.done} onChange={() => toggleTask(task)} type="checkbox" />
                <span className={`truncate ${task.done ? "text-muted line-through" : ""}`}>{task.text}</span>
              </label>
              <span className="w-fit rounded-full border border-border px-3 py-1 text-xs text-accent">{task.tag}</span>
              <button className="w-fit text-sm text-muted hover:text-accent" onClick={() => removeTask(task.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
