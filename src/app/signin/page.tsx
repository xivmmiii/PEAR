"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";

export default function SignIn() {
  const router = useRouter();
  const [role, setRole] = useState("shopper");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Welcome back" subtitle="Good to see you again.">
      <div className="role-tabs">
        <button className={role === "shopper" ? "selected" : ""} onClick={() => setRole("shopper")}>Shopper</button>
        <button className={role === "seller" ? "selected" : ""} onClick={() => setRole("seller")}>Seller</button>
      </div>
      <form className="auth-form" onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setLoading(true);
          const form = new FormData(event.currentTarget);
          try {
            const response = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), role }) });
            const responseText = await response.text();
            let result: { message?: string } = {};
            if (responseText) {
              try {
                result = JSON.parse(responseText) as { message?: string };
              } catch {
                result = {};
              }
            }
            if (!response.ok) setError(result.message ?? "Sign-in failed. Please try again.");
            else {
              router.push("/dashboard");
              router.refresh();
            }
          } catch {
            setError("We could not reach PEAR. Check your connection and try again.");
          } finally {
            setLoading(false);
          }
        }}>
          <label>Email address<input name="email" type="email" maxLength={254} placeholder="you@example.com" required /></label>
          <label>Password
            <div className="password">
              <input name="password" type={show ? "text" : "password"} maxLength={128} placeholder="Enter your password" required />
              <button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
            </div>
          </label>
          <div className="form-meta"><label className="check"><input type="checkbox" /> Remember me</label><Link href="/signin">Forgot password?</Link></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark full" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <span>↗</span></button>
          <div className="or"><span>or continue with</span></div>
          <a href="/api/auth/google" className="google-button">G <span>Continue with Google</span></a>
          <p className="auth-switch">New to PEAR? <Link href="/signup">Create an account</Link></p>
        </form>
    </AuthLayout>
  );
}
