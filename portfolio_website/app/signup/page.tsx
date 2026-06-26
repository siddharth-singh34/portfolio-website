"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API =
  process.env.NEXT_PUBLIC_API_URL ?? "https://portfolio-backend-o2f1.onrender.com";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        if (res.status === 409) setError("Account already exists");
        else {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Something went wrong");
        }
        return;
      }

      const user = await res.json();
      // Auto-log in after signup.
      localStorage.setItem(
        "user",
        JSON.stringify({ name: user.name, email: user.email })
      );
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/");
    } catch {
      setError("Can't reach the server — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto flex max-w-md flex-col px-6 py-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Sign up to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="text-muted-foreground mt-4 text-center text-sm">
              Already have an account?{" "}
              <Button asChild variant="link" className="h-auto p-0 text-orange-500">
                <a href="/login">Log in</a>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
