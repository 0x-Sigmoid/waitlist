"use client";
import { useEffect, useState } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const journeys = [
  { label: "Change authentication", nodes: ["Login", "Sessions", "User identity", "Billing", "Tests"], title: "One change. An unexpected connection.", detail: "You switched identity providers. Billing still maps customers using the old user ID.", state: "Conflicting", action: "Verify the customer mapping before you ship." },
  { label: "Delete an account", nodes: ["Delete button", "API route", "User record", "File storage", "Sessions"], title: "The account is gone. What about its files?", detail: "Deleting a database record may leave uploaded files behind. Follow the relationship to storage.", state: "Uncertain", action: "Verify file cleanup and active session invalidation." },
  { label: "Add team roles", nodes: ["Team settings", "Permissions", "Role schema", "Role selector", "Tests"], title: "Two pieces. Two different assumptions.", detail: "Your schema introduces a new role. The interface still offers the previous values.", state: "Conflicting", action: "Bring the role selector and schema into agreement." },
];
function Mark() { return <svg viewBox="0 0 28 24" aria-hidden="true"><path d="M4 12H24" stroke="currentColor" strokeWidth="1"/><circle cx="4" cy="12" r="2.5" fill="currentColor"/><circle cx="14" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="12" r="2.5" fill="currentColor"/></svg>; }

export default function Landing() {
  const [active, setActive] = useState("0"); const [selected, setSelected] = useState(3);
  const [email, setEmail] = useState(""); const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState(""); const [privacy, setPrivacy] = useState(false);

  async function join(value: string, website = "") {
    const clean = value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254) throw new Error("Enter a valid email address.");
    setStatus("saving"); setMessage("");
    try { const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clean, consent: true, website }) }); const body = await response.json() as { message?: string }; if (!response.ok) throw new Error(body.message || "We couldn't save your email. Please try again."); setStatus("success"); setMessage("You're on the list. We'll be in touch when early access opens."); return { status: "saved", message: "Early-access signup received." }; }
    catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Please try again in a moment."); throw error; }
  }
  useEffect(() => { const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext; if (!context?.registerTool) return; const lifecycle = new AbortController(); Promise.resolve(context.registerTool({ name: "join_nodedots_waitlist", description: "Submit an email to the NodeDots early-access waitlist. Only call when the visitor explicitly agrees to receive early-access and launch updates.", inputSchema: { type: "object", properties: { email: { type: "string" }, consent: { type: "boolean", const: true } }, required: ["email", "consent"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async (input: unknown) => { const data = input as { email?: unknown; consent?: unknown }; if (!data || typeof data.email !== "string" || data.consent !== true) throw new Error("A valid email and explicit consent are required."); setEmail(data.email); return join(data.email); } }, { signal: lifecycle.signal })).catch(() => {}); return () => lifecycle.abort(); }, []);

  return <>
    <header className="site-header"><a className="brand" href="#" aria-label="NodeDots home"><Mark/><span>NodeDots</span></a><nav aria-label="Main navigation"><a href="#preview">Explore the concept</a><a className="nav-join" href="#waitlist">Join the waitlist <span aria-hidden="true">↗</span></a></nav></header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <svg className="hero-symbol" viewBox="0 0 160 80" aria-hidden="true"><path d="M36 40H124" stroke="currentColor" strokeWidth="1.5"/><circle cx="36" cy="40" r="13" fill="currentColor"/><circle cx="80" cy="40" r="23" fill="currentColor"/><circle cx="124" cy="40" r="13" fill="currentColor"/><circle cx="80" cy="40" r="9" fill="#010101"/></svg><div className="product-label">NodeDots Code / Early access</div>
        <h1 id="hero-title">Connect the dots.<br/>Before you ship.</h1>
        <p className="hero-description">Understand what your code changes touch.<br/>Find the connections, gaps, and evidence that matter.</p>
        <div className="hero-signup" id="waitlist">
          <form onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await join(email, String(form.get("website") || "")); } catch {} }}>
            <label className="sr-only" htmlFor="email">Your email address</label><div className="signup-row"><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" value={email} onChange={event => setEmail(event.target.value)} disabled={status === "saving" || status === "success"} aria-describedby="signup-notice signup-result"/><button className="button" disabled={status === "saving" || status === "success"}>{status === "saving" ? "Joining…" : status === "success" ? "You're on the list" : "Join the waitlist"}</button></div>
            <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
            <p id="signup-result" className={`form-message ${status === "error" ? "error" : ""}`} role="status">{message}</p>
            <p id="signup-notice" className="signup-notice">Early-access and launch updates. Unsubscribe anytime.<br/>By joining, you agree to receive these updates. <button type="button" className="text-button" onClick={() => setPrivacy(true)}>Privacy</button></p>
          </form>
        </div>
      </section>
      <section className="preview-section" id="preview" aria-labelledby="preview-title">
        <div className="section-heading"><h2 id="preview-title">A small change. A connected view.</h2><span className="concept-label">01 / Interactive concept</span></div>
        <div className="workspace">
          <div className="workspace-bar"><span className="workspace-name"><Mark/> NodeDots <span>/</span> Change review</span><span className="workspace-meta">Illustrative workspace</span></div>
          <Tabs value={active} onValueChange={value => { setActive(value); setSelected(3); }}><TabsList className="scenario-tabs">{journeys.map((item,index) => <TabsTrigger key={item.label} value={String(index)}>{item.label}</TabsTrigger>)}</TabsList>{journeys.map((item,index) => <TabsContent key={item.label} value={String(index)}><div className="workspace-body"><div className="system-map"><div className="map-heading"><span>Connections</span><span>Select a dot</span></div><div className="graph-nodes"><svg className="map-lines" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true"><path d="M90 150C190 150 190 72 300 72M90 150C190 150 190 228 300 228M300 72H510M300 228C405 228 400 72 510 72M300 228H510"/></svg>{item.nodes.map((node,i) => <div className="node-position" key={node}><button className={`graph-node ${i === selected ? "selected" : ""}`} onClick={() => setSelected(i)} aria-pressed={i === selected}><span className={`node-dot ${i === 3 ? "attention" : ""}`}/><span>{node}</span><small>{i === 0 ? "Changed" : i === 3 ? "Review needed" : "Connected"}</small></button></div>)}</div><div className="map-note"><span className="status-dot"/> Starting with GitHub pull requests</div></div><aside className="finding" aria-live="polite"><div className={`finding-state ${selected === 3 ? "needs-review" : ""}`}><span className="node-dot"/>{selected === 3 ? item.state : "Connected"}</div><span className="finding-component">{item.nodes[selected]}</span><h3>{selected === 3 ? ["Check the customer mapping", "Check file cleanup", "Check the role selector"][index] : `${item.nodes[selected]} is connected`}</h3><p>{selected === 3 ? item.detail : "This component is connected to the change. Follow the relationship to understand what needs checking."}</p><div className="finding-action"><span>Suggested next step</span><p>{selected === 3 ? item.action : "Inspect the related code and its assumptions."}</p></div><span className="finding-disclaimer">Illustrative finding · Product in development</span></aside></div></TabsContent>)}</Tabs>
        </div>
      </section>
      <p className="preview-caption">See the relationships. Review what needs attention. Follow the evidence.</p>
    </main>
    <footer><a className="brand" href="#"><Mark/><span>NodeDots</span></a><span className="footer-tagline">Connect the dots before you act.</span><span>© {new Date().getFullYear()} NodeDots</span><button className="text-button" onClick={() => setPrivacy(true)}>Waitlist privacy</button></footer>
    <Dialog open={privacy} onOpenChange={setPrivacy}><DialogContent className="privacy-dialog"><DialogTitle className="privacy-title">Waitlist privacy</DialogTitle><DialogDescription>We collect your email address and the time you join so we can send NodeDots early-access invitations and launch updates. We store signups with our hosting service and do not publish or sell your email address.</DialogDescription><p>We use short-lived, hashed request identifiers to limit automated abuse. This page does not connect to your repositories or process your code.</p><p>Joining is optional. Each update will include an unsubscribe option. We will review and remove waitlist data when the early-access campaign ends.</p><button className="button" onClick={() => setPrivacy(false)}>Got it</button></DialogContent></Dialog>
  </>;
}


