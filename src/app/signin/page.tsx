"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";

export default function SignIn() {
  const [role, setRole] = useState("shopper");
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Welcome back" subtitle="Good to see you again.">
      <div className="role-tabs">
        <button className={role === "shopper" ? "selected" : ""} onClick={() => setRole("shopper")}>Shopper</button>
        <button className={role === "seller" ? "selected" : ""} onClick={() => setRole("seller")}>Seller</button>
      </div>
      {sent ? (
        <div className="success-message">
          <span>✓</span><h3>You&apos;re in the demo!</h3>
          <p>We&apos;ve received your details. In a real app, you&apos;d be on your way to your {role} dashboard.</p>
          <Link href="/dashboard" className="button button-dark">Continue to dashboard <span>↗</span></Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setLoading(true);
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), role }) });
          const result = await response.json();
          setLoading(false);
          if (!response.ok) setError(result.message);
          else setSent(true);
        }}>
          <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
          <label>Password
            <div className="password">
              <input name="password" type={show ? "text" : "password"} placeholder="Enter your password" required />
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
      )}
    </AuthLayout>
  );
}
