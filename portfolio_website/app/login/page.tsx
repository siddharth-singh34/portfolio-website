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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (res.status === 404) setError("Account does not exist");
        else if (res.status === 401) setError("Wrong password");
        else {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Something went wrong");
        }
        return;
      }

      const user = await res.json();
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
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>
              Welcome back — sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-xs"
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                {loading ? "Logging in…" : "Log in"}
              </Button>
            </form>

            <p className="text-muted-foreground mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Button asChild variant="link" className="h-auto p-0 text-orange-500">
                <a href="/signup">Sign up</a>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
