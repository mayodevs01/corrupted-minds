import { useState } from "react";
import { DISCORD_INVITE_URL } from "./config.js";
import Goals from "./components/Goals.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import Pomodoro from "./components/Pomodoro.jsx";
import Socials from "./components/Socials.jsx";
import Streak from "./components/Streak.jsx";
import Tasks from "./components/Tasks.jsx";

const navItems = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "discord", label: "Discord", icon: "🎮" },
  { key: "habits", label: "Habits", icon: "🔥" },
  { key: "pomodoro", label: "Pomodoro", icon: "⏱" },
  { key: "tasks", label: "Tasks", icon: "✅" },
  { key: "goals", label: "Goals", icon: "🎯" },
  { key: "socials", label: "Socials", icon: "🌐" },
];

export default function Dashboard({ user, onSignOut, authError }) {
  const [page, setPage] = useState("home");

  function selectPage(item) {
    if (item.key === "discord") {
      window.open(DISCORD_INVITE_URL, "_blank", "noreferrer");
      return;
    }
    setPage(item.key);
  }

  return (
    <div className="min-h-screen bg-bg text-body lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-surface p-4 lg:block">
        <div className="px-3 py-4 text-xl font-black">Corrupted Minds</div>
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <button
              className={`flex w-full items-center gap-3 rounded-cm px-3 py-3 text-left text-sm font-semibold ${
                page === item.key ? "bg-primary text-white" : "text-muted hover:bg-bg hover:text-body"
              }`}
              key={item.key}
              onClick={() => selectPage(item)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-black">Corrupted Minds</h1>
            <div className="flex min-w-0 items-center gap-3">
              {user.photoURL ? (
                <img
                  alt={user.displayName || "Profile"}
                  className="h-9 w-9 rounded-full border border-border"
                  src={user.photoURL}
                />
              ) : null}
              <span className="hidden max-w-[180px] truncate text-sm text-body sm:block">
                {user.displayName || "Student"}
              </span>
              <button
                className="rounded-[10px] border border-border px-3 py-2 text-sm text-body hover:border-primary"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
          {authError ? <p className="mt-2 text-sm text-accent">{authError}</p> : null}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {page === "home" ? <Streak user={user} setPage={setPage} /> : null}
          {page === "habits" ? <HabitTracker user={user} /> : null}
          {page === "pomodoro" ? <Pomodoro user={user} /> : null}
          {page === "tasks" ? <Tasks user={user} /> : null}
          {page === "goals" ? <Goals user={user} /> : null}
          {page === "socials" ? <Socials title="Community links" showNote /> : null}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-7 border-t border-border bg-surface lg:hidden">
        {navItems.map((item) => (
          <button
            className={`min-w-0 px-1 py-3 text-xs ${
              page === item.key ? "text-accent" : "text-muted"
            }`}
            key={item.key}
            onClick={() => selectPage(item)}
          >
            <span className="block text-lg">{item.icon}</span>
            <span className="block truncate">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
