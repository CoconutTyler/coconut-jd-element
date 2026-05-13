// ============================================================
// COCONUT — Job Description Generator — Wix Custom Element (Velo)
// ============================================================
// File location in Wix Studio: Public/custom-elements/coconut-jd-generator.js
// Element tag: <coconut-jd-generator>
//
// IMPORTANT — This file contains a hardcoded OpenAI API key.
// Acceptable ONLY for internal presentation phase. Before public release:
//   1. Move OpenAI call to a Velo backend function (jsw file)
//   2. Use wix-secrets-backend to read the key server-side
//   3. Replace direct fetch with a wix-fetch call from front-end → backend
// ============================================================

class CoconutJDGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initLogic();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.notifyHeight());
    }
  }

  // Lets Wix recompute the element's height after content changes
  notifyHeight() {
    this.dispatchEvent(new CustomEvent('heightChanged', {
      bubbles: true,
      composed: true,
      detail: { height: this.scrollHeight }
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  /* ============================================
     WIX CUSTOM ELEMENT — Host + container queries
     ============================================ */
  :host {
    display: block;
    width: 100%;
    container-type: inline-size;
    container-name: cvembed;
    font-family: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  * { box-sizing: border-box; }

  /* Override outer body since we are in shadow DOM */
  .cv-embed {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  /* Container queries — adapt to iframe width, not viewport */
  @container cvembed (max-width: 720px) {
    .cv-card { padding: 28px 24px; min-height: 480px; border-radius: 20px; }
    .cv-step-title { font-size: 24px; }
    .cv-result-headline { font-size: 22px; }
    .cv-result-hero { padding: 24px 20px; }
    .cv-jd-doc { padding: 22px; }
    .cv-embed { padding: 16px 12px; }
  }
  @container cvembed (max-width: 540px) {
    .cv-field-row-2 { grid-template-columns: 1fr; }
    .cv-card { padding: 24px 18px; }
    .cv-step-title { font-size: 22px; }
    .cv-progress-wrap { gap: 10px; margin-bottom: 24px; }
    .cv-progress-label { font-size: 11px; }
    .cv-pill { padding: 8px 12px; font-size: 12.5px; }
    .cv-result-stats { font-size: 11px; flex-direction: column; gap: 4px; }
    .cv-result-stats .dot { display: none; }
    .cv-result-cta-row { flex-direction: column; align-items: stretch; }
    .cv-result-cta-row .cv-btn { justify-content: center; }
    .cv-btn { font-size: 13.5px; padding: 12px 18px; }
    .cv-nav { gap: 8px; padding-top: 20px; }
    .cv-jd-details { grid-template-columns: 1fr; gap: 4px; }
    .cv-jd-details .dk { color: var(--cv-fg-3); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; }
  }

:root {
    /* Core brand */
    --cv-navy-900: #07152B;
    --cv-navy-800: #0B1E3F;
    --cv-navy-700: #122A52;
    --cv-navy-600: #1E3A6B;
    --cv-navy-500: #2C4F8C;
    --cv-green-700: #3F9A6E;
    --cv-green-600: #50B080;
    --cv-green-500: #6EC79A;
    --cv-green-200: #C0E5D2;
    --cv-green-100: #DEF2E6;
    /* Surfaces */
    --cv-bg: #FFFFFF;
    --cv-bg-soft: #F7F7F4;
    --cv-bg-cream: #FAF6EE;
    --cv-bg-mint: #EAF5EE;
    /* Text */
    --cv-fg-1: #07152B;
    --cv-fg-2: #2A3A55;
    --cv-fg-3: #5C6B85;
    --cv-fg-inverse: #FFFFFF;
    /* Borders */
    --cv-border: #E6E8EE;
    --cv-border-soft: #F0F1F4;
    /* Semantic */
    --cv-success: #50B080;
    --cv-error: #E54B4B;
    /* Type */
    --cv-font-display: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --cv-font-body: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    /* Spacing */
    --cv-sp-1: 4px;  --cv-sp-2: 8px;  --cv-sp-3: 12px; --cv-sp-4: 16px;
    --cv-sp-5: 20px; --cv-sp-6: 24px; --cv-sp-8: 32px; --cv-sp-10: 40px;
    --cv-sp-12: 48px; --cv-sp-16: 64px; --cv-sp-20: 80px;
    /* Radii */
    --cv-radius-sm: 8px;  --cv-radius-md: 14px;  --cv-radius-lg: 20px;
    --cv-radius-xl: 28px; --cv-radius-2xl: 36px; --cv-radius-pill: 999px;
    /* Shadows */
    --cv-shadow-xs: 0 1px 2px rgba(7,21,43,0.05);
    --cv-shadow-sm: 0 4px 12px rgba(7,21,43,0.06);
    --cv-shadow-md: 0 10px 28px rgba(7,21,43,0.08);
    --cv-shadow-card: 0 6px 20px rgba(7,21,43,0.06), 0 1px 0 rgba(7,21,43,0.03);
    --cv-shadow-pop: 0 16px 40px rgba(11,30,63,0.18);
    /* Motion */
    --cv-ease: cubic-bezier(0.22,0.61,0.36,1);
    --cv-ease-out: cubic-bezier(0.16,1,0.3,1);
    --cv-dur-fast: 140ms;
    --cv-dur-base: 220ms;
    --cv-dur-slow: 420ms;
  }

  * { box-sizing: border-box; }
  html { font-family: var(--cv-font-body); color: var(--cv-fg-1); -webkit-font-smoothing: antialiased; }
  body {
    margin: 0;
    padding: 0;
    background: var(--cv-bg-cream);
    min-height: 100vh;
    font-size: 16px;
    line-height: 1.55;
  }

  /* ============================================
     EMBED CONTAINER — this is what goes in Wix
     ============================================ */
  .cv-embed {
    width: 100%;
    max-width: 720px;
    margin: 80px auto;
    padding: 0 16px;
  }
  

  /* The main card */
  .cv-card {
    background: var(--cv-bg);
    border-radius: var(--cv-radius-xl);
    box-shadow: var(--cv-shadow-card);
    padding: 48px;
    min-height: 560px;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  

  /* ============================================
     PROGRESS BAR + EYEBROW
     ============================================ */
  .cv-progress-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 36px;
  }
  .cv-progress-track {
    flex: 1;
    height: 4px;
    background: var(--cv-border-soft);
    border-radius: var(--cv-radius-pill);
    overflow: hidden;
  }
  .cv-progress-fill {
    height: 100%;
    background: var(--cv-green-600);
    border-radius: var(--cv-radius-pill);
    width: 0%;
    transition: width 420ms var(--cv-ease-out);
  }
  .cv-progress-label {
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cv-fg-3);
    white-space: nowrap;
  }

  /* ============================================
     STEP — animated container
     ============================================ */
  .cv-step {
    display: none;
    flex-direction: column;
    flex: 1;
    animation: stepIn 420ms var(--cv-ease-out);
  }
  .cv-step.active { display: flex; }
  @keyframes stepIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes stepOut {
    from { opacity: 1; transform: none; }
    to { opacity: 0; transform: translateY(-8px); }
  }

  .cv-eyebrow {
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin-bottom: 12px;
  }

  .cv-step-title {
    font-family: var(--cv-font-display);
    font-weight: 800;
    font-size: 32px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--cv-navy-800);
    margin: 0 0 10px;
    text-wrap: balance;
  }
  

  .cv-step-sub {
    font-size: 15px;
    line-height: 1.55;
    color: var(--cv-fg-3);
    margin: 0 0 28px;
    max-width: 520px;
  }

  /* ============================================
     FORM FIELDS
     ============================================ */
  .cv-field {
    margin-bottom: 18px;
  }
  .cv-field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }
  

  .cv-label {
    display: block;
    font-family: var(--cv-font-display);
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.005em;
    color: var(--cv-navy-800);
    margin: 0 0 8px;
  }

  .cv-input,
  .cv-select,
  .cv-textarea {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
    background: var(--cv-bg);
    color: var(--cv-fg-1);
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 500;
    outline: none;
    transition: border-color 180ms var(--cv-ease), box-shadow 180ms var(--cv-ease), background 180ms var(--cv-ease);
  }
  .cv-input::placeholder,
  .cv-textarea::placeholder { color: var(--cv-fg-3); font-weight: 400; }
  .cv-input:hover,
  .cv-select:hover,
  .cv-textarea:hover { border-color: #d4d8e1; }
  .cv-input:focus,
  .cv-select:focus,
  .cv-textarea:focus {
    border-color: var(--cv-green-600);
    box-shadow: 0 0 0 4px rgba(80,176,128,0.14);
    background: var(--cv-bg);
  }
  .cv-textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }
  .cv-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1l5 5 5-5' fill='none' stroke='%235C6B85' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
    cursor: pointer;
  }

  /* Pill picker (tags) */
  .cv-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }
  .cv-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-pill);
    background: var(--cv-bg);
    color: var(--cv-fg-2);
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 160ms var(--cv-ease);
    user-select: none;
    white-space: nowrap;
  }
  .cv-pill:hover {
    border-color: var(--cv-green-500);
    color: var(--cv-navy-800);
  }
  .cv-pill.on {
    background: var(--cv-green-100);
    border-color: var(--cv-green-600);
    color: var(--cv-green-700);
  }
  .cv-pill.suggested {
    border-style: dashed;
    border-color: var(--cv-green-500);
    color: var(--cv-green-700);
  }

  /* Custom tool pill — has a small × to remove */
  .cv-pill.custom {
    background: var(--cv-green-100);
    border-color: var(--cv-green-600);
    color: var(--cv-green-700);
    padding-right: 8px;
  }
  .cv-pill .pill-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(63,154,110,0.15);
    margin-left: 4px;
    cursor: pointer;
    transition: background 140ms var(--cv-ease);
  }
  .cv-pill .pill-x:hover {
    background: rgba(63,154,110,0.3);
  }
  .cv-pill .pill-x svg {
    width: 9px;
    height: 9px;
    color: var(--cv-green-700);
  }

  /* Add tool button */
  .cv-add-btn {
    background: transparent;
    border: 1.5px dashed var(--cv-border);
    color: var(--cv-fg-3);
    border-radius: var(--cv-radius-pill);
    padding: 8px 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 160ms var(--cv-ease);
  }
  .cv-add-btn:hover {
    border-color: var(--cv-green-600);
    color: var(--cv-green-700);
    background: var(--cv-green-100);
  }
  .cv-add-btn svg {
    width: 12px;
    height: 12px;
  }
  .cv-tool-input {
    font-size: 13.5px;
    padding: 10px 14px;
  }

  /* Responsibility checklist */
  .cv-resp-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 280px;
    overflow-y: auto;
    padding: 8px;
    background: var(--cv-bg-soft);
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
  }
  .cv-resp-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--cv-radius-sm);
    cursor: pointer;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--cv-fg-2);
    transition: background 140ms var(--cv-ease);
  }
  .cv-resp-item:hover { background: var(--cv-bg); }
  .cv-resp-item.on { background: var(--cv-green-100); color: var(--cv-navy-800); }
  .cv-resp-check {
    width: 18px; height: 18px; flex-shrink: 0;
    border: 1.5px solid var(--cv-border);
    border-radius: 5px;
    background: var(--cv-bg);
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
    transition: all 140ms var(--cv-ease);
  }
  .cv-resp-check svg { width: 11px; height: 11px; color: var(--cv-fg-inverse); opacity: 0; }
  .cv-resp-item.on .cv-resp-check { background: var(--cv-green-600); border-color: var(--cv-green-600); }
  .cv-resp-item.on .cv-resp-check svg { opacity: 1; }
  .cv-badge-mini {
    display: inline-block;
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    color: var(--cv-fg-3);
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: var(--cv-radius-pill);
    margin-left: 6px;
    letter-spacing: 0.02em;
  }

  /* Non-negotiables structured */
  .cv-non-cat {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin: 0 0 6px;
  }
  .cv-non-block { margin-bottom: 14px; }

  /* ============================================
     STEP NAV (back / next buttons)
     ============================================ */
  .cv-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: auto;
    padding-top: 28px;
  }
  .cv-btn {
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 14.5px;
    border-radius: var(--cv-radius-pill);
    padding: 14px 24px;
    border: none;
    cursor: pointer;
    transition: all 180ms var(--cv-ease);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    line-height: 1;
    white-space: nowrap;
    flex-shrink: 0;
    width: auto;
  }
  .cv-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .cv-btn-primary {
    background: var(--cv-green-600);
    color: var(--cv-fg-inverse);
    box-shadow: var(--cv-shadow-sm);
  }
  .cv-btn-primary:hover:not(:disabled) {
    background: var(--cv-green-700);
    box-shadow: var(--cv-shadow-md);
    transform: translateY(-1px);
  }
  .cv-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cv-btn-ghost {
    background: transparent;
    color: var(--cv-fg-3);
    padding: 14px 14px;
  }
  .cv-btn-ghost:hover { color: var(--cv-navy-800); }
  .cv-btn-navy {
    background: var(--cv-navy-800);
    color: var(--cv-fg-inverse);
    box-shadow: var(--cv-shadow-sm);
  }
  .cv-btn-navy:hover { background: var(--cv-navy-700); box-shadow: var(--cv-shadow-md); transform: translateY(-1px); }
  .cv-btn svg { width: 14px; height: 14px; }

  /* ============================================
     STEP 6 — Loading / email capture
     ============================================ */
  .cv-loading-step { align-items: center; justify-content: center; text-align: center; }
  .cv-loading-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: var(--cv-green-100);
    display: flex; align-items: center; justify-content: center;
    margin: 24px auto 24px;
    position: relative;
  }
  .cv-loading-icon::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid var(--cv-green-200);
    border-top-color: var(--cv-green-600);
    animation: spin 1.2s linear infinite;
    opacity: 0;
    transition: opacity 220ms var(--cv-ease);
  }
  .cv-loading-icon.spinning::before { opacity: 1; }
  .cv-loading-icon svg { width: 28px; height: 28px; color: var(--cv-green-700); }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .cv-loading-form {
    max-width: 380px;
    width: 100%;
    margin: 16px auto 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cv-loading-microcopy {
    font-size: 12.5px;
    color: var(--cv-fg-3);
    margin-top: 16px;
  }

  /* ============================================
     STEP 7 — Result
     ============================================ */
  .cv-result-hero {
    background: linear-gradient(180deg, var(--cv-bg-mint) 0%, var(--cv-bg-cream) 100%);
    border-radius: var(--cv-radius-lg);
    padding: 32px;
    margin: 0 0 28px;
    text-align: center;
    border: 1px solid var(--cv-green-200);
  }
  
  .cv-result-stats {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cv-navy-700);
  }
  .cv-result-stats .dot { color: var(--cv-green-600); font-weight: 800; }
  .cv-result-headline {
    font-family: var(--cv-font-display);
    font-weight: 800;
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--cv-navy-800);
    margin: 0 0 8px;
    text-wrap: balance;
  }
  
  .cv-result-sub {
    font-size: 14.5px;
    color: var(--cv-fg-2);
    margin: 0 0 22px;
    max-width: 440px;
    margin-left: auto;
    margin-right: auto;
  }
  .cv-result-cta-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cv-jd-doc {
    background: var(--cv-bg);
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-radius-lg);
    padding: 32px;
    margin-bottom: 16px;
  }
  
  .cv-jd-title {
    font-family: var(--cv-font-display);
    font-weight: 800;
    font-size: 22px;
    line-height: 1.2;
    color: var(--cv-navy-800);
    margin: 0 0 4px;
    letter-spacing: -0.01em;
  }
  .cv-jd-subtitle {
    font-size: 13px;
    color: var(--cv-fg-3);
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--cv-border-soft);
  }
  .cv-jd-section {
    margin-bottom: 18px;
    animation: sectionFade 380ms var(--cv-ease-out) backwards;
  }
  .cv-jd-section:nth-child(2) { animation-delay: 80ms; }
  .cv-jd-section:nth-child(3) { animation-delay: 160ms; }
  .cv-jd-section:nth-child(4) { animation-delay: 240ms; }
  .cv-jd-section:nth-child(5) { animation-delay: 320ms; }
  .cv-jd-section:nth-child(6) { animation-delay: 400ms; }
  .cv-jd-section:nth-child(7) { animation-delay: 480ms; }
  @keyframes sectionFade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }
  .cv-jd-h3 {
    display: flex; align-items: center; justify-content: space-between;
    font-family: var(--cv-font-display);
    font-weight: 700;
    font-size: 14px;
    color: var(--cv-navy-800);
    margin: 0 0 8px;
    letter-spacing: 0.01em;
  }
  .cv-jd-section ul { margin: 0; padding-left: 18px; }
  .cv-jd-section li { font-size: 13.5px; line-height: 1.6; color: var(--cv-fg-2); margin: 4px 0; }
  .cv-jd-details { display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; font-size: 13px; }
  .cv-jd-details .dk { color: var(--cv-fg-3); font-weight: 600; }
  .cv-jd-details .dv { color: var(--cv-navy-800); font-weight: 500; }

  .cv-copy-btn {
    background: transparent;
    border: 1px solid var(--cv-border);
    color: var(--cv-fg-3);
    border-radius: var(--cv-radius-sm);
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    transition: all 140ms var(--cv-ease);
  }
  .cv-copy-btn:hover { color: var(--cv-navy-800); border-color: var(--cv-navy-500); }
  .cv-copy-btn.copied { color: var(--cv-green-700); border-color: var(--cv-green-600); }
  .cv-copy-btn svg { width: 11px; height: 11px; }

  .cv-result-footer {
    text-align: center;
    font-size: 12.5px;
    color: var(--cv-fg-3);
    padding-top: 8px;
  }
  .cv-result-footer .start-over {
    background: none; border: none; color: var(--cv-fg-3);
    text-decoration: underline; cursor: pointer; font: inherit;
    font-weight: 600;
  }
  .cv-result-footer .start-over:hover { color: var(--cv-navy-800); }

  /* Result hero is in step 7 — needs full width inside card */
  #step7 .cv-step-content { width: 100%; }

  /* Step 7 has its own padding behaviour */
  .cv-step.cv-step-result {
    padding-top: 8px;
  }

  /* ============================================
     SCROLLBAR styling
     ============================================ */
  .cv-resp-list::-webkit-scrollbar { width: 6px; }
  .cv-resp-list::-webkit-scrollbar-track { background: transparent; }
  .cv-resp-list::-webkit-scrollbar-thumb { background: var(--cv-border); border-radius: 99px; }
  .cv-resp-list::-webkit-scrollbar-thumb:hover { background: var(--cv-fg-3); }

  /* Hide step nav on result step */
  #step7 + .cv-nav { display: none; }

  /* Smooth out potential overflow */
  .cv-step-content { display: flex; flex-direction: column; gap: 0; }
</style>
<div class="cv-embed">
  <div class="cv-card">

    <!-- ============== PROGRESS BAR ============== -->
    <div class="cv-progress-wrap" id="progressWrap">
      <span class="cv-progress-label" id="progressLabel">Step 1 of 5</span>
      <div class="cv-progress-track">
        <div class="cv-progress-fill" id="progressFill"></div>
      </div>
    </div>

    <!-- ============== STEP 1: About you ============== -->
    <div class="cv-step active" id="step1" data-step="1">
      <span class="cv-eyebrow">About you</span>
      <h2 class="cv-step-title">Tell us a bit about your business.</h2>
      <p class="cv-step-sub">We use this to craft a job description that sounds like it actually came from you, not a template.</p>

      <div class="cv-field">
        <label class="cv-label" for="qCompany">Company name</label>
        <input type="text" class="cv-input" id="qCompany" placeholder="e.g. Acme Studio" autocomplete="organization" />
      </div>

      <div class="cv-field-row-2">
        <div>
          <label class="cv-label" for="qIndustry">Industry</label>
          <select class="cv-select" id="qIndustry">
            <option value="">Choose...</option>
            <option>Professional Services</option>
            <option>SaaS / Tech</option>
            <option>E-commerce / Retail</option>
            <option>Real Estate</option>
            <option>Healthcare</option>
            <option>Financial Services</option>
            <option>Marketing / Agency</option>
            <option>Construction / Trades</option>
            <option>Education</option>
            <option>Hospitality / F&B</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label class="cv-label" for="qYears">Years in business</label>
          <select class="cv-select" id="qYears">
            <option value="">Choose...</option>
            <option>Less than 1 year</option>
            <option>1–3 years</option>
            <option>3–5 years</option>
            <option>5–10 years</option>
            <option>10+ years</option>
          </select>
        </div>
      </div>

      <div class="cv-field">
        <label class="cv-label" for="qPosition">Your role at the company</label>
        <input type="text" class="cv-input" id="qPosition" placeholder="e.g. Founder, Operations Director, CEO" />
      </div>
    </div>

    <!-- ============== STEP 2: The role ============== -->
    <div class="cv-step" id="step2" data-step="2">
      <span class="cv-eyebrow">The role</span>
      <h2 class="cv-step-title">Who are you looking to hire?</h2>
      <p class="cv-step-sub">Start broad, then narrow it down. You can mix specializations if the role spans multiple areas.</p>

      <div class="cv-field">
        <label class="cv-label">What type of work do you need help with?</label>
        <div class="cv-pills" id="taskBuckets">
          <span class="cv-pill" data-bucket="ea">Executive / Admin Support</span>
          <span class="cv-pill" data-bucket="sales">Sales</span>
          <span class="cv-pill" data-bucket="marketing">Marketing &amp; Content</span>
          <span class="cv-pill" data-bucket="ops">Operations</span>
          <span class="cv-pill" data-bucket="finance">Finance / Bookkeeping</span>
          <span class="cv-pill" data-bucket="cs">Customer Service</span>
          <span class="cv-pill" data-bucket="other">Something else</span>
        </div>
      </div>

      <div class="cv-field" id="roleField" style="display:none;">
        <label class="cv-label" for="qRole">Pick the specific role</label>
        <select class="cv-select" id="qRole">
          <option value="">Choose a role...</option>
        </select>
        <input type="text" class="cv-input" id="qRoleOther" placeholder="Type the role title (e.g. AI Engineer, Recruiter, Bookkeeper...)" style="margin-top: 10px; display: none;" />
      </div>

      <div class="cv-field" id="subFlavorField" style="display:none;">
        <label class="cv-label">Add a specialization <span style="color:var(--cv-fg-3); font-weight:500;">(optional)</span></label>
        <div class="cv-pills" id="subFlavorPills"></div>
      </div>

      <div class="cv-field-row-2" id="roleMetaField" style="display:none;">
        <div>
          <label class="cv-label" for="qCount">How many in this role?</label>
          <select class="cv-select" id="qCount">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </div>
        <div>
          <label class="cv-label" for="qExp">Experience level</label>
          <select class="cv-select" id="qExp">
            <option value="">Choose...</option>
            <option value="entry">Entry (0–2 yrs)</option>
            <option value="mid">Mid (3–5 yrs)</option>
            <option value="senior">Senior (5+ yrs)</option>
            <option value="any">Open to any</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ============== STEP 3: The work ============== -->
    <div class="cv-step" id="step3" data-step="3">
      <span class="cv-eyebrow">The work</span>
      <h2 class="cv-step-title">What will they actually do?</h2>
      <p class="cv-step-sub">We've pre-checked the most common responsibilities for this role. Adjust to match your needs.</p>

      <div class="cv-field">
        <label class="cv-label">Responsibilities</label>
        <div class="cv-resp-list" id="respList">
          <p style="font-size:13px; color:var(--cv-fg-3); padding:16px; text-align:center; margin:0;">Pick a role first to see suggested responsibilities.</p>
        </div>
      </div>

      <div class="cv-field">
        <label class="cv-label" for="qTasks">Anything else they should own? <span style="color:var(--cv-fg-3); font-weight:500;">(optional)</span></label>
        <textarea class="cv-textarea" id="qTasks" rows="2" placeholder="e.g. light bookkeeping in QuickBooks, travel planning..."></textarea>
      </div>

      <div class="cv-field">
        <label class="cv-label">Tools they'll use</label>
        <p class="q-hint" id="toolHint" style="display:none; font-size:12.5px; color:var(--cv-fg-3); margin: 0 0 10px;">Suggested for this role. Click to select, or add your own.</p>
        <div class="cv-pills" id="toolPills"></div>
        <div class="cv-tool-add" id="toolAddWrap" style="display:none; margin-top: 10px;">
          <button type="button" class="cv-add-btn" id="toolAddBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add another tool
          </button>
          <div class="cv-tool-input-wrap" id="toolInputWrap" style="display:none; margin-top: 8px;">
            <input type="text" class="cv-input cv-tool-input" id="toolInput" placeholder="Type a tool name and press Enter (e.g. DripJobs, MLS, NetSuite)" />
          </div>
        </div>
      </div>
    </div>

    <!-- ============== STEP 4: The fit ============== -->
    <div class="cv-step" id="step4" data-step="4">
      <span class="cv-eyebrow">The fit</span>
      <h2 class="cv-step-title">What makes someone a great fit?</h2>
      <p class="cv-step-sub">The must-haves you'd reject a candidate over, and the bonuses you'd love.</p>

      <div class="cv-non-block">
        <p class="cv-non-cat">Software experience</p>
        <input type="text" class="cv-input" id="qNonSoft" placeholder="e.g. 2+ years using QuickBooks, fluent in HubSpot..." />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Experience in this role</p>
        <input type="text" class="cv-input" id="qNonRole" placeholder="e.g. 3+ years supporting a founder or C-suite executive" />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Industry experience <span style="color:var(--cv-fg-3); font-weight:500; text-transform:none; letter-spacing:0;">(optional)</span></p>
        <input type="text" class="cv-input" id="qNonIndustry" placeholder="e.g. real estate, SaaS, agency..." />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Soft skills &amp; mindset</p>
        <input type="text" class="cv-input" id="qNonSoftSkill" placeholder="e.g. proactive, detail-oriented, comfortable with ambiguity" />
      </div>

      <div class="cv-field-row-2" style="margin-top:8px;">
        <div>
          <label class="cv-label" for="qEnglish">English proficiency required</label>
          <select class="cv-select" id="qEnglish">
            <option value="">Choose...</option>
            <option>Basic — written/email only</option>
            <option>Strong — written and spoken, comfortable on calls</option>
            <option>Fluent — near-native, client-facing</option>
          </select>
        </div>
        <div>
          <label class="cv-label" for="qNice">Nice to have <span style="color:var(--cv-fg-3); font-weight:500;">(optional)</span></label>
          <input type="text" class="cv-input" id="qNice" placeholder="e.g. background in startups" />
        </div>
      </div>
    </div>

    <!-- ============== STEP 5: Logistics ============== -->
    <div class="cv-step" id="step5" data-step="5">
      <span class="cv-eyebrow">Logistics</span>
      <h2 class="cv-step-title">When and where will they work?</h2>
      <p class="cv-step-sub">A few quick logistics so we can match availability and time zone overlap.</p>

      <div class="cv-field-row-2">
        <div>
          <label class="cv-label" for="qHours">Hours per week</label>
          <select class="cv-select" id="qHours">
            <option value="">Choose...</option>
            <option>10 hours</option>
            <option>20 hours</option>
            <option>30 hours</option>
            <option>40 hours (full-time)</option>
            <option>Project-based</option>
          </select>
        </div>
        <div>
          <label class="cv-label" for="qTzZone">Time zone</label>
          <select class="cv-select" id="qTzZone">
            <option value="">Choose...</option>
            <option>Eastern Time (ET)</option>
            <option>Central Time (CT)</option>
            <option>Mountain Time (MT)</option>
            <option>Pacific Time (PT)</option>
            <option>UK / GMT</option>
            <option>Australia (AEST)</option>
            <option>Flexible</option>
          </select>
        </div>
      </div>

      <div class="cv-field">
        <label class="cv-label" for="qTzWindow">Working window</label>
        <select class="cv-select" id="qTzWindow">
          <option value="">Choose...</option>
          <option>Standard business hours (9am–5pm)</option>
          <option>Morning overlap (8am–1pm)</option>
          <option>Afternoon overlap (12pm–5pm)</option>
          <option>Evening hours (4pm–10pm)</option>
          <option>Flexible — overlap a few hours daily</option>
          <option>24/7 coverage with shifts</option>
        </select>
      </div>
    </div>

    <!-- ============== STEP 6: Email capture / loading ============== -->
    <div class="cv-step cv-loading-step" id="step6" data-step="6">
      <div class="cv-loading-icon" id="loadingIcon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </div>
      <span class="cv-eyebrow">Final step</span>
      <h2 class="cv-step-title" style="text-align:center;">We're building your job description.</h2>
      <p class="cv-step-sub" style="text-align:center; margin-left:auto; margin-right:auto;">Drop your name and email to see your results. We'll also send a copy to your inbox so you can grab it anytime.</p>

      <div class="cv-loading-form">
        <input type="text" class="cv-input" id="qName" placeholder="Your first name" autocomplete="given-name" />
        <input type="email" class="cv-input" id="qEmail" placeholder="Your email address" autocomplete="email" />
      </div>

      <p class="cv-loading-microcopy">We'll never share your info. No spam, ever.</p>
    </div>

    <!-- ============== STEP 7: Result ============== -->
    <div class="cv-step cv-step-result" id="step7" data-step="7">
      <div class="cv-result-hero">
        <div class="cv-result-stats">
          <span id="resStat1">92% Match</span>
          <span class="dot">·</span>
          <span id="resStat2">Candidates in 2–5 days</span>
          <span class="dot">·</span>
          <span id="resStat3">Standard tier</span>
        </div>
        <h3 class="cv-result-headline" id="resHeadline">Your Executive Assistant role is ready.</h3>
        <p class="cv-result-sub" id="resSub">Based on your inputs, Coconut can typically fill this role with vetted, dedicated talent in just a few days.</p>
        <div class="cv-result-cta-row">
          <a href="#" target="_blank" rel="noopener" class="cv-btn cv-btn-primary" id="ctaCalendly">
            Find me candidates
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button class="cv-btn cv-btn-navy" id="ctaCopy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
            Copy entire JD
          </button>
        </div>
      </div>

      <div class="cv-jd-doc" id="jdDoc">
        <h3 class="cv-jd-title" id="jdTitle">Executive Assistant</h3>
        <p class="cv-jd-subtitle" id="jdSubtitle">Remote · 20 hrs/week · Eastern Time</p>
        <!-- Sections rendered by JS -->
      </div>

      <div class="cv-result-footer">
        <p>We also emailed a copy to <strong id="resEmailNote">your inbox</strong>. <button class="start-over" id="startOver">Start over →</button></p>
      </div>
    </div>

    <!-- ============== STEP NAVIGATION ============== -->
    <div class="cv-nav" id="stepNav">
      <button class="cv-btn cv-btn-ghost" id="btnBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back
      </button>
      <button class="cv-btn cv-btn-primary" id="btnNext">
        <span id="btnNextLabel">Next</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>

  </div>
</div>
    `;
  }

  initLogic() {
    var root = this.shadowRoot;
    var self = this;

    // =========================================================
  // BUCKET TOOLS — curated from real Coconut OS placement data
  // Each list is ranked by real frequency in the last 18 months
  // =========================================================
  var BUCKET_TOOLS = {
    ea: [
      'Google Workspace', 'Slack', 'Notion', 'Calendly', 'Zoom',
      'ChatGPT / Claude', 'HubSpot', 'Asana', 'Microsoft Office', 'Canva',
      'QuickBooks', 'Monday.com', 'Trello', 'Airtable', 'Dropbox',
      'Loom', 'Zapier', 'ClickUp', 'Stripe', 'Salesforce'
    ],
    sales: [
      'HubSpot', 'Salesforce', 'Apollo', 'ZoomInfo', 'LinkedIn Sales Navigator',
      'Outreach', 'Clay', 'Calendly', 'Slack', 'Google Workspace',
      'RingCentral', 'Aircall', 'Pipedrive', 'Instantly', 'Microsoft Office',
      'Go High Level', 'Lusha', 'SalesLoft', 'Gong', 'ChatGPT / Claude'
    ],
    marketing: [
      'Canva', 'Adobe Suite', 'ChatGPT / Claude', 'HubSpot', 'Mailchimp',
      'Klaviyo', 'Shopify', 'Google Analytics', 'Google Ads', 'Meta Business',
      'Instagram', 'LinkedIn', 'CapCut', 'Premiere Pro', 'WordPress',
      'Webflow', 'Hootsuite', 'Later', 'Figma', 'Google Workspace'
    ],
    ops: [
      'Notion', 'Asana', 'ClickUp', 'Monday.com', 'Slack',
      'Google Workspace', 'Airtable', 'Zapier', 'Make', 'Trello',
      'Microsoft Teams', 'Loom', 'Jira', 'Microsoft Office', 'ChatGPT / Claude',
      'Linear', 'Notion AI', 'Google Sheets', 'Excel', 'Calendly'
    ],
    finance: [
      'QuickBooks', 'Xero', 'NetSuite', 'Excel', 'Google Sheets',
      'Microsoft Office', 'Stripe', 'Sage', 'Bill.com', 'Dext',
      'Ramp', 'Brex', 'Gusto', 'DocuSign', 'Google Workspace',
      'Slack', 'ChatGPT / Claude', 'Concur', 'FreshBooks', 'Wave'
    ],
    cs: [
      'Zendesk', 'Intercom', 'Freshdesk', 'HubSpot', 'Salesforce',
      'RingCentral', 'Aircall', 'Five9', 'Slack', 'Microsoft Teams',
      'Google Workspace', 'Gorgias', 'Help Scout', 'Front', 'Dialpad',
      'Calendly', 'Notion', 'ChatGPT / Claude', 'Zoom', 'Microsoft Office'
    ],
    other: [
      'Google Workspace', 'Microsoft Office', 'Slack', 'Notion', 'Asana',
      'ClickUp', 'Monday.com', 'HubSpot', 'Salesforce', 'QuickBooks',
      'Calendly', 'Canva', 'Adobe Suite', 'ChatGPT / Claude', 'Zapier'
    ]
  };

  // =========================================================
  // ROLE LIBRARY — bucket → roles → sub-flavors + responsibilities
  // (Admin/EA fully filled; others minimal but functional)
  // =========================================================
  var BUCKETS = {
    ea: {
      label: 'Executive / Admin Support',
      roles: [
        { id: 'ea', label: 'Executive Assistant', tier: 'Standard' },
        { id: 'senior_ea', label: 'Senior EA / EA to the CEO', tier: 'Advanced' },
        { id: 'general_admin', label: 'General Admin / Administrative Assistant', tier: 'Standard' },
        { id: 'chief_of_staff', label: 'Chief of Staff', tier: 'Pro' }
      ]
    },
    sales: {
      label: 'Sales',
      roles: [
        { id: 'sdr', label: 'Sales Development Representative (SDR)', tier: 'Standard' },
        { id: 'bdr', label: 'Business Development Representative (BDR)', tier: 'Advanced' },
        { id: 'setter', label: 'Appointment Setter / Cold Caller', tier: 'Standard' },
        { id: 'ae', label: 'Account Executive', tier: 'Advanced' }
      ]
    },
    marketing: {
      label: 'Marketing & Content',
      roles: [
        { id: 'social', label: 'Social Media Manager', tier: 'Standard' },
        { id: 'marketing', label: 'Marketing Specialist', tier: 'Advanced' },
        { id: 'content', label: 'Content Writer / Copywriter', tier: 'Standard' },
        { id: 'designer', label: 'Graphic Designer', tier: 'Advanced' },
        { id: 'video', label: 'Video Editor', tier: 'Advanced' },
        { id: 'seo', label: 'SEO Specialist', tier: 'Advanced' }
      ]
    },
    ops: {
      label: 'Operations',
      roles: [
        { id: 'pm', label: 'Project Manager / Coordinator', tier: 'Advanced' },
        { id: 'ops', label: 'Operations Specialist', tier: 'Advanced' },
        { id: 'data', label: 'Data Entry / Research Specialist', tier: 'Standard' }
      ]
    },
    finance: {
      label: 'Finance / Bookkeeping',
      roles: [
        { id: 'bookkeeper', label: 'Bookkeeper', tier: 'Standard' },
        { id: 'apar', label: 'AP/AR Specialist (Invoice Coder)', tier: 'Standard' },
        { id: 'analyst', label: 'Financial Analyst', tier: 'Pro' }
      ]
    },
    cs: {
      label: 'Customer Service',
      roles: [
        { id: 'csr', label: 'Customer Service Representative', tier: 'Standard' },
        { id: 'csm', label: 'Client Success Manager', tier: 'Advanced' }
      ]
    },
    other: {
      label: 'Something else',
      roles: [
        { id: 'other', label: 'I\'ll describe the role myself', tier: 'Standard' }
      ]
    }
  };

  // Role library — full data for EA family. Others use generic fallback.
  var ROLES = {
    ea: {
      description: 'Right-hand support for a founder or executive. Keeps the day organized, communications flowing, and priorities on track.',
      responsibilities: [
        'Manage and triage the executive\'s inbox, flagging priorities and drafting replies in their voice',
        'Own calendar management, scheduling, and meeting prep across personal and professional commitments',
        'Coordinate domestic and international travel, including flights, accommodations, and itineraries',
        'Prepare meeting agendas, take notes during calls, and track action items to completion',
        'Act as a liaison between the executive and clients, vendors, and internal team members',
        'Handle confidential information with discretion and professionalism',
        'Track tasks, deadlines, and follow-ups across multiple ongoing projects',
        'Conduct research and prepare briefing documents on people, companies, and topics',
        'Manage expense tracking, receipts, and reimbursement workflows',
        'Maintain organized digital filing systems and SOPs',
        'Draft, proofread, and edit emails, memos, and other business documents'
      ],
      defaultChecked: [0,1,2,3,4,5,7],
      subFlavors: [
        { id: 'bookkeeping', label: '+ Bookkeeping', adds: ['Process invoices and track expenses in QuickBooks or Xero','Reconcile credit card and bank statements monthly','Manage accounts payable and receivable workflows'], tools: ['QuickBooks','Xero'] },
        { id: 'social', label: '+ Social Media', adds: ['Plan and schedule a weekly content calendar across LinkedIn and Instagram','Draft posts, captions, and short-form copy in the brand voice','Create basic graphics using Canva'], tools: ['Canva'] },
        { id: 'marketing', label: '+ Marketing', adds: ['Build and manage email newsletters and marketing campaigns','Conduct list building and prospect research for outbound','Coordinate content distribution and performance tracking'], tools: ['HubSpot'] },
        { id: 'project', label: '+ Project Management', adds: ['Maintain project plans and status updates across multiple workstreams','Coordinate contractors and team members to keep projects on track','Run weekly check-ins and surface blockers'], tools: ['Asana','ClickUp','Notion'] }
      ],
      tools: ['Google Workspace','Slack','Calendly','Notion','ChatGPT / Claude']
    },
    senior_ea: {
      description: 'High-trust partner to a CEO. Operates with significant autonomy, handles sensitive communications, and acts as a gatekeeper.',
      responsibilities: [
        'Act as the primary gatekeeper for the CEO\'s time, inbox, and calendar',
        'Manage complex executive communications, including board, investor, and stakeholder correspondence',
        'Coordinate multi-leg international travel with detailed itineraries',
        'Prepare board materials, investor decks, and executive briefing documents',
        'Attend executive meetings, take detailed minutes, and track follow-through',
        'Manage relationships with key external stakeholders',
        'Coordinate logistics for offsites, retreats, and high-stakes meetings',
        'Handle highly confidential information including financial, legal, and HR matters',
        'Streamline executive workflows and identify systemization opportunities',
        'Lead special projects and initiatives on behalf of the CEO'
      ],
      defaultChecked: [0,1,2,3,4,5,7,9],
      subFlavors: [
        { id: 'investor', label: '+ Investor Relations', adds: ['Coordinate investor outreach and follow-ups','Maintain investor CRM and milestone communications','Prepare investor updates and quarterly reports'], tools: ['HubSpot'] },
        { id: 'strategic', label: '+ Strategic Projects', adds: ['Lead cross-functional projects on behalf of the executive','Track OKRs and company-wide priorities','Build executive dashboards and reporting'], tools: ['Notion','Asana'] }
      ],
      tools: ['Google Workspace','Slack','Notion','Calendly','ChatGPT / Claude']
    },
    general_admin: {
      description: 'Broad administrative support for a small business or growing team. Handles a mix of admin, data, customer, and operations tasks.',
      responsibilities: [
        'Manage email correspondence and inbox triage',
        'Schedule appointments, meetings, and calls for the team',
        'Handle data entry, list cleaning, and record maintenance',
        'Respond to customer service emails and basic support tickets',
        'Maintain organized digital filing systems and document libraries',
        'Process basic invoicing, payment tracking, and expense logging',
        'Conduct research on companies, prospects, or vendors',
        'Update and maintain CRM records with accurate information',
        'Post basic social media updates and manage simple content scheduling',
        'Handle ad hoc administrative requests as they come up'
      ],
      defaultChecked: [0,1,2,3,4,9],
      subFlavors: [
        { id: 'cs', label: '+ Customer Service focus', adds: ['Respond to inbound customer questions across email and chat','Resolve common issues using company playbook','Track tickets and customer outcomes'], tools: [] },
        { id: 'data', label: '+ Data Entry focus', adds: ['Maintain large, clean datasets across CRMs and spreadsheets','Audit records for accuracy and duplicates','Build and maintain simple dashboards'], tools: ['Microsoft Office'] }
      ],
      tools: ['Google Workspace','Microsoft Office','Slack']
    },
    chief_of_staff: {
      description: 'Strategic right-hand to a founder or CEO. Bridges leadership and execution, owns cross-functional projects, and turns vision into operational reality.',
      responsibilities: [
        'Partner with the founder on strategy, translating vision into executable plans',
        'Drive cross-functional projects and ensure on-time delivery',
        'Manage contractors, agencies, and internal team members',
        'Identify operational bottlenecks and design systems to remove them',
        'Build, document, and automate repeatable processes and SOPs',
        'Lead executive communications, including board and investor updates',
        'Manage hiring pipelines and coordinate interview processes',
        'Track OKRs, strategic initiatives, and company-wide KPIs',
        'Run leadership team meetings and follow up on action items'
      ],
      defaultChecked: [0,1,3,4,7,8],
      subFlavors: [
        { id: 'ops', label: '+ Operations focus', adds: ['Own day-to-day business operations and process management','Manage vendor relationships, contracts, and operational budgets','Build dashboards and reporting workflows'], tools: ['Notion'] }
      ],
      tools: ['Google Workspace','Slack','Notion','Asana','ChatGPT / Claude']
    }
  };

  // Generic fallback for roles not yet in the library
  function genericRole(roleLabel) {
    return {
      description: 'Dedicated professional to support your business operations.',
      responsibilities: [
        'Execute core responsibilities of the role with attention to detail',
        'Communicate proactively with the team and stakeholders',
        'Maintain organized records and documentation',
        'Follow established processes and identify improvements',
        'Use modern tools to scale output and quality',
        'Adapt quickly to changing priorities and business needs'
      ],
      defaultChecked: [0,1,2,3,4],
      subFlavors: [],
      tools: ['Google Workspace','Slack']
    };
  }

  function getRoleData(roleId) {
    return ROLES[roleId] || genericRole();
  }

  // =========================================================
  // STATE
  // =========================================================
  var state = {
    currentStep: 1,
    totalSteps: 5,
    // Step 1
    company: '', industry: '', years: '', position: '',
    // Step 2
    bucket: '', role: '', roleLabel: '', roleOther: '', tier: 'Standard',
    subFlavors: new Set(), count: '1', exp: '',
    // Step 3
    checkedResp: new Set(), tasks: '', tools: new Set(), customTools: new Set(),
    // Step 4
    nonSoft: '', nonRole: '', nonIndustry: '', nonSoftSkill: '',
    english: '', nice: '',
    // Step 5
    hours: '', tzZone: '', tzWindow: '',
    // Step 6
    name: '', email: '',
    // AI output
    _aiAbout: null, _aiResponsibilities: null,
    _aiNonNegotiables: null, _aiNiceToHaves: null,
    _aiError: null, _match: null, _days: null
  };

  // =========================================================
  // DOM
  // =========================================================
  var $ = function(id) { return root.getElementById(id); };
  var $$ = function(s) { return root.querySelectorAll(s); };

  // =========================================================
  // PROGRESS
  // =========================================================
  function updateProgress() {
    var step = state.currentStep;
    var total = 5;
    if (step <= 5) {
      $('progressLabel').textContent = 'Step ' + step + ' of ' + total;
      $('progressFill').style.width = (step / total * 100) + '%';
      $('progressWrap').style.display = 'flex';
    } else if (step === 6) {
      $('progressLabel').textContent = 'Almost there...';
      $('progressFill').style.width = '100%';
      $('progressWrap').style.display = 'flex';
    } else {
      $('progressWrap').style.display = 'none';
    }
  }

  // =========================================================
  // STEP NAVIGATION
  // =========================================================
  function goToStep(n) {
    $$('.cv-step').forEach(function(s) { s.classList.remove('active'); });
    $('step' + n).classList.add('active');
    state.currentStep = n;
    updateProgress();
    updateNav();

    // Re-render step-specific dynamic content on entry
    if (n === 3) {
      populateRespList();
      populateSuggestedTools();
    }

    // scroll embed into view a tiny bit if needed
    var card = root.querySelector('.cv-card');
    if (card && window.innerWidth < 720) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Notify Wix to recompute iframe height after step transition
    setTimeout(function() { self.notifyHeight(); }, 100);
    setTimeout(function() { self.notifyHeight(); }, 500);
  }

  function updateNav() {
    var nav = $('stepNav');
    var step = state.currentStep;
    if (step === 7) {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = 'flex';
    $('btnBack').style.visibility = step === 1 ? 'hidden' : 'visible';

    var nextLabel = 'Next';
    if (step === 5) nextLabel = 'Continue';
    if (step === 6) nextLabel = 'Show me my results';
    $('btnNextLabel').textContent = nextLabel;

    // Enable/disable next based on minimal validation
    $('btnNext').disabled = !canAdvance(step);
  }

  function canAdvance(step) {
    if (step === 1) return state.company.trim() && state.industry && state.years && state.position.trim();
    if (step === 2) {
      if (!state.bucket || !state.role || !state.exp) return false;
      if (state.role === 'other' && !state.roleOther.trim()) return false;
      return true;
    }
    if (step === 3) return state.checkedResp.size > 0 && state.tools.size > 0;
    if (step === 4) return state.nonSoft.trim() && state.nonRole.trim() && state.english;
    if (step === 5) return state.hours && state.tzZone && state.tzWindow;
    if (step === 6) return state.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    return true;
  }

  $('btnBack').addEventListener('click', function() {
    if (state.currentStep > 1) goToStep(state.currentStep - 1);
  });
  $('btnNext').addEventListener('click', function() {
    if (!canAdvance(state.currentStep)) return;
    if (state.currentStep === 6) {
      handleSubmit();
    } else if (state.currentStep < 7) {
      goToStep(state.currentStep + 1);
    }
  });

  // =========================================================
  // STEP 1 wiring
  // =========================================================
  ['qCompany','qIndustry','qYears','qPosition'].forEach(function(id) {
    $(id).addEventListener('input', updateStep1);
    $(id).addEventListener('change', updateStep1);
  });
  function updateStep1() {
    state.company = $('qCompany').value;
    state.industry = $('qIndustry').value;
    state.years = $('qYears').value;
    state.position = $('qPosition').value;
    updateNav();
  }

  // =========================================================
  // STEP 2 wiring — task buckets + role select + sub-flavors
  // =========================================================
  $$('#taskBuckets .cv-pill').forEach(function(p) {
    p.addEventListener('click', function() {
      $$('#taskBuckets .cv-pill').forEach(function(x) { x.classList.remove('on'); });
      p.classList.add('on');
      state.bucket = p.dataset.bucket;
      state.role = '';
      state.roleLabel = '';
      state.roleOther = '';
      state.subFlavors.clear();
      $('qRoleOther').style.display = 'none';
      $('qRoleOther').value = '';
      populateRoleSelect();
      $('roleField').style.display = 'block';
      $('subFlavorField').style.display = 'none';
      $('roleMetaField').style.display = 'none';
      updateNav();
    });
  });

  function populateRoleSelect() {
    var sel = $('qRole');
    sel.innerHTML = '<option value="">Choose a role...</option>';
    var bucket = BUCKETS[state.bucket];
    if (!bucket) return;
    bucket.roles.forEach(function(r) {
      var opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.label;
      opt.dataset.tier = r.tier;
      sel.appendChild(opt);
    });
  }

  $('qRole').addEventListener('change', function() {
    state.role = this.value;
    var opt = this.options[this.selectedIndex];
    state.roleLabel = opt.textContent;
    state.tier = opt.dataset.tier || 'Standard';
    // Show "Other" input if user picked 'other'
    var otherInput = $('qRoleOther');
    if (state.role === 'other') {
      otherInput.style.display = 'block';
      otherInput.focus();
    } else {
      otherInput.style.display = 'none';
      state.roleOther = '';
      otherInput.value = '';
    }
    // Reset role-dependent state on role change
    state.subFlavors.clear();
    state.checkedResp.clear();
    state.tools.clear();
    state.customTools.clear();
    $$('#toolPills .cv-pill').forEach(function(p) { p.classList.remove('on'); p.classList.remove('suggested'); });
    populateSubFlavors();
    populateRespList();
    populateSuggestedTools();
    var roleData = getRoleData(state.role);
    var hasSubFlavors = roleData.subFlavors && roleData.subFlavors.length > 0;
    $('subFlavorField').style.display = (state.role && hasSubFlavors) ? 'block' : 'none';
    $('roleMetaField').style.display = state.role ? 'grid' : 'none';
    updateNav();
  });

  // Wire "Other" custom role input
  $('qRoleOther').addEventListener('input', function() {
    state.roleOther = this.value;
    if (state.role === 'other') {
      state.roleLabel = this.value.trim() || 'Other';
    }
    updateNav();
  });

  function populateSubFlavors() {
    var container = $('subFlavorPills');
    container.innerHTML = '';
    var data = getRoleData(state.role);
    if (!data.subFlavors || !data.subFlavors.length) return;
    data.subFlavors.forEach(function(sf) {
      var p = document.createElement('span');
      p.className = 'cv-pill';
      p.dataset.flavor = sf.id;
      p.textContent = sf.label;
      p.addEventListener('click', function() {
        if (state.subFlavors.has(sf.id)) {
          state.subFlavors.delete(sf.id);
          p.classList.remove('on');
        } else {
          state.subFlavors.add(sf.id);
          p.classList.add('on');
        }
        populateRespList();
        populateSuggestedTools();
      });
      container.appendChild(p);
    });
  }

  $('qCount').addEventListener('change', function() { state.count = this.value; });
  $('qExp').addEventListener('change', function() { state.exp = this.value; updateNav(); });

  // =========================================================
  // STEP 3 wiring — responsibilities checklist + tools
  // =========================================================
  function populateRespList() {
    var list = $('respList');
    if (!state.role) {
      list.innerHTML = '<p style="font-size:13px; color:var(--cv-fg-3); padding:16px; text-align:center; margin:0;">Pick a role first to see suggested responsibilities.</p>';
      return;
    }
    var data = getRoleData(state.role);
    var all = data.responsibilities.slice();
    var subAdds = [];
    if (data.subFlavors) {
      state.subFlavors.forEach(function(fid) {
        var f = data.subFlavors.find(function(x) { return x.id === fid; });
        if (f) f.adds.forEach(function(a) { subAdds.push({ text: a, badge: f.label }); });
      });
    }

    // Pre-check defaults only if checked set is empty
    if (state.checkedResp.size === 0) {
      (data.defaultChecked || []).forEach(function(idx) {
        if (data.responsibilities[idx]) state.checkedResp.add(data.responsibilities[idx]);
      });
      subAdds.forEach(function(s) { state.checkedResp.add(s.text); });
    }

    var html = '';
    all.forEach(function(text) {
      var on = state.checkedResp.has(text);
      html += '<div class="cv-resp-item ' + (on ? 'on' : '') + '" data-text="' + escapeAttr(text) + '">' +
        '<span class="cv-resp-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
        '<span>' + escapeHtml(text) + '</span>' +
        '</div>';
    });
    subAdds.forEach(function(s) {
      var on = state.checkedResp.has(s.text);
      html += '<div class="cv-resp-item ' + (on ? 'on' : '') + '" data-text="' + escapeAttr(s.text) + '">' +
        '<span class="cv-resp-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
        '<span>' + escapeHtml(s.text) + '<span class="cv-badge-mini">' + escapeHtml(s.badge) + '</span></span>' +
        '</div>';
    });
    list.innerHTML = html;
    list.querySelectorAll('.cv-resp-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var t = item.dataset.text;
        if (state.checkedResp.has(t)) {
          state.checkedResp.delete(t);
          item.classList.remove('on');
        } else {
          state.checkedResp.add(t);
          item.classList.add('on');
        }
        updateNav();
      });
    });
  }

  function populateToolPills() {
    var container = $('toolPills');
    var addWrap = $('toolAddWrap');
    var hint = $('toolHint');

    if (!state.bucket) {
      container.innerHTML = '<p style="font-size:13px; color:var(--cv-fg-3); padding:8px 4px; margin:0;">Pick a role above to see relevant tools.</p>';
      addWrap.style.display = 'none';
      hint.style.display = 'none';
      return;
    }

    hint.style.display = 'block';
    addWrap.style.display = 'block';

    // Build list of bucket tools, plus get role-specific suggested tools
    var bucketTools = BUCKET_TOOLS[state.bucket] || BUCKET_TOOLS.other;
    var data = getRoleData(state.role);
    var roleSuggested = (data.tools || []).slice();
    if (data.subFlavors) {
      state.subFlavors.forEach(function(fid) {
        var f = data.subFlavors.find(function(x) { return x.id === fid; });
        if (f && f.tools) f.tools.forEach(function(t) {
          if (roleSuggested.indexOf(t) < 0) roleSuggested.push(t);
        });
      });
    }

    // Merge: role-suggested first (top), then bucket tools
    var allTools = [];
    roleSuggested.forEach(function(t) {
      if (allTools.indexOf(t) < 0) allTools.push(t);
    });
    bucketTools.forEach(function(t) {
      if (allTools.indexOf(t) < 0) allTools.push(t);
    });

    // Auto-suggest role-specific tools (only if user hasn't picked anything yet)
    var autoPickIfEmpty = state.tools.size === 0;
    if (autoPickIfEmpty) {
      roleSuggested.forEach(function(t) {
        if (allTools.indexOf(t) >= 0) state.tools.add(t);
      });
    }

    // Render pills
    var html = '';
    allTools.forEach(function(tool) {
      var on = state.tools.has(tool);
      html += '<span class="cv-pill ' + (on ? 'on' : '') + '" data-tool="' + escapeAttr(tool) + '">' + escapeHtml(tool) + '</span>';
    });

    // Render custom-added tools (kept across re-renders)
    state.customTools.forEach(function(tool) {
      html += '<span class="cv-pill on custom" data-tool="' + escapeAttr(tool) + '" data-custom="1">' +
        escapeHtml(tool) +
        '<span class="pill-x" data-remove="' + escapeAttr(tool) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</span></span>';
    });

    container.innerHTML = html;

    // Wire pill clicks
    container.querySelectorAll('.cv-pill').forEach(function(p) {
      // Click on remove × — only for custom pills
      var xBtn = p.querySelector('.pill-x');
      if (xBtn) {
        xBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var toolName = xBtn.dataset.remove;
          state.tools.delete(toolName);
          state.customTools.delete(toolName);
          populateToolPills();
          updateNav();
        });
      }
      // Click on pill body — toggle
      p.addEventListener('click', function(e) {
        if (e.target.closest('.pill-x')) return; // ignore if clicked the ×
        var t = p.dataset.tool;
        if (state.tools.has(t)) {
          state.tools.delete(t);
          p.classList.remove('on');
        } else {
          state.tools.add(t);
          p.classList.add('on');
        }
        updateNav();
      });
    });
  }

  // Backward-compatible alias
  function populateSuggestedTools() {
    populateToolPills();
  }

  // "Add custom tool" wiring
  $('toolAddBtn').addEventListener('click', function() {
    var wrap = $('toolInputWrap');
    var input = $('toolInput');
    wrap.style.display = 'block';
    input.value = '';
    setTimeout(function() { input.focus(); }, 10);
  });

  $('toolInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var val = this.value.trim();
      if (!val) return;
      // Dedup against everything that's there
      var allCurrent = new Set();
      $$('#toolPills .cv-pill').forEach(function(p) { allCurrent.add(p.dataset.tool.toLowerCase()); });
      if (allCurrent.has(val.toLowerCase())) {
        // Already exists — just toggle it on
        state.tools.add(val);
      } else {
        state.customTools.add(val);
        state.tools.add(val);
      }
      this.value = '';
      $('toolInputWrap').style.display = 'none';
      populateToolPills();
      updateNav();
    } else if (e.key === 'Escape') {
      this.value = '';
      $('toolInputWrap').style.display = 'none';
    }
  });

  $('toolInput').addEventListener('blur', function() {
    // Hide input if user clicks away without entering anything
    var self = this;
    setTimeout(function() {
      if (!self.value.trim()) $('toolInputWrap').style.display = 'none';
    }, 200);
  });

  $('qTasks').addEventListener('input', function() { state.tasks = this.value; });

  // =========================================================
  // STEP 4 wiring — fit
  // =========================================================
  ['qNonSoft','qNonRole','qNonIndustry','qNonSoftSkill','qEnglish','qNice'].forEach(function(id) {
    $(id).addEventListener('input', updateStep4);
    $(id).addEventListener('change', updateStep4);
  });
  function updateStep4() {
    state.nonSoft = $('qNonSoft').value;
    state.nonRole = $('qNonRole').value;
    state.nonIndustry = $('qNonIndustry').value;
    state.nonSoftSkill = $('qNonSoftSkill').value;
    state.english = $('qEnglish').value;
    state.nice = $('qNice').value;
    updateNav();
  }

  // =========================================================
  // STEP 5 wiring
  // =========================================================
  ['qHours','qTzZone','qTzWindow'].forEach(function(id) {
    $(id).addEventListener('change', updateStep5);
  });
  function updateStep5() {
    state.hours = $('qHours').value;
    state.tzZone = $('qTzZone').value;
    state.tzWindow = $('qTzWindow').value;
    updateNav();
  }

  // =========================================================
  // STEP 6 wiring + SUBMIT
  // =========================================================
  ['qName','qEmail'].forEach(function(id) {
    $(id).addEventListener('input', function() {
      state.name = $('qName').value;
      state.email = $('qEmail').value;
      updateNav();
    });
  });

  // =========================================================
  // OPENAI INTEGRATION
  // =========================================================
  // NOTE: This key is exposed in client-side code. Acceptable for this mockup
  // only. In production (Wix), this MUST move to a Velo backend function.
  var OPENAI_KEY = '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';
  var OPENAI_MODEL = 'gpt-4o-mini';
  var SESSION_KEY = 'coconut_jd_generated';

  function buildAIPrompt() {
    var roleLabel = state.roleLabel || 'role';
    var roleData = getRoleData(state.role);
    var checked = Array.from(state.checkedResp);
    var subFlavorLabels = [];
    state.subFlavors.forEach(function(fid) {
      var f = (roleData.subFlavors || []).find(function(x) { return x.id === fid; });
      if (f) subFlavorLabels.push(f.label);
    });

    var inputs = {
      company: state.company,
      industry: state.industry,
      years_in_business: state.years,
      hiring_manager_role: state.position,
      role: roleLabel,
      specializations: subFlavorLabels,
      experience_level: state.exp,
      checked_responsibilities: checked,
      free_text_extras: state.tasks,
      tools: Array.from(state.tools),
      english_level: state.english,
      raw_non_negotiables: {
        software: state.nonSoft,
        role_experience: state.nonRole,
        industry_experience: state.nonIndustry,
        soft_skills: state.nonSoftSkill
      },
      raw_nice_to_have: state.nice,
      time_zone: state.tzZone,
      hours: state.hours
    };

    var systemPrompt = "You are a senior recruiter at Coconut, a premium remote staffing agency placing Filipino professionals at growing US/UK companies. You write polished job descriptions in Coconut's house voice: clear, action-oriented, tools-specific, no generic fluff. You take raw founder inputs and transform them into a professional job description that founders would pay $500 to have written. Always return STRICT JSON only, no markdown, no preamble.";

    var userPrompt = "Generate a polished, recruiter-grade job description from these founder inputs:\n\n" +
      JSON.stringify(inputs, null, 2) +
      "\n\nReturn STRICT JSON with this exact shape:\n" +
      "{\n" +
      '  "about_paragraph": "3-4 sentence engaging intro about the role. Mention company name naturally, infer what the company does from industry+years, describe the broader mission this person joins. Sound human and specific, not template-y. End mentioning it being a fully remote role.",\n' +
      '  "responsibilities": ["bullet 1", "bullet 2", ...],\n' +
      '  "non_negotiables": ["filter 1", "filter 2", ...],\n' +
      '  "nice_to_haves": ["bonus 1", "bonus 2", ...]\n' +
      "}\n\n" +
      "Rules for responsibilities (8-12 bullets):\n" +
      "- Use checked_responsibilities as foundation. Refine wording, don't replace meaning.\n" +
      "- Integrate free_text_extras polished into Coconut voice.\n" +
      "- Each bullet starts with action verb, mentions specific tools when relevant, is ONE clear sentence.\n" +
      "- Order from most important to least important.\n" +
      "- Add 1-2 specialized bullets based on industry context (e.g. real estate → mention MLS; SaaS → mention product onboarding).\n" +
      "- NEVER use markdown, NEVER use generic skill bullets like 'strong communication' (those go in non_negotiables).\n\n" +
      "Rules for non_negotiables (4-6 items):\n" +
      "- Take raw_non_negotiables values and polish each into a professional 'must-have' line.\n" +
      "- Combine english_level naturally (e.g. 'Strong written and spoken English, comfortable on client calls').\n" +
      "- Skip empty or 'n/a' values, don't include them.\n" +
      "- Add 1-2 implied must-haves the founder forgot but matter for this role (reliability, time zone overlap, attention to detail tied to the role).\n" +
      "- Each item is a clear filter a recruiter could screen against.\n\n" +
      "Rules for nice_to_haves (3-5 items):\n" +
      "- Use raw_nice_to_have if provided and polish it.\n" +
      "- Infer 2-4 bonuses based on role + industry + tools (e.g. 'Experience with venture-backed startups' for tech roles, 'Familiarity with X tool' when relevant).\n" +
      "- Make these aspirational, not redundant with non_negotiables.\n\n" +
      "Rules for about_paragraph:\n" +
      "- Use company name naturally, never in ALL CAPS or quoted.\n" +
      "- Make industry feel specific, not labeled. Say 'a growing professional services firm' not 'a company in Professional Services'.\n" +
      "- Sound like the founder wrote it warmly, not a template.";

    return { system: systemPrompt, user: userPrompt };
  }

  function callOpenAI() {
    return new Promise(function(resolve, reject) {
      var prompts = buildAIPrompt();
      var timedOut = false;

      // Timeout via Promise.race (sandbox-safe, avoids AbortController issue)
      var timeoutPromise = new Promise(function(_, rej) {
        setTimeout(function() {
          timedOut = true;
          rej(new Error('Request timed out after 45 seconds. Please try again.'));
        }, 45000);
      });

      var fetchPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_KEY
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: prompts.system },
            { role: 'user', content: prompts.user }
          ],
          max_tokens: 1400,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      }).then(function(res) {
        if (timedOut) return;
        if (!res.ok) {
          return res.json().then(function(err) {
            var msg = (err && err.error && err.error.message) ? err.error.message : ('OpenAI API error: ' + res.status);
            throw new Error(msg);
          });
        }
        return res.json();
      }).then(function(data) {
        if (timedOut) return;
        var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!content) throw new Error('Empty response from OpenAI');
        var parsed;
        try { parsed = JSON.parse(content); }
        catch (e) { throw new Error('OpenAI returned invalid JSON'); }
        if (!parsed.about_paragraph || !Array.isArray(parsed.responsibilities)) {
          throw new Error('OpenAI returned malformed JSON structure');
        }
        return parsed;
      });

      Promise.race([fetchPromise, timeoutPromise]).then(resolve).catch(reject);
    });
  }

  function handleSubmit() {
    // Rate limit check
    try {
      if (localStorage.getItem(SESSION_KEY)) {
        if (!confirm("You've already generated a JD in this browser session. Generate another one anyway?")) {
          return;
        }
      }
    } catch(e) { /* localStorage might not be available, fail open */ }

    // Loading state
    $('btnNext').disabled = true;
    $('btnNextLabel').textContent = 'Generating...';
    $('loadingIcon').classList.add('spinning');

    // Compute deterministic results (score, days, tier)
    computeResults();

    // Call OpenAI for AI-enriched JD
    callOpenAI().then(function(ai) {
      state._aiAbout = ai.about_paragraph;
      state._aiResponsibilities = ai.responsibilities;
      state._aiNonNegotiables = Array.isArray(ai.non_negotiables) ? ai.non_negotiables : null;
      state._aiNiceToHaves = Array.isArray(ai.nice_to_haves) ? ai.nice_to_haves : null;
      state._aiError = null;
      try { localStorage.setItem(SESSION_KEY, '1'); } catch(e) {}
      renderJD();
      goToStep(7);
    }).catch(function(err) {
      console.error('OpenAI call failed:', err);
      state._aiAbout = null;
      state._aiResponsibilities = null;
      state._aiNonNegotiables = null;
      state._aiNiceToHaves = null;
      state._aiError = err.message || 'Unknown error';
      renderJD();
      goToStep(7);
    }).then(function() {
      $('btnNext').disabled = false;
      $('btnNextLabel').textContent = 'Show me my results';
      $('loadingIcon').classList.remove('spinning');
    });
  }

  // =========================================================
  // EMULATED SCORING + RESULTS
  // =========================================================
  function computeResults() {
    // Base fill rate by role (calibrated to be optimistic from data)
    var baseRates = {
      ea: 94, senior_ea: 88, general_admin: 92, chief_of_staff: 82,
      sdr: 88, bdr: 84, setter: 90, ae: 80,
      social: 89, marketing: 87, content: 86, designer: 80, video: 82, seo: 84,
      pm: 84, ops: 86, data: 92,
      bookkeeper: 90, apar: 91, analyst: 80,
      csr: 90, csm: 86,
      other: 82
    };
    var match = baseRates[state.role] || 84;
    // Modifiers
    if (state.exp === 'senior') match -= 3;
    if (state.subFlavors.size >= 3) match -= 2;
    if (state.english === 'Fluent — near-native, client-facing') match -= 2;
    if (state.hours === '20 hours') match += 2;
    if (state.tzWindow === 'Flexible — overlap a few hours daily') match += 1;
    match = Math.max(80, Math.min(96, match));

    // Time to candidates — optimistic (2-5 typical)
    var daysBase = { ea: '2-5', sdr: '2-4', general_admin: '2-5', social: '3-5', marketing: '3-5', csr: '3-5', bookkeeper: '3-6' };
    var days = daysBase[state.role] || '3-7';

    state._match = match;
    state._days = days;
  }

  function renderJD() {
    var roleData = getRoleData(state.role);
    var roleLabel = state.roleLabel || 'this role';

    // Hero stats
    $('resStat1').textContent = state._match + '% Match';
    $('resStat2').textContent = 'Candidates in ' + state._days + ' days';
    $('resStat3').textContent = state.tier + ' tier';

    var pluralRole = roleLabel + (state.count !== '1' ? ' roles' : ' role');
    $('resHeadline').textContent = 'Your ' + roleLabel + ' job description is ready.';
    $('resSub').textContent = 'Based on your inputs, Coconut typically fills this role in ' + state._days + ' days with vetted, dedicated talent.';
    $('resEmailNote').textContent = state.email || 'your inbox';

    // JD doc title + subtitle
    var subtitleParts = ['Remote'];
    if (state.hours) subtitleParts.push(state.hours);
    if (state.tzZone) subtitleParts.push(state.tzZone);
    $('jdTitle').textContent = roleLabel + (state.company ? ' — ' + state.company : '');
    $('jdSubtitle').textContent = subtitleParts.join(' · ');

    // Build sections
    var sections = '';

    // About the role — use AI if available, else template fallback
    var aboutHtml;
    if (state._aiAbout) {
      aboutHtml = '<p style="font-size:13.5px; line-height:1.6; color:var(--cv-fg-2); margin:0;">' +
        escapeHtml(state._aiAbout) + '</p>';
    } else {
      aboutHtml = '<p style="font-size:13.5px; line-height:1.6; color:var(--cv-fg-2); margin:0;">' +
        (state.company ? escapeHtml(state.company) : 'We') + ' is hiring a remote ' + escapeHtml(roleLabel) +
        ' to ' + (roleData.description.toLowerCase().replace(/\.$/, '')) + '. This is a fully remote, ' +
        (state.hours ? escapeHtml(state.hours.toLowerCase()) : 'part-time') + ' role within ' +
        (state.tzZone || 'flexible time zone') + '.</p>';
    }
    sections += '<div class="cv-jd-section">' +
      '<div class="cv-jd-h3">About the role ' + copyBtn('about') + '</div>' +
      '<div id="copyTarget-about">' + aboutHtml + '</div></div>';

    // What you'll do — use AI refined bullets if available, else checked + free-text
    var checked;
    if (state._aiResponsibilities && state._aiResponsibilities.length) {
      checked = state._aiResponsibilities.slice();
    } else {
      checked = Array.from(state.checkedResp);
      if (state.tasks.trim()) {
        state.tasks.split(/[\n,]/).forEach(function(t) {
          var c = t.trim().replace(/^[-•]\s*/, '');
          if (c) checked.push(c.charAt(0).toUpperCase() + c.slice(1));
        });
      }
    }
    if (checked.length) {
      sections += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">What you\'ll do ' + copyBtn('do') + '</div>' +
        '<ul id="copyTarget-do">' +
        checked.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Tools you'll use
    if (state.tools.size) {
      sections += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">Tools you\'ll use ' + copyBtn('tools') + '</div>' +
        '<ul id="copyTarget-tools">' +
        Array.from(state.tools).map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Non-negotiables — AI-polished if available, else template
    function isMeaningful(v) {
      if (!v) return false;
      var s = String(v).trim().toLowerCase();
      if (!s) return false;
      var skipValues = ['n/a','na','none','-','—','skip','no','not applicable','nope'];
      return skipValues.indexOf(s) < 0;
    }
    var nons;
    if (state._aiNonNegotiables && state._aiNonNegotiables.length) {
      nons = state._aiNonNegotiables.slice();
    } else {
      nons = [];
      if (isMeaningful(state.nonSoft)) nons.push(state.nonSoft.trim());
      if (isMeaningful(state.nonRole)) nons.push(state.nonRole.trim());
      if (isMeaningful(state.nonIndustry)) nons.push('Experience in ' + state.nonIndustry.trim());
      if (isMeaningful(state.nonSoftSkill)) nons.push(state.nonSoftSkill.trim());
      if (state.english) nons.push(state.english + ' English');
    }
    if (nons.length) {
      sections += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">What we\'re looking for ' + copyBtn('non') + '</div>' +
        '<ul id="copyTarget-non">' +
        nons.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Nice to have — AI-polished if available, else template
    var nices;
    if (state._aiNiceToHaves && state._aiNiceToHaves.length) {
      nices = state._aiNiceToHaves.slice();
    } else {
      nices = isMeaningful(state.nice) ? [state.nice.trim()] : [];
    }
    if (nices.length) {
      sections += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">Nice to have ' + copyBtn('nice') + '</div>' +
        '<ul id="copyTarget-nice">' +
        nices.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // The details
    sections += '<div class="cv-jd-section">' +
      '<div class="cv-jd-h3">The details ' + copyBtn('details') + '</div>' +
      '<div class="cv-jd-details" id="copyTarget-details">' +
      (state.hours ? '<div class="dk">Hours</div><div class="dv">' + escapeHtml(state.hours) + '</div>' : '') +
      (state.tzZone ? '<div class="dk">Time zone</div><div class="dv">' + escapeHtml(state.tzZone) + (state.tzWindow ? ' · ' + escapeHtml(state.tzWindow) : '') + '</div>' : '') +
      '<div class="dk">Location</div><div class="dv">Remote</div>' +
      '</div></div>';

    var doc = $('jdDoc');
    var title = doc.querySelector('.cv-jd-title');
    var sub = doc.querySelector('.cv-jd-subtitle');
    doc.innerHTML = '';
    doc.appendChild(title);
    doc.appendChild(sub);
    var temp = document.createElement('div');
    temp.innerHTML = sections;
    while (temp.firstChild) doc.appendChild(temp.firstChild);

    // Wire copy buttons — each one copies its section as clean formatted text
    doc.querySelectorAll('.cv-copy-btn').forEach(function(b) {
      b.addEventListener('click', function() {
        var key = b.dataset.copy;
        var text = '';
        if (key === 'about') {
          var p = $('copyTarget-about').querySelector('p');
          text = p ? p.innerText : '';
        } else if (key === 'details') {
          var details = [];
          if (state.hours) details.push('Hours: ' + state.hours);
          if (state.tzZone) details.push('Time zone: ' + state.tzZone + (state.tzWindow ? ' · ' + state.tzWindow : ''));
          details.push('Location: Remote');
          text = details.join('\n');
        } else {
          // List sections — build with dashes
          var ul = $('copyTarget-' + key);
          if (ul) {
            var items = ul.querySelectorAll('li');
            var arr = [];
            items.forEach(function(li) { arr.push('- ' + li.innerText.trim()); });
            text = arr.join('\n');
          }
        }
        if (text) {
          navigator.clipboard.writeText(text).then(function() {
            var original = b.innerHTML;
            b.classList.add('copied');
            b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied';
            setTimeout(function() { b.classList.remove('copied'); b.innerHTML = original; }, 1400);
          });
        }
      });
    });

    // Build Calendly UTM
    var roleSlug = (state.roleLabel || 'role').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    var subSlugs = Array.from(state.subFlavors).join('_');
    var campaign = 'jd_' + roleSlug + (subSlugs ? '_' + subSlugs : '');
    var calendlyUrl = 'https://calendly.com/adell-coconutva/coconut-discovery-call?utm_source=jd_generator&utm_medium=tool&utm_campaign=' + encodeURIComponent(campaign);
    $('ctaCalendly').href = calendlyUrl;

    // If AI failed, show clear, actionable error message in footer
    var footerP = root.querySelector('.cv-result-footer p');
    if (state._aiError && footerP) {
      var errMsg = state._aiError;
      footerP.innerHTML =
        '<span style="color:var(--cv-error); font-weight:700;">⚠ AI enrichment failed</span> · ' +
        '<span style="color:var(--cv-fg-2);">' + escapeHtml(errMsg) + '</span> · ' +
        '<button class="start-over" id="startOver">Try again →</button>';
      var newStartOver = root.getElementById('startOver');
      if (newStartOver) {
        newStartOver.addEventListener('click', function() {
          try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
          location.reload();
        });
      }
    } else if (footerP) {
      footerP.innerHTML = 'We also emailed a copy to <strong id="resEmailNote">' +
        escapeHtml(state.email || 'your inbox') + '</strong>. ' +
        '<button class="start-over" id="startOver">Start over →</button>';
      var so = root.getElementById('startOver');
      if (so) {
        so.addEventListener('click', function() {
          if (!confirm('Start over and lose your current job description?')) return;
          try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
          location.reload();
        });
      }
    }

    // Reset spinner state for if user starts over
    $('btnNext').disabled = false;
    $('btnNextLabel').textContent = 'Show me my results';
    $('loadingIcon').classList.remove('spinning');
  }

  function copyBtn(key) {
    return '<button class="cv-copy-btn" data-copy="' + key + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>' +
      'Copy</button>';
  }

  // Copy entire JD — build clean formatted text manually
  $('ctaCopy').addEventListener('click', function() {
    var roleLabel = state.roleLabel || 'this role';
    var lines = [];

    // Title + subtitle
    lines.push(roleLabel + (state.company ? ' — ' + state.company : ''));
    var subParts = ['Remote'];
    if (state.hours) subParts.push(state.hours);
    if (state.tzZone) subParts.push(state.tzZone);
    lines.push(subParts.join(' · '));
    lines.push('');

    // About the role — AI if available
    var roleData = getRoleData(state.role);
    lines.push('ABOUT THE ROLE');
    if (state._aiAbout) {
      lines.push(state._aiAbout);
    } else {
      lines.push((state.company || 'We') + ' is hiring a remote ' + roleLabel +
        ' to ' + roleData.description.toLowerCase().replace(/\.$/, '') +
        '. This is a fully remote, ' + (state.hours ? state.hours.toLowerCase() : 'part-time') +
        ' role within ' + (state.tzZone || 'a flexible time zone') + '.');
    }
    lines.push('');

    // What you'll do — AI refined if available
    var checked;
    if (state._aiResponsibilities && state._aiResponsibilities.length) {
      checked = state._aiResponsibilities.slice();
    } else {
      checked = Array.from(state.checkedResp);
      if (state.tasks.trim()) {
        state.tasks.split(/[\n,]/).forEach(function(t) {
          var c = t.trim().replace(/^[-•]\s*/, '');
          if (c) checked.push(c.charAt(0).toUpperCase() + c.slice(1));
        });
      }
    }
    if (checked.length) {
      lines.push("WHAT YOU'LL DO");
      checked.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }

    // Tools
    if (state.tools.size) {
      lines.push("TOOLS YOU'LL USE");
      Array.from(state.tools).forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }

    // Non-negotiables — AI if available
    function isMeaningful(v) {
      if (!v) return false;
      var s = String(v).trim().toLowerCase();
      if (!s) return false;
      var skipValues = ['n/a','na','none','-','—','skip','no','not applicable','nope'];
      return skipValues.indexOf(s) < 0;
    }
    var nons;
    if (state._aiNonNegotiables && state._aiNonNegotiables.length) {
      nons = state._aiNonNegotiables.slice();
    } else {
      nons = [];
      if (isMeaningful(state.nonSoft)) nons.push(state.nonSoft.trim());
      if (isMeaningful(state.nonRole)) nons.push(state.nonRole.trim());
      if (isMeaningful(state.nonIndustry)) nons.push('Experience in ' + state.nonIndustry.trim());
      if (isMeaningful(state.nonSoftSkill)) nons.push(state.nonSoftSkill.trim());
      if (state.english) nons.push(state.english + ' English');
    }
    if (nons.length) {
      lines.push("WHAT WE'RE LOOKING FOR");
      nons.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }

    // Nice to have — AI if available
    var nices;
    if (state._aiNiceToHaves && state._aiNiceToHaves.length) {
      nices = state._aiNiceToHaves.slice();
    } else {
      nices = isMeaningful(state.nice) ? [state.nice.trim()] : [];
    }
    if (nices.length) {
      lines.push('NICE TO HAVE');
      nices.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }

    // The details
    lines.push('THE DETAILS');
    if (state.hours) lines.push('Hours: ' + state.hours);
    if (state.tzZone) lines.push('Time zone: ' + state.tzZone + (state.tzWindow ? ' · ' + state.tzWindow : ''));
    lines.push('Location: Remote');

    var text = lines.join('\n');

    navigator.clipboard.writeText(text).then(function() {
      var btn = $('ctaCopy');
      var original = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied to clipboard';
      setTimeout(function() { btn.innerHTML = original; }, 1800);
    });
  });

  // Start over (original handler — replaced dynamically when result renders)
  var startOverEl = $('startOver');
  if (startOverEl) {
    startOverEl.addEventListener('click', function() {
      if (!confirm('Start over and lose your current job description?')) return;
      try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
      location.reload();
    });
  }

  // =========================================================
  // UTIL
  // =========================================================
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  // =========================================================
  // INIT
  // =========================================================
  updateProgress();
  updateNav();
  }
}

// Register the element. The tag name must match what you set in the Wix
// Custom Element panel under "Tag name".
if (!customElements.get('coconut-jd-generator')) {
  customElements.define('coconut-jd-generator', CoconutJDGenerator);
}
