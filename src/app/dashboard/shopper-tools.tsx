"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = { firstName: string; lastName: string; phone: string };

export function ShopperTools() {
  const [message, setMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    fetch("/api/shopper/profile")
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.profile) {
          setProfile({
            firstName: result.profile.firstName ?? "",
            lastName: result.profile.lastName ?? "",
            phone: result.profile.phone ?? "",
          });
        }
      });
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/shopper/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      setProfile({
        firstName: String(values.firstName ?? ""),
        lastName: String(values.lastName ?? ""),
        phone: String(values.phone ?? ""),
      });
      setEditingProfile(false);
      setMessage("Profile saved.");
    } else {
      setMessage("Could not save profile.");
    }
  }

  return <div className="shopper-tools">
    <div className="shopper-tool-card">
      <b>♡</b><h2>Wishlist</h2><p>Save pieces while you decide. Add them from any product card.</p>
      <button className="button button-outline" onClick={() => setMessage("Your wishlist is ready for product picks.")}>View wishlist</button>
    </div>
    <div className="shopper-tool-card">
      <b>▢</b><h2>Orders</h2><p>Track deliveries and review everything you have bought from PEAR.</p>
      <Link className="button button-outline" href="/orders">View orders</Link>
    </div>
    <div className="shopper-tool-card profile-form">
      <b>◒</b><h2>Profile</h2>
      {editingProfile ? <form onSubmit={saveProfile}>
        <input name="firstName" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} placeholder="First name" required />
        <input name="lastName" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} placeholder="Last name" required />
        <input name="phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Phone number" />
        <button className="button button-dark">Save profile</button>
      </form> : <>
        <p>{[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Add your name"}{profile.phone && ` · ${profile.phone}`}</p>
        <button className="button button-outline" onClick={() => setEditingProfile(true)}>Edit profile</button>
      </>}
    </div>
    {message && <p className="form-error">{message}</p>}
  </div>;
}
