"use client";

import { useState, type FormEvent } from "react";

const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint outline-none transition focus:border-line-strong";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Name + a valid email must be filled before the message can be written.
  const detailsReady = name.trim().length > 0 && emailValid;
  const canSend = detailsReady && message.trim().length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    // Interface only for now — just acknowledge. (Hook up to an API/email later.)
    setSent(true);
  }

  function reset() {
    setName("");
    setEmail("");
    setMessage("");
    setSent(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <p className="font-semibold text-fg">Thanks, {name.split(" ")[0]}! 🎉</p>
        <p className="mt-2 text-sm text-muted">
          Your message has been noted. I&apos;ll get back to you at {email}.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md border border-line px-4 py-2 text-sm text-fg transition hover:border-line-strong hover:bg-chip"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1 block text-sm text-muted">
            Name
          </label>
          <input
            id="cf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1 block text-sm text-muted">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="cf-message" className="mb-1 block text-sm text-muted">
          Message
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            detailsReady
              ? "What would you like to say?"
              : "Enter your name and email first…"
          }
          rows={5}
          disabled={!detailsReady}
          className={`${inputCls} resize-y ${
            !detailsReady ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
        {!detailsReady && (
          <p className="mt-1 text-xs text-faint">
            Add your name and a valid email to unlock the message box.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSend}
        className="mt-4 rounded-md border border-accent px-6 py-2.5 text-sm text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Send message
      </button>
    </form>
  );
}
