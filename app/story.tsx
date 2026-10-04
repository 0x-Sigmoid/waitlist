"use client";
import { useEffect, useRef, useState } from "react";

export default function Story() {
  const area = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [changed, setChanged] = useState(false);
  const [focus, setFocus] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const el = area.current; if (!el) return; const rect = el.getBoundingClientRect(); setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)))); }); };
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  const offset = progress < .1 ? 0 : progress < .4 ? (progress - .1) / .3 : progress < .6 ? 1 : progress < .9 ? 1 + (progress - .6) / .3 : 2;
  const chapter = Math.round(offset);
  function goToScene(index: number) {
    const el = area.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + (rect.height - window.innerHeight) * [0, .5, 1][index], behavior: "smooth" });
  }
  const nodes = ["Authentication", "User identity", "Billing", "Tests"];
  return <section className="story-runway" ref={area} aria-label="Follow a change through your system">
    <div className="story-sticky">
      <div className="story-top"><span className="eyebrow">FOLLOW THE THREAD</span><span>Scroll to connect the dots <span aria-hidden="true">↓</span></span></div>
      <div className="story-world" style={{ transform: `translateX(-${offset * 100}%)` }}>
        <article className="story-frame first-frame">
          <div className="story-copy"><span className="eyebrow">01 / THE CHANGE</span><h2>It starts with<br/><span className="serif">one little change.</span></h2><p>A new login provider.<br/>A few lines of code. Looks simple enough.</p><button className={`button ${changed ? "" : "primary"}`} onClick={() => { setChanged(!changed); setFocus(2); }}>{changed ? "Reset the change ↺" : "Make the change ↗"}</button><span className="story-hint">{changed ? "Your change is travelling through the system." : "Try it. Watch the connections react."}</span></div>
          <div className={`system-orbit ${changed ? "changed" : ""}`}>
            <svg viewBox="0 0 600 540" className="orbit-lines" aria-hidden="true"><path d="M120 120C500-80 620 230 355 240S-100 510 220 430 620 530 485 350"/><path className="orbit-pulse" pathLength="1" d="M120 120C500-80 620 230 355 240S-100 510 220 430 620 530 485 350"/></svg>
            {nodes.map((node, i) => <button key={node} className={`orbit-card orbit-${i} ${changed && i === 2 ? "orbit-warning" : ""} ${focus === i ? "orbit-focus" : ""}`} onClick={() => setFocus(i)} aria-pressed={focus === i}><span className="orbit-icon" aria-hidden="true">{["↗", "{ }", "$", "✓"][i]}</span><span>{node}</span><small>{changed ? ["Provider changed", "New identifier", "Old mapping found", "Coverage to check"][i] : ["login.ts", "user.id", "customer_id", "auth.spec.ts"][i]}</small></button>)}
            <div className="orbit-note" role="status">{changed ? ["The login provider has changed.", "Identity now uses a different identifier.", "Billing still expects the old user ID.", "Check that the new identity flow is covered."][focus] : "Click a piece. Every dot has a story."}</div>
          </div>
        </article>
        <article className="story-frame second-frame"><div className="story-copy"><span className="eyebrow">02 / THE RIPPLE</span><h2>But code doesn't<br/>live <span className="serif">alone.</span></h2><p>The change travels.<br/>Through data. Through contracts.<br/>Into places you weren't looking.</p><a href="#connections" className="text-link">Explore a connection ↗</a></div><div className="ripple-composition"><div className="ripple-ring ring-a"/><div className="ripple-ring ring-b"/><div className="ripple-ring ring-c"/><div className="ripple-center">user.id</div><div className="floating-label label-a">Sessions</div><div className="floating-label label-b">Billing</div><div className="floating-label label-c">Permissions</div><div className="ripple-callout"><span className="warning-dot"/> One identifier.<br/><strong>Several assumptions.</strong></div></div></article>
        <article className="story-frame third-frame"><div className="evidence-object"><span className="eyebrow">A CONNECTION WORTH CHECKING</span><div className="evidence-path">Authentication <span>↗</span> Billing</div><div className="evidence-status">● Conflicting assumption</div><h3>The customer mapping<br/>still uses the old ID.</h3><p>Follow the relationship back to the code.<br/>Understand the consequence before you ship.</p><div className="evidence-code"><span>billing/customer.ts</span><code>customer.user_id === oldIdentity.id</code></div><small>Illustrative finding · Product concept</small></div><div className="story-copy"><span className="eyebrow">03 / THE BIGGER PICTURE</span><h2>Now you see<br/><span className="serif">what connects.</span></h2><p>NodeDots brings the relationships<br/>and the evidence into view.<br/>So the next step is a considered one.</p><a className="button primary" href="#waitlist">I want the bigger picture ↗</a></div></article>
      </div>
      <div className="story-progress" aria-label={`Story chapter ${chapter + 1} of 3`}><span>{["The change", "The ripple", "The bigger picture"][chapter]}</span><div><i style={{ transform: `scaleX(${progress})` }}/></div><nav aria-label="Story scenes">{["The change", "The ripple", "The bigger picture"].map((name, index) => <button key={name} onClick={() => goToScene(index)} aria-label={`Go to ${name.toLowerCase()}`} aria-current={chapter === index ? "step" : undefined}>0{index + 1}</button>)}</nav></div>
    </div>
  </section>;
}
