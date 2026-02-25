"use client";
import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const handleMagicLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/auth/callback`
          : "/admin/auth/callback";

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to send magic link. Please try again.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for the magic link!",
        });
        setEmail("");
      }
    } catch {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleMagicLink} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full"
          autoComplete="email"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        We&apos;ll send you a secure link to sign in without a password.
      </p>
    </form>
  );
}
