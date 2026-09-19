"use client";
import { useState } from "react";

export function ShopperTools() {
  const [message, setMessage] = useState("");
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/shopper/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setMessage(response.ok ? "Profile saved." : "Could not save profile.");
  }
  return <div className="shopper-tools"><div className="shopper-tool-card"><b>♡</b><h2>Wishlist</h2><p>Save pieces while you decide. Add them from any product card.</p><button className="button button-outline" onClick={() => setMessage("Your wishlist is ready for product picks.")}>View wishlist</button></div><div className="shopper-tool-card"><b>▢</b><h2>Bag & orders</h2><p>Your bag and future orders are protected in your PEAR account.</p><button className="button button-outline" onClick={() => setMessage("Checkout will use your saved bag and address.")}>View bag</button></div><form className="shopper-tool-card profile-form" onSubmit={saveProfile}><b>◒</b><h2>Profile</h2><input name="firstName" placeholder="First name" required /><input name="lastName" placeholder="Last name" required /><input name="phone" placeholder="Phone number" /><button className="button button-dark">Save profile</button></form>{message && <p className="form-error">{message}</p>}</div>;
}
