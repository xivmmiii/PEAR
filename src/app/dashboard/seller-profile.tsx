"use client";
import { useEffect, useState } from "react";

type StoreProfile = { email: string; brandName?: string; storeDescription?: string; phone?: string };

export function SellerProfile() {
  const [profile, setProfile] = useState<StoreProfile>({ email: "" });
  const [draft, setDraft] = useState<StoreProfile>({ email: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/profile").then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load store profile."))).then((data) => {
      const next = { email: data.profile.email ?? "", brandName: data.profile.brandName ?? "", storeDescription: data.profile.storeDescription ?? "", phone: data.profile.phone ?? "" };
      setProfile(next);
      setDraft(next);
    }).catch((error: Error) => setMessage(error.message)).finally(() => setLoading(false));
  }, []);

  function startEditing() {
    setDraft(profile);
    setMessage("");
    setEditing(true);
  }

  async function save() {
    if (!draft.brandName?.trim()) {
      setMessage("Store name is required.");
      return;
    }
    setMessage("Saving...");
    const response = await fetch("/api/seller/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const result = await response.json().catch(() => ({ message: "Could not update store profile." }));
    if (!response.ok) {
      setMessage(result.message);
      return;
    }
    const next = { ...draft, brandName: draft.brandName.trim(), storeDescription: draft.storeDescription?.trim(), phone: draft.phone?.trim() };
    setProfile(next);
    setDraft(next);
    setEditing(false);
    setMessage("Store profile updated.");
  }

  if (loading) return <section className="seller-panel-placeholder"><p>Loading store profile...</p></section>;
  return <section className="seller-panel-placeholder seller-profile"><div className="section-heading"><div><p className="eyebrow">Store settings</p><h2>Store profile</h2><p className="seller-products-help">Keep your public seller information up to date.</p></div>{!editing && <button type="button" className="edit-icon" onClick={startEditing} aria-label="Edit store profile">✎</button>}</div>{editing ? <div className="seller-profile-form"><label>Store name<input value={draft.brandName ?? ""} onChange={(event) => setDraft({ ...draft, brandName: event.target.value })} /></label><label>Store description<textarea rows={4} value={draft.storeDescription ?? ""} onChange={(event) => setDraft({ ...draft, storeDescription: event.target.value })} /></label><label>Contact phone<input inputMode="tel" value={draft.phone ?? ""} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><div className="seller-profile-actions"><button type="button" className="button button-dark" onClick={() => void save()}>Update</button><button type="button" className="button button-outline" onClick={() => { setDraft(profile); setEditing(false); setMessage(""); }}>Cancel</button></div></div> : <div className="seller-profile-details"><div><span>Store name</span><strong>{profile.brandName || "Not added"}</strong></div><div><span>Description</span><strong>{profile.storeDescription || "Not added"}</strong></div><div><span>Contact phone</span><strong>{profile.phone || "Not added"}</strong></div><div><span>Account email</span><strong>{profile.email}</strong></div></div>}{message && <p className={message === "Store profile updated." ? "form-success" : "form-error"}>{message}</p>}</section>;
}
