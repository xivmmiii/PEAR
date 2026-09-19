"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";

export default function SignUp() {
  const [role, setRole] = useState("shopper");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Join PEAR" subtitle="Your next favourite thing is here.">
      <div className="role-cards">
        <button className={role === "shopper" ? "selected" : ""} onClick={() => setRole("shopper")}><b>◒</b><span><strong>Shopper</strong><small>Discover your style</small></span></button>
        <button className={role === "seller" ? "selected" : ""} onClick={() => setRole("seller")}><b>◈</b><span><strong>Seller</strong><small>Grow your label</small></span></button>
      </div>
      {sent ? (
        <div className="success-message"><span>✦</span><h3>Welcome to PEAR!</h3><p>Your {role} account is ready.</p><Link href="/dashboard" className="button button-dark">Open your dashboard <span>↗</span></Link></div>
      ) : (
        <form className="auth-form" onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setLoading(true);
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), brandName: form.get("brandName"), email: form.get("email"), password: form.get("password"), role }) });
          const result = await response.json();
          setLoading(false);
          if (!response.ok) setError(result.message);
          else setSent(true);
        }}>
          <div className="form-split"><label>First name<input name="firstName" required placeholder="Aarav" /></label><label>Last name<input name="lastName" required placeholder="Shah" /></label></div>
          {role === "seller" && <label>Brand / store name<input name="brandName" required placeholder="Your label" /></label>}
          <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
          <label>Create password<input name="password" type="password" minLength={8} required placeholder="8+ characters" /></label>
          <label className="check terms"><input type="checkbox" required /> I agree to PEAR&apos;s <Link href="/signup">Terms & conditions</Link> and Privacy Policy.</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark full" disabled={loading}>{loading ? "Creating account..." : "Create account"} <span>↗</span></button>
          <p className="auth-switch">Already have an account? <Link href="/signin">Sign in</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
