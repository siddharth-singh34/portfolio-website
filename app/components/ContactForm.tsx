"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      <Card>
        <CardContent className="text-center">
          <p className="font-semibold">Thanks, {name.split(" ")[0]}! 🎉</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Your message has been noted. I&apos;ll get back to you at {email}.
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={reset}
            className="mt-4"
          >
            Send another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cf-name">Name</Label>
              <Input
                id="cf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cf-email">Email</Label>
              <Input
                id="cf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="cf-message">Message</Label>
            <Textarea
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
            />
            {!detailsReady && (
              <p className="text-muted-foreground text-xs">
                Add your name and a valid email to unlock the message box.
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={!canSend} className="mt-4">
            Send message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
