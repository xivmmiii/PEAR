"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Address } from "@/lib/mongodb";

type Profile = { firstName: string; lastName: string; phone: string; address: Address };

const emptyAddress: Address = { flatNo: "", landmark: "", area: "", city: "", state: "", pincode: "", country: "India" };

export function ShopperTools() {
  const [message, setMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({ firstName: "", lastName: "", phone: "", address: emptyAddress });
  const [editingSnapshot, setEditingSnapshot] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/shopper/profile")
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.profile) {
          setProfile({
            firstName: result.profile.firstName ?? "",
            lastName: result.profile.lastName ?? "",
            phone: result.profile.phone ?? "",
            address: { ...emptyAddress, ...(result.profile.address ?? {}) },
          });
        }
      });
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const address = {
      flatNo: String(values.flatNo ?? ""),
      landmark: String(values.landmark ?? ""),
      area: String(values.area ?? ""),
      city: String(values.city ?? ""),
      state: String(values.state ?? ""),
      pincode: String(values.pincode ?? ""),
      country: String(values.country ?? "India"),
    };
    const nextProfile = {
      firstName: String(values.firstName ?? ""),
      lastName: String(values.lastName ?? ""),
      phone: String(values.phone ?? ""),
      address,
    };
    if (editingSnapshot && JSON.stringify(nextProfile) === JSON.stringify(editingSnapshot)) {
      setEditingProfile(false);
      setEditingSnapshot(null);
      setMessage("");
      return;
    }
    const response = await fetch("/api/shopper/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: values.firstName, lastName: values.lastName, phone: values.phone, address }),
    });
    if (response.ok) {
      setProfile(nextProfile);
      setEditingProfile(false);
      setEditingSnapshot(null);
      setMessage("Profile saved.");
    } else {
      setMessage("Could not save profile.");
    }
  }

  return <div className="shopper-tools">
    <div className="shopper-tool-card">
      <b>♡</b><h2>Wishlist</h2><p>Save pieces while you decide. Add them from any product card.</p>
      <Link className="button button-outline" href="/wishlist">View wishlist</Link>
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
        <input name="flatNo" value={profile.address.flatNo} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, flatNo: event.target.value } })} placeholder="Flat / house number" required />
        <input name="landmark" value={profile.address.landmark} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, landmark: event.target.value } })} placeholder="Landmark" />
        <input name="area" value={profile.address.area} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, area: event.target.value } })} placeholder="Area / locality" required />
        <div className="form-split"><input name="city" value={profile.address.city} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, city: event.target.value } })} placeholder="City" required /><input name="state" value={profile.address.state} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, state: event.target.value } })} placeholder="State" required /></div>
        <div className="form-split"><input name="pincode" value={profile.address.pincode} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, pincode: event.target.value } })} placeholder="Pincode" inputMode="numeric" pattern="[0-9]{6}" required /><input name="country" value={profile.address.country} onChange={(event) => setProfile({ ...profile, address: { ...profile.address, country: event.target.value } })} placeholder="Country" required /></div>
        <button className="button button-dark">Save profile</button>
      </form> : <>
        <p>{[profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Add your name"}{profile.phone && ` · ${profile.phone}`}{profile.address.city && ` · ${profile.address.city}, ${profile.address.state}`}</p>
        <button className="button button-outline" onClick={() => {
          setEditingSnapshot({ ...profile, address: { ...profile.address } });
          setEditingProfile(true);
          setMessage("");
        }}>Edit profile</button>
      </>}
    </div>
    {message && <p className="form-error">{message}</p>}
  </div>;
}
