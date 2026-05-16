import { SOCIALS } from "../config.js";

export default function Socials({ title = "Community links", showNote = false }) {
  return (
    <section>
      <h2 className="text-3xl font-bold">{title}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOCIALS.map((social) => (
          <a
            className="rounded-cm border border-border bg-surface p-5 transition hover:border-primary"
            href={social.url}
            key={social.platform}
            rel="noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-[10px] border border-border text-2xl">
                {social.icon}
              </span>
              <div>
                <h3 className="font-bold text-body">{social.platform}</h3>
                <p className="mt-1 text-sm text-accent">{social.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      {showNote ? (
        <p className="mt-6 rounded-cm border border-border bg-surface p-4 text-sm text-muted">
          To update these links, edit the SOCIALS array in config.js
        </p>
      ) : null}
    </section>
  );
}
