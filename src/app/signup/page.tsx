"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState("shopper");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <AuthLayout title="Join PEAR" subtitle="Your next favourite thing is here.">
      <div className="role-cards">
        <button type="button" className={role === "shopper" ? "selected" : ""} onClick={() => setRole("shopper")}><b>◒</b><span><strong>Shopper</strong><small>Discover your style</small></span></button>
        <button type="button" className={role === "seller" ? "selected" : ""} onClick={() => setRole("seller")}><b>◈</b><span><strong>Seller</strong><small>Grow your label</small></span></button>
      </div>
      <form className="auth-form" onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setLoading(true);
          const form = new FormData(event.currentTarget);
          try {
            const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), brandName: form.get("brandName"), email: form.get("email"), password: form.get("password"), role }) });
            const responseText = await response.text();
            let result: { message?: string } = {};
            if (responseText) {
              try {
                result = JSON.parse(responseText) as { message?: string };
              } catch {
                result = {};
              }
            }
            if (!response.ok) setError(result.message ?? "Could not create your account. Please try again.");
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
          <div className="form-split"><label>First name<input name="firstName" minLength={2} maxLength={40} required placeholder="Aarav" /></label><label>Last name<input name="lastName" minLength={2} maxLength={40} required placeholder="Shah" /></label></div>
          {role === "seller" && <label>Brand / store name<input name="brandName" minLength={2} maxLength={60} required placeholder="Your label" /></label>}
          <label>Email address<input name="email" type="email" maxLength={254} required placeholder="you@example.com" /></label>
          <label>Create password<input name="password" type="password" minLength={8} maxLength={128} required placeholder="8+ characters" /></label>
          <label className="check terms"><input type="checkbox" required /> I agree to PEAR&apos;s <Link href="/signup">Terms & conditions</Link> and Privacy Policy.</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark full" disabled={loading}>{loading ? "Creating account..." : "Create account"} <span>↗</span></button>
          <p className="auth-switch">Already have an account? <Link href="/signin">Sign in</Link></p>
        </form>
    </AuthLayout>
  );
}
