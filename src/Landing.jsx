import { useState } from "react";
import { DISCORD_INVITE_URL, SOCIALS } from "./config.js";
import Socials from "./components/Socials.jsx";

const aboutCards = [
  {
    icon: "📚",
    title: "Study Together",
    desc: "Accountability rooms, group sessions, and Pomodoro timers with real people.",
  },
  {
    icon: "🎯",
    title: "Track Your Goals",
    desc: "Set study goals, track streaks, and build habits that actually stick.",
  },
  {
    icon: "🧠",
    title: "Share Resources",
    desc: "Notes, guides, and study material shared by the community, for the community.",
  },
];

const featureSections = [
  {
    key: "pomodoro",
    label: "Pomodoro",
    eyebrow: "POMODORO",
    title: "Deep focus, one session at a time.",
    body:
      "A clean Pomodoro timer with focus, short break, and long break modes. Every completed focus session is logged automatically so your study hours flow straight into your dashboard.",
    bullets: [
      "Focus, short break, and long break timers",
      "Ambient audio with white noise, rain, fireplace, and forest",
      "Auto-logged focus minutes per day",
      "Daily and lifetime Pomodoro stats",
    ],
    cta: "Start a session",
    mockup: "timer",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    eyebrow: "DASHBOARD",
    title: "See your effort. Build the streak.",
    body:
      "Your dashboard pulls every study mark, task, goal, habit, and focus session into one place, so consistency becomes visible instead of vague.",
    bullets: [
      "Weekly study streak dots",
      "Current and longest streak tracking",
      "Habits, tasks, and active goals at a glance",
      "Quick links into your study tools",
    ],
    cta: "Open dashboard",
    mockup: "dashboard",
  },
  {
    key: "habits",
    label: "Habits",
    eyebrow: "HABITS",
    title: "Turn discipline into a visible pattern.",
    body:
      "Track habits in a heatmap, a Notion-style table, and a stats view. Add habit categories, weekly checks, streak badges, and leaderboard-style best streaks.",
    bullets: [
      "25-week contribution heatmap",
      "Study, health, mind, and other categories",
      "Weekly progress dots for every habit",
      "Stats and best streak leaderboard",
    ],
    cta: "Track habits",
    mockup: "heatmap",
  },
  {
    key: "tasks",
    label: "Tasks & Goals",
    eyebrow: "TASKS + GOALS",
    title: "Plan today without losing the bigger target.",
    body:
      "Keep today's tasks simple, tagged, and finishable, then connect that work to larger goals with progress bars and countdowns.",
    bullets: [
      "Daily task list with subject tags",
      "Done/undone toggles and completion count",
      "Goal cards with days-left countdowns",
      "Manual progress and time-elapsed bars",
    ],
    cta: "Plan the day",
    mockup: "tasks",
  },
  {
    key: "socials",
    label: "Socials",
    eyebrow: "COMMUNITY LINKS",
    title: "One community, everywhere you already are.",
    body:
      "Discord stays at the center, with Instagram, Twitter / X, YouTube, and Telegram links driven by one simple config file.",
    bullets: [
      "Config-driven social cards",
      "Discord invite in every main CTA",
      "Easy link updates in src/config.js",
      "Same links inside the dashboard",
    ],
    cta: "View links",
    mockup: "links",
  },
];

export default function Landing({ onLogin, authError }) {
  const [activeFeature, setActiveFeature] = useState(featureSections[0]);
  const footerLinks = SOCIALS.filter((social) =>
    ["Discord", "Instagram", "Twitter / X"].includes(social.platform)
  );

  function selectFeature(feature) {
    setActiveFeature(feature);
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-[#050509] text-body">
      <header className="sticky top-0 z-20 border-b border-[#1b1724] bg-[#050509]/95">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a className="flex items-center gap-2 text-sm font-black text-white" href="#top">
            <span className="grid h-7 w-7 place-items-center rounded-[10px] border border-primary/50 bg-[#191129] text-accent">
              ♧
            </span>
            Corrupted Minds
          </a>
          <div className="hidden items-center gap-8 text-sm text-muted sm:flex">
            <a className="hover:text-white" href="#about">
              About
            </a>
            <a className="hover:text-white" href="#features">
              Features
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden text-sm font-bold text-white sm:inline" onClick={onLogin}>
              Sign in
            </button>
            <a
              className="rounded-[10px] bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-accent hover:text-[#050509]"
              href={DISCORD_INVITE_URL}
              rel="noreferrer"
              target="_blank"
            >
              Join
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative grid min-h-[calc(100vh-54px)] place-items-center overflow-hidden border-b border-[#1b1724] px-4 py-16 text-center">
          <div className="absolute inset-x-0 top-0 mx-auto h-56 max-w-3xl bg-[#1a1230]" />
          <div className="relative z-10 flex max-w-4xl flex-col items-center">
            <div className="mb-8 rounded-full border border-primary/60 bg-[#171027] px-4 py-1 text-xs font-bold text-accent">
              • Study community · Discord
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-7xl">
              Learn hard.
              <span className="block text-accent">Think deeper.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#a8a0b8]">
              A community of focused learners and accountability partners built for students who take their growth seriously.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="rounded-cm bg-primary px-7 py-4 text-sm font-black text-white hover:bg-accent hover:text-[#050509]"
                href={DISCORD_INVITE_URL}
                rel="noreferrer"
                target="_blank"
              >
                Join the Server
              </a>
              <button
                className="rounded-cm border border-border bg-[#07070c] px-7 py-4 text-sm font-black text-white hover:border-primary"
                onClick={onLogin}
              >
                See the App
              </button>
            </div>
            <a
              aria-label="Scroll to about"
              className="mt-16 grid h-10 w-10 place-items-center rounded-full border border-border text-muted hover:border-primary hover:text-white"
              href="#about"
            >
              ↓
            </a>
            {authError ? <p className="mt-5 text-sm text-accent">{authError}</p> : null}
          </div>
        </section>

        <section id="about" className="border-b border-[#1b1724] px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-black tracking-[0.22em] text-accent">ABOUT</p>
                <h2 className="mt-4 text-4xl font-black leading-tight text-white">
                  Built for people who show up when it is quiet.
                </h2>
              </div>
              <p className="text-lg leading-8 text-[#a8a0b8]">
                Corrupted Minds is a study Discord community with a personal dashboard layered on top. Join the server publicly, then sign in when you want your own streaks, habits, focus sessions, tasks, and goals saved under your account.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {aboutCards.map((card) => (
                <article className="rounded-cm border border-border bg-[#090910] p-6" key={card.title}>
                  <div className="text-3xl">{card.icon}</div>
                  <h3 className="mt-5 text-xl font-black text-white">{card.title}</h3>
                  <p className="mt-3 leading-7 text-[#a8a0b8]">{card.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-[#1b1724] px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.22em] text-accent">FEATURES</p>
                <h2 className="mt-4 text-4xl font-black text-white">Select what you want to explore.</h2>
              </div>
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-cm border border-border bg-[#090910] p-1">
                {featureSections.map((feature) => (
                  <button
                    className={`whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-bold ${
                      activeFeature.key === feature.key
                        ? "bg-primary text-white"
                        : "text-muted hover:text-white"
                    }`}
                    key={feature.key}
                    onClick={() => selectFeature(feature)}
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>
            <FeatureDetail feature={activeFeature} onLogin={onLogin} />
          </div>
        </section>

        <section id="socials" className="mx-auto max-w-5xl px-4 py-20">
          <Socials title="Find us everywhere" />
        </section>

        <section className="px-4 py-24">
          <div className="mx-auto max-w-3xl rounded-[14px] border border-primary/70 bg-[#080910] p-10 text-center sm:p-14">
            <h2 className="text-4xl font-black text-white">Ready to get serious?</h2>
            <p className="mt-4 text-[#a8a0b8]">Join focused learners already showing up daily.</p>
            <a
              className="mt-8 inline-flex rounded-cm bg-primary px-7 py-4 text-sm font-black text-white hover:bg-accent hover:text-[#050509]"
              href={DISCORD_INVITE_URL}
              rel="noreferrer"
              target="_blank"
            >
              Join the Server
            </a>
            <div>
              <button className="mt-5 text-sm font-bold text-accent hover:text-white" onClick={onLogin}>
                Sign in to access your personal study dashboard →
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-4 border-t border-[#1b1724] px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2025 Corrupted Minds</p>
        <div className="flex flex-wrap gap-4">
          {footerLinks.map((social) => (
            <a className="hover:text-white" href={social.url} key={social.platform} rel="noreferrer" target="_blank">
              {social.platform}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function FeatureDetail({ feature, onLogin }) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs font-black tracking-[0.22em] text-accent">{feature.eyebrow}</p>
        <h3 className="mt-4 text-4xl font-black leading-tight text-white">{feature.title}</h3>
        <p className="mt-6 text-lg leading-8 text-[#a8a0b8]">{feature.body}</p>
        <ul className="mt-7 space-y-3">
          {feature.bullets.map((bullet) => (
            <li className="flex items-start gap-3 text-sm font-bold text-white" key={bullet}>
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-primary/50 bg-[#191129] text-xs text-accent">
                ✓
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <button
          className="mt-8 rounded-cm bg-primary px-6 py-3 text-sm font-black text-white hover:bg-accent hover:text-[#050509]"
          onClick={onLogin}
        >
          {feature.cta} →
        </button>
      </div>
      <FeatureMockup type={feature.mockup} />
    </div>
  );
}

function FeatureMockup({ type }) {
  if (type === "timer") return <TimerMockup />;
  if (type === "dashboard" || type === "heatmap") return <DashboardMockup dense={type === "heatmap"} />;
  if (type === "tasks") return <TasksMockup />;
  return <LinksMockup />;
}

function TimerMockup() {
  return (
    <div className="rounded-[14px] border border-primary/60 bg-[#080910] p-5">
      <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-cm bg-[#050509] p-6 text-center">
          <div className="mb-6 flex justify-center gap-3 text-xs text-muted">
            <span className="rounded-full bg-primary px-3 py-1 text-white">Focus</span>
            <span>Short</span>
            <span>Long</span>
          </div>
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border-[8px] border-primary text-3xl font-black text-white">
            34:12
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <span className="rounded-[10px] bg-primary px-3 py-2 text-xs">Ⅱ</span>
            <span className="rounded-[10px] border border-border px-3 py-2 text-xs">▷</span>
          </div>
        </div>
        <div className="rounded-cm bg-[#050509] p-5">
          <div className="mb-5 flex justify-between text-xs font-bold text-white">
            <span>Today</span>
            <span className="text-muted">2/4 done</span>
          </div>
          {["Physics rotation", "DSA trees revision", "Math integration", "Chem equilibrium"].map((task, index) => (
            <div className="mb-3 flex gap-2 text-xs text-white" key={task}>
              <span className={`mt-0.5 h-3 w-3 rounded-[4px] ${index < 2 ? "bg-primary" : "border border-border"}`} />
              <span className={index < 2 ? "text-muted line-through" : ""}>{task}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup({ dense = false }) {
  const cells = Array.from({ length: dense ? 126 : 84 }, (_, index) => index);
  return (
    <div className="rounded-[14px] border border-primary/60 bg-[#080910] p-6">
      <div className="grid grid-cols-3 gap-2">
        {["12d", "2h 40m", "3/5"].map((value, index) => (
          <div className="rounded-[10px] bg-[#050509] p-3" key={value}>
            <p className="text-[10px] uppercase text-muted">{["Streak", "Today", "Tasks"][index]}</p>
            <p className="mt-2 font-black text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-cm bg-[#050509] p-4">
        <p className="mb-3 text-[10px] uppercase text-muted">Heatmap</p>
        <div className="grid grid-cols-14 gap-1">
          {cells.map((cell) => (
            <span
              className={`h-4 rounded-[3px] ${
                cell % 11 === 0 ? "bg-accent" : cell % 3 === 0 ? "bg-primary" : cell % 4 === 0 ? "bg-[#3f2b75]" : "bg-[#11111a]"
              }`}
              key={cell}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 flex h-24 items-end gap-2 rounded-cm bg-[#050509] p-4">
        {[28, 46, 34, 66, 58, 80, 42].map((height, index) => (
          <span className="flex-1 rounded-t-[4px] bg-primary" key={index} style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}

function TasksMockup() {
  return (
    <div className="rounded-[14px] border border-primary/60 bg-[#080910] p-6">
      {["Finish calculus set", "Revise physics notes", "Ship coding challenge"].map((task, index) => (
        <div className="mb-3 flex items-center justify-between rounded-cm bg-[#050509] p-4" key={task}>
          <div className="flex items-center gap-3">
            <span className={`h-4 w-4 rounded-[5px] ${index === 0 ? "bg-primary" : "border border-border"}`} />
            <span className={index === 0 ? "text-muted line-through" : "text-white"}>{task}</span>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-accent">
            {["Maths", "Physics", "Coding"][index]}
          </span>
        </div>
      ))}
      <div className="mt-5 rounded-cm bg-[#050509] p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">Exam prep goal</span>
          <span className="text-white">65%</span>
        </div>
        <div className="h-3 rounded-full bg-[#11111a]">
          <div className="h-3 w-[65%] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

function LinksMockup() {
  return (
    <div className="grid gap-3 rounded-[14px] border border-primary/60 bg-[#080910] p-6 sm:grid-cols-2">
      {SOCIALS.map((social) => (
        <div className="rounded-cm bg-[#050509] p-4" key={social.platform}>
          <div className="text-2xl">{social.icon}</div>
          <p className="mt-3 font-black text-white">{social.platform}</p>
          <p className="mt-1 text-sm text-accent">{social.label}</p>
        </div>
      ))}
    </div>
  );
}
