"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const states = {
  confirmed: { label: "Confirmed", meaning: "Matches the repo evidence." },
  missing: { label: "Missing", meaning: "An expected piece is absent." },
  conflicting: { label: "Conflicting", meaning: "Two assumptions disagree." },
  uncertain: { label: "Uncertain", meaning: "More evidence is needed." },
  action: { label: "Action required", meaning: "A next step needs completing." },
} as const;
type State = keyof typeof states;
type Finding = { name: string; state: State; title: string; why: string; path: string; evidence: string; next: string };
const journeys: { label: string; change: string; nodes: Finding[] }[] = [
  { label: "Change authentication", change: "Replace Firebase Auth with Clerk", nodes: [
    { name: "Login", state: "confirmed", title: "Login uses the new provider", why: "The sign-in flow and server verification use the same Clerk identity.", path: "app/login/page.tsx:18", evidence: "SignIn renders the Clerk sign-in flow.", next: "Check the sign-in flow in the preview environment." },
    { name: "Sessions", state: "confirmed", title: "Sessions use the new identity", why: "Session checks read the new provider's user ID before serving protected routes.", path: "middleware.ts:12", evidence: "clerkMiddleware protects authenticated routes.", next: "Verify that signed-out requests are redirected." },
    { name: "User identity", state: "confirmed", title: "The user record has been updated", why: "New users can be linked to a Clerk ID. Downstream mappings still need to agree.", path: "db/schema/users.ts:24", evidence: "clerk_id replaces firebase_uid on the user record.", next: "Follow this identity into billing and existing customer records." },
    { name: "Billing", state: "conflicting", title: "Billing still expects the old ID", why: "The PR switches to Clerk. Stripe customer lookup still uses a Firebase UID, so existing customers may lose their billing link.", path: "api/billing/customers.ts:42", evidence: "Customer lookup filters by firebase_uid.", next: "Map existing Stripe customers to Clerk IDs before merging." },
    { name: "Tests", state: "missing", title: "The customer migration has no test", why: "An existing subscriber signing in with a Clerk ID is not covered by the billing tests.", path: "tests/billing/customer.test.ts:11", evidence: "Fixtures cover Firebase users only.", next: "Add a test that preserves the Stripe customer after the identity migration." },
  ] },
  { label: "Delete an account", change: "Remove a user and their account data", nodes: [
    { name: "Delete button", state: "confirmed", title: "Deletion requires confirmation", why: "The account action asks for confirmation before sending a delete request.", path: "app/settings/account.tsx:67", evidence: "The confirmation handler calls DELETE /api/account.", next: "Check keyboard access to the confirmation flow." },
    { name: "API route", state: "confirmed", title: "The route checks account ownership", why: "The delete handler uses the authenticated user, rather than a supplied account ID.", path: "api/account/route.ts:29", evidence: "auth.userId scopes the delete operation.", next: "Verify that one account cannot delete another." },
    { name: "User record", state: "confirmed", title: "Related database rows are removed", why: "The transaction removes the user and their linked profile records together.", path: "db/users/delete.ts:18", evidence: "User and profile deletion run in one transaction.", next: "Check the remaining foreign-key relationships." },
    { name: "File storage", state: "uncertain", title: "File cleanup is not established", why: "The route deletes database records, but the repo does not establish whether stored uploads are removed by a separate job.", path: "api/account/route.ts:46", evidence: "The handler calls deleteUser; no storage cleanup call is visible.", next: "Trace the cleanup job and verify that it removes the user's uploads." },
    { name: "Sessions", state: "action", title: "Verify active session invalidation", why: "A deleted account must stop working in sessions that were already open.", path: "lib/auth/sessions.ts:31", evidence: "Session revocation is available but is not called by the delete route.", next: "Revoke active sessions and verify a previously signed-in browser is rejected." },
  ] },
  { label: "Add team roles", change: "Introduce an editor role for teams", nodes: [
    { name: "Team settings", state: "confirmed", title: "Team settings write the role", why: "The settings flow passes the selected role to the member update endpoint.", path: "app/team/settings.tsx:54", evidence: "updateMember sends the role field.", next: "Check that only team owners can update another member." },
    { name: "Permissions", state: "uncertain", title: "Editor access needs verification", why: "The new role exists, but the repo does not show a complete permission matrix for editor actions.", path: "lib/permissions.ts:22", evidence: "canEdit checks owner and admin; editor behavior is not defined.", next: "Specify the editor permissions and check each protected action." },
    { name: "Role schema", state: "confirmed", title: "The schema accepts editor", why: "The member schema includes the role introduced by this PR.", path: "db/schema/members.ts:16", evidence: "Allowed values are owner, editor, and viewer.", next: "Compare these values with the UI and access checks." },
    { name: "Role selector", state: "conflicting", title: "The selector and schema disagree", why: "The database accepts editor, but the interface still offers admin. A selection can fail validation or grant the wrong access.", path: "components/team/role-select.tsx:9", evidence: "Options are owner, admin, and viewer.", next: "Align the selector values with the member schema." },
    { name: "Tests", state: "missing", title: "Editor permission tests are missing", why: "The new role has no test showing which team actions it can perform.", path: "tests/team/permissions.test.ts:14", evidence: "Cases cover owner and viewer only.", next: "Add allowed and denied action tests for editor." },
  ] },
];
function Mark() {
  return <svg viewBox="0 0 50 16" aria-hidden="true" className="brand-mark"><path d="M5 8H45" stroke="currentColor" strokeWidth="1"/><g fill="currentColor"><circle cx="5" cy="8" r="3.5"/><circle cx="15" cy="8" r="3.5"/><circle cx="25" cy="8" r="3.5"/><circle cx="45" cy="8" r="3.5"/></g><circle className="mark-missing" cx="35" cy="8" r="3.5" strokeWidth="2"/></svg>;
}
function Dot({ state }: { state: State }) {
  return <svg className={`state-dot state-${state}`} viewBox="0 0 20 20" aria-hidden="true">
    {state === "confirmed" ? <circle cx="10" cy="10" r="6" fill="currentColor"/> : state === "conflicting" ? <><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M4 16L16 4" stroke="currentColor" strokeWidth="2"/></> : state === "action" ? <><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" fill="currentColor"/></> : <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={state === "uncertain" ? "3 3" : undefined}/>}
  </svg>;
}
const edges = ["M90 150C190 150 190 72 300 72", "M90 150C190 150 190 228 300 228", "M300 72H510", "M300 228C405 228 400 72 510 72", "M300 228H510"];
const connectedEdges = [[0, 1], [0, 2], [1, 3, 4], [2, 3], [4]];

export default function Landing() {
  const [active, setActive] = useState("0");
  const [selected, setSelected] = useState(3);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);

  function selectNode(index: number) { setSelected(index); setSelectionVersion(value => value + 1); }
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("nodedots-theme", theme); } catch {}
  }
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { try { if (localStorage.getItem("nodedots-theme")) return; } catch {} const theme = media.matches ? "dark" : "light"; document.documentElement.dataset.theme = theme; document.documentElement.classList.toggle("dark", theme === "dark"); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  async function join(value: string, website = "") {
    const clean = value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254) throw new Error("Enter a valid email address.");
    setStatus("saving"); setMessage("");
    try { const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clean, consent: true, website }) }); const body = await response.json() as { message?: string }; if (!response.ok) throw new Error(body.message || "We couldn't save your email. Please try again."); setStatus("success"); setMessage("You're on the list. We'll be in touch when early access opens."); return { status: "saved", message: "Early-access signup received." }; }
    catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Please try again in a moment."); throw error; }
  }
  useEffect(() => { const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext; if (!context?.registerTool) return; const lifecycle = new AbortController(); Promise.resolve(context.registerTool({ name: "join_nodedots_waitlist", description: "Submit an email to the NodeDots early-access waitlist. Only call when the visitor explicitly agrees to receive early-access and launch updates.", inputSchema: { type: "object", properties: { email: { type: "string" }, consent: { type: "boolean", const: true } }, required: ["email", "consent"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async (input: unknown) => { const data = input as { email?: unknown; consent?: unknown }; if (!data || typeof data.email !== "string" || data.consent !== true) throw new Error("A valid email and explicit consent are required."); setEmail(data.email); return join(data.email); } }, { signal: lifecycle.signal })).catch(() => {}); return () => lifecycle.abort(); }, []);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#" aria-label="NodeDots home"><Mark/><span>NodeDots</span></a>
      <nav aria-label="Main navigation"><a className="explore-link" href="#preview">Explore the concept</a><button className="theme-toggle" onClick={toggleTheme} aria-label="Switch between light and dark theme" title="Switch between light and dark theme"><svg viewBox="0 0 24 24" aria-hidden="true"><g className="theme-sun" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M5 19L7 17M17 7L19 5"/></g><path className="theme-moon" d="M20 15A8 8 0 0 1 9 4A8 8 0 1 0 20 15Z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button><a className="nav-join" href="#waitlist">Join the waitlist <span aria-hidden="true">↗</span></a></nav>
    </header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <p className="product-label"><Dot state="action"/> NodeDots Code <span aria-hidden="true">/</span> Early access</p>
        <h1 id="hero-title">Connect the dots.<br/>Before you ship.</h1>
        <p className="hero-description">NodeDots reads your pull request against the whole repo and shows what it touched, what it missed, and what now conflicts.</p>
        <div className="hero-signup" id="waitlist">
          <form onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await join(email, String(form.get("website") || "")); } catch {} }}>
            <label className="sr-only" htmlFor="email">Your email address</label>
            <div className="signup-row"><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Your email address" value={email} onChange={event => setEmail(event.target.value)} disabled={status === "saving" || status === "success"} aria-invalid={status === "error"} aria-describedby="signup-notice signup-result"/><button className="button" disabled={status === "saving" || status === "success"}><Dot state="action"/>{status === "saving" ? "Joining…" : status === "success" ? "You're on the list" : "Join the waitlist"}</button></div>
            <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
            <p id="signup-result" className={`form-message ${status === "error" ? "error" : ""}`} role="status">{message && <><Dot state={status === "error" ? "conflicting" : "confirmed"}/>{message}</>}</p>
            <p id="signup-notice" className="signup-notice">Early-access and launch updates. Unsubscribe anytime.<br/>By joining, you agree to receive these updates. <button type="button" className="text-button" onClick={() => setPrivacy(true)}>Privacy</button></p>
          </form>
        </div>
      </section>
      <section className="preview-section" id="preview" aria-labelledby="preview-title">
        <div className="section-heading"><h2 id="preview-title">See what the change missed.</h2><span className="concept-label">Interactive concept</span></div>
        <div className="workspace">
          <div className="workspace-bar"><span className="workspace-name"><Mark/> Change review</span><span className="workspace-meta">GitHub pull requests</span></div>
          <Tabs value={active} onValueChange={value => { setActive(value); setSelected(3); setSelectionVersion(0); }}>
            <TabsList className="scenario-tabs" aria-label="Example pull request">{journeys.map((item,index) => <TabsTrigger key={item.label} value={String(index)}>{item.label}</TabsTrigger>)}</TabsList>
            {journeys.map((item,index) => { const finding = item.nodes[selected]; return <TabsContent key={item.label} value={String(index)}>
              <div className="workspace-body">
                <div className="system-map"><div className="map-heading"><span>{item.change}</span><span>Select a dot</span></div>
                  <div className="graph-nodes" role="group" aria-label={`${item.label}: five connected components. Select a component to read its finding and evidence.`}>
                    <svg className="map-lines" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">{edges.map((edge,i) => <path key={i} d={edge}/>)}{selectionVersion > 0 && connectedEdges[selected].map(i => <path key={`${selectionVersion}-${i}`} d={edges[i]} className={`selected-edge state-${finding.state}`}/>)}</svg>
                    {item.nodes.map((node,i) => <div className="node-position" key={node.name}><button className={`graph-node ${i === selected ? `selected state-${node.state}` : ""}`} onClick={() => selectNode(i)} aria-pressed={i === selected} title="Show finding" aria-controls={`finding-${index}`}><Dot state={node.state}/><span>{node.name} </span><small>{states[node.state].label}</small></button></div>)}
                  </div><p className="map-note">One pull request. The connected repo.</p>
                </div>
                <aside className="finding" id={`finding-${index}`} aria-label="Selected component finding" aria-live="polite">
                  <span className={`finding-state state-${finding.state}`}><Dot state={finding.state}/>{states[finding.state].label}</span><span className="finding-component">{finding.name}</span><h3>{finding.title}</h3><p>{finding.why}</p>
                  <div className="evidence"><span className="detail-label">Evidence</span><code>{finding.path}</code><p>{finding.evidence}</p></div>
                  <div className="finding-action"><span className="detail-label">Suggested next step</span><p>{finding.next}</p></div><span className="finding-disclaimer">Illustrative finding · Product in development</span>
                </aside>
              </div>
            </TabsContent>; })}
          </Tabs>
        </div>
        <ul className="state-legend" aria-label="The five finding states">{(Object.keys(states) as State[]).map(state => <li key={state}><div><Dot state={state}/><strong>{states[state].label}</strong></div><p>{states[state].meaning}</p></li>)}</ul>
      </section>
    </main>
    <footer><div className="footer-identity"><a className="brand" href="#" aria-label="NodeDots home"><Mark/><span>NodeDots</span></a><span>Connect the dots before you act.</span></div><div className="footer-links"><span>© {new Date().getFullYear()} NodeDots</span><button className="text-button" onClick={() => setPrivacy(true)}>Waitlist privacy</button></div></footer>
    <Dialog open={privacy} onOpenChange={setPrivacy}><DialogContent className="privacy-dialog"><DialogTitle className="privacy-title">Waitlist privacy</DialogTitle><DialogDescription>We collect your email address and the time you join so we can send NodeDots early-access invitations and launch updates. We store signups with our hosting service and do not publish or sell your email address.</DialogDescription><p>We use short-lived, hashed request identifiers to limit automated abuse. This page does not connect to your repositories or process your code.</p><p>Joining is optional. Each update will include an unsubscribe option. We will review and remove waitlist data when the early-access campaign ends.</p><button className="button" onClick={() => setPrivacy(false)}>Got it</button></DialogContent></Dialog>
  </>;
}

