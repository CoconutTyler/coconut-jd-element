// ============================================================
// COCONUT — Job Description Generator — Wix Custom Element (Velo)
// ============================================================
// File location in Wix Studio: Public/custom-elements/coconut-jd-generator.js
// Element tag: <coconut-jd-generator>
//
// ✅ This file is SAFE to host publicly — no API keys, no secrets.
// The AI enrichment is delegated to a Wix Velo backend endpoint:
//   POST https://www.coconutva.com/_functions/generateJD
// The backend holds the OpenAI key via wix-secrets-backend.
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
    const fontLink = '<link rel="preconnect" href="https://fonts.googleapis.com">' +
                     '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
                     '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">';

    this.shadowRoot.innerHTML = `
${fontLink}
<style>
  :host {
    display: block;
    box-sizing: border-box;
    width: 100%;
    font-family: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #07152B;
    background: #FFFFFF;
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
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
    --cv-bg-page: #F5F5F7;
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
    --cv-font: "Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    /* Radii */
    --cv-radius-sm: 8px;
    --cv-radius-md: 14px;
    --cv-radius-lg: 20px;
    --cv-radius-xl: 28px;
    --cv-radius-pill: 999px;
    /* Shadows */
    --cv-shadow-sm: 0 4px 12px rgba(7,21,43,0.06);
    --cv-shadow-md: 0 10px 28px rgba(7,21,43,0.08);
    --cv-shadow-card: 0 6px 20px rgba(7,21,43,0.06), 0 1px 0 rgba(7,21,43,0.03);
    /* Motion */
    --cv-ease: cubic-bezier(0.22,0.61,0.36,1);
    --cv-ease-out: cubic-bezier(0.16,1,0.3,1);
  }

  * { box-sizing: border-box; }
  /* html/body rules below are no-ops inside Shadow DOM. Kept to avoid surprise. */
  html { font-family: var(--cv-font); color: var(--cv-fg-1); -webkit-font-smoothing: antialiased; }
  body {
    margin: 0;
    padding: 0;
    background: var(--cv-bg-page);
    font-size: 16px;
    line-height: 1.55;
  }

  /* ============================================
     SHELL — split layout (form + preview), fixed height on desktop
     ============================================ */
  .cv-shell {
    max-width: 1240px;
    margin: 0 auto;
    padding: 32px 24px 56px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: 28px;
    align-items: stretch;
    /* Desktop: fixed-ish container height so Wix iframe sizing is predictable.
       Each pane scrolls independently. */
    height: clamp(640px, calc(100vh - 220px), 820px);
  }
  @media (max-width: 960px) {
    .cv-shell {
      grid-template-columns: 1fr;
      padding: 24px 16px 40px;
      gap: 20px;
      height: auto;       /* mobile: natural height, page scrolls normally */
    }
  }

  /* ============================================
     INTRO HEADER (above the split)
     ============================================ */
  .cv-intro {
    max-width: 1240px;
    margin: 0 auto;
    padding: 56px 24px 0;
    text-align: center;
  }
  .cv-intro-eyebrow {
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin-bottom: 12px;
    display: block;
  }
  .cv-intro h1 {
    font-weight: 800;
    font-size: 40px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--cv-navy-800);
    margin: 0 0 12px;
    text-wrap: balance;
  }
  .cv-intro p {
    font-size: 16px;
    color: var(--cv-fg-3);
    margin: 0 auto;
    max-width: 600px;
  }
  @media (max-width: 720px) {
    .cv-intro { padding: 32px 16px 0; }
    .cv-intro h1 { font-size: 28px; }
  }

  /* ============================================
     FORM PANE — internal scroll on desktop
     ============================================ */
  .cv-form-pane {
    background: var(--cv-bg);
    border-radius: var(--cv-radius-xl);
    box-shadow: var(--cv-shadow-card);
    padding: 36px;
    height: 100%;
    overflow-y: auto;
    min-height: 0;
    position: relative; /* makes .cv-section's offsetTop relative to this pane */
  }
  .cv-form-pane::-webkit-scrollbar { width: 6px; }
  .cv-form-pane::-webkit-scrollbar-track { background: transparent; }
  .cv-form-pane::-webkit-scrollbar-thumb { background: var(--cv-border); border-radius: 99px; }
  .cv-form-pane::-webkit-scrollbar-thumb:hover { background: var(--cv-fg-3); }
  @media (max-width: 960px) {
    .cv-form-pane { height: auto; overflow-y: visible; }
  }
  @media (max-width: 720px) {
    .cv-form-pane { padding: 24px 20px; border-radius: var(--cv-radius-lg); }
  }

  /* ============================================
     SECTION (replaces old "step" concept)
     One section at a time is "active", future ones are dimmed.
     ============================================ */
  .cv-section {
    padding: 24px 0;
    transition: opacity 360ms var(--cv-ease-out);
  }
  .cv-section + .cv-section {
    border-top: 1px solid var(--cv-border-soft);
  }
  .cv-section:first-child { padding-top: 0; }
  .cv-section:last-child { padding-bottom: 0; }
  .cv-section.locked {
    opacity: 0.35;
    pointer-events: none;
    filter: saturate(0.4);
  }
  .cv-section.locked .cv-eyebrow { color: var(--cv-fg-3); }

  .cv-eyebrow {
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin-bottom: 6px;
    display: block;
  }
  .cv-section-title {
    font-weight: 800;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--cv-navy-800);
    margin: 0 0 8px;
  }
  .cv-section-sub {
    font-size: 14px;
    line-height: 1.55;
    color: var(--cv-fg-3);
    margin: 0 0 20px;
  }

  /* ============================================
     FIELDS
     ============================================ */
  .cv-field { margin-bottom: 16px; }
  .cv-field:last-child { margin-bottom: 0; }
  .cv-field-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 540px) {
    .cv-field-row-2 { grid-template-columns: 1fr; }
  }
  .cv-label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    color: var(--cv-navy-800);
    margin: 0 0 6px;
  }
  .cv-label-optional {
    color: var(--cv-fg-3);
    font-weight: 500;
    margin-left: 4px;
  }

  .cv-input, .cv-select, .cv-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
    background: var(--cv-bg);
    color: var(--cv-fg-1);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: border-color 180ms var(--cv-ease), box-shadow 180ms var(--cv-ease);
  }
  .cv-input::placeholder, .cv-textarea::placeholder { color: var(--cv-fg-3); font-weight: 400; }
  .cv-input:hover, .cv-select:hover, .cv-textarea:hover { border-color: #d4d8e1; }
  .cv-input:focus, .cv-select:focus, .cv-textarea:focus {
    border-color: var(--cv-green-600);
    box-shadow: 0 0 0 3px rgba(80,176,128,0.14);
  }
  .cv-textarea { resize: vertical; min-height: 70px; }
  .cv-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath d='M1 1l5 5 5-5' fill='none' stroke='%235C6B85' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 38px;
    cursor: pointer;
  }

  /* Pill picker */
  .cv-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
  .cv-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 13px;
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-pill);
    background: var(--cv-bg);
    color: var(--cv-fg-2);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 160ms var(--cv-ease);
    user-select: none;
    white-space: nowrap;
  }
  .cv-pill:hover { border-color: var(--cv-green-500); color: var(--cv-navy-800); }
  .cv-pill.on {
    background: var(--cv-green-100);
    border-color: var(--cv-green-600);
    color: var(--cv-green-700);
  }
  .cv-pill.custom { padding-right: 6px; }
  .cv-pill .pill-x {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: rgba(63,154,110,0.15);
    margin-left: 2px;
    cursor: pointer;
    transition: background 140ms var(--cv-ease);
  }
  .cv-pill .pill-x:hover { background: rgba(63,154,110,0.3); }
  .cv-pill .pill-x svg { width: 9px; height: 9px; color: var(--cv-green-700); }

  /* Add custom tool button + input */
  .cv-add-tool-wrap { margin-top: 8px; }
  .cv-add-btn {
    background: transparent;
    border: 1.5px dashed var(--cv-border);
    color: var(--cv-fg-3);
    border-radius: var(--cv-radius-pill);
    padding: 7px 13px;
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 160ms var(--cv-ease);
  }
  .cv-add-btn:hover {
    border-color: var(--cv-green-600);
    color: var(--cv-green-700);
    background: var(--cv-green-100);
  }
  .cv-add-btn svg { width: 11px; height: 11px; }

  /* Responsibility checklist */
  .cv-resp-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 240px;
    overflow-y: auto;
    padding: 6px;
    background: var(--cv-bg-soft);
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
  }
  .cv-resp-list::-webkit-scrollbar { width: 6px; }
  .cv-resp-list::-webkit-scrollbar-track { background: transparent; }
  .cv-resp-list::-webkit-scrollbar-thumb { background: var(--cv-border); border-radius: 99px; }
  .cv-resp-item {
    display: flex; align-items: flex-start; gap: 9px;
    padding: 8px 9px;
    border-radius: var(--cv-radius-sm);
    cursor: pointer;
    font-size: 13px;
    line-height: 1.45;
    color: var(--cv-fg-2);
    transition: background 140ms var(--cv-ease);
  }
  .cv-resp-item:hover { background: var(--cv-bg); }
  .cv-resp-item.on { background: var(--cv-green-100); color: var(--cv-navy-800); }
  .cv-resp-check {
    width: 17px; height: 17px; flex-shrink: 0;
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
    padding: 1px 6px;
    border-radius: var(--cv-radius-pill);
    margin-left: 5px;
  }

  /* Non-negotiables blocks (no headers since they nest under one section) */
  .cv-non-block { margin-bottom: 10px; }
  .cv-non-block:last-child { margin-bottom: 0; }
  .cv-non-cat {
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin: 0 0 5px;
  }

  /* ============================================
     PREVIEW PANE — internal scroll on desktop
     ============================================ */
  .cv-preview-pane {
    background: var(--cv-bg);
    border-radius: var(--cv-radius-xl);
    box-shadow: var(--cv-shadow-card);
    padding: 32px;
    height: 100%;
    overflow-y: auto;
    min-height: 0;
  }
  .cv-preview-pane::-webkit-scrollbar { width: 6px; }
  .cv-preview-pane::-webkit-scrollbar-track { background: transparent; }
  .cv-preview-pane::-webkit-scrollbar-thumb { background: var(--cv-border); border-radius: 99px; }
  .cv-preview-pane::-webkit-scrollbar-thumb:hover { background: var(--cv-fg-3); }
  @media (max-width: 960px) {
    .cv-preview-pane {
      height: auto;
      overflow-y: visible;
    }
  }
  @media (max-width: 720px) {
    .cv-preview-pane { padding: 24px 20px; border-radius: var(--cv-radius-lg); }
  }

  /* ============================================
     BUDGET SLIDER — dual-handle range
     ============================================ */
  .cv-budget-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 6px;
    margin-bottom: 12px;
    font-weight: 700;
    color: var(--cv-navy-800);
    letter-spacing: -0.01em;
  }
  .cv-budget-display .cv-budget-val {
    font-size: 17px;
    color: var(--cv-green-700);
  }
  .cv-budget-display .cv-budget-dash {
    font-size: 13px;
    color: var(--cv-fg-3);
    font-weight: 500;
  }
  .cv-budget-display .cv-budget-unit {
    font-size: 11.5px;
    color: var(--cv-fg-3);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-left: 4px;
  }
  .cv-budget-slider-wrap {
    position: relative;
    height: 28px;
    margin: 0 4px;
  }
  .cv-budget-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--cv-border);
    border-radius: 99px;
    transform: translateY(-50%);
  }
  .cv-budget-track-fill {
    position: absolute;
    top: 0;
    height: 100%;
    background: var(--cv-green-600);
    border-radius: 99px;
  }
  /* Two overlapping range inputs — only their thumbs are visible */
  .cv-budget-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    margin: 0;
    pointer-events: none;
  }
  .cv-budget-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2.5px solid var(--cv-green-600);
    cursor: pointer;
    pointer-events: all;
    box-shadow: 0 2px 6px rgba(7,21,43,0.15);
    transition: transform 140ms var(--cv-ease), box-shadow 140ms var(--cv-ease);
    margin-top: 0;
  }
  .cv-budget-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 10px rgba(7,21,43,0.2);
  }
  .cv-budget-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2.5px solid var(--cv-green-600);
    cursor: pointer;
    pointer-events: all;
    box-shadow: 0 2px 6px rgba(7,21,43,0.15);
  }
  /* Hide the default track of both ranges (we render our own) */
  .cv-budget-slider::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }
  .cv-budget-slider::-moz-range-track {
    background: transparent;
    border: none;
  }
  .cv-budget-bounds {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--cv-fg-3);
    padding: 0 4px;
  }
  .cv-budget-checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    cursor: pointer;
    user-select: none;
  }
  .cv-budget-check {
    width: 17px; height: 17px; flex-shrink: 0;
    border: 1.5px solid var(--cv-border);
    border-radius: 5px;
    background: var(--cv-bg);
    display: flex; align-items: center; justify-content: center;
    transition: all 140ms var(--cv-ease);
  }
  .cv-budget-check svg { width: 11px; height: 11px; color: var(--cv-fg-inverse); opacity: 0; }
  .cv-budget-checkbox-row.on .cv-budget-check { background: var(--cv-green-600); border-color: var(--cv-green-600); }
  .cv-budget-checkbox-row.on .cv-budget-check svg { opacity: 1; }
  .cv-budget-checkbox-row .lbl {
    font-size: 13px;
    color: var(--cv-fg-2);
    font-weight: 500;
  }

  /* Empty state — skeleton */
  .cv-preview-empty {
    text-align: center;
    padding: 40px 16px 32px;
    color: var(--cv-fg-3);
  }
  .cv-preview-empty .cv-empty-icon {
    width: 48px; height: 48px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: var(--cv-bg-soft);
    display: flex; align-items: center; justify-content: center;
    color: var(--cv-fg-3);
  }
  .cv-preview-empty .cv-empty-icon svg { width: 22px; height: 22px; }
  .cv-preview-empty h3 {
    font-weight: 700; font-size: 16px;
    color: var(--cv-navy-800);
    margin: 0 0 6px;
  }
  .cv-preview-empty p {
    font-size: 13.5px; margin: 0 auto; max-width: 280px;
  }
  .cv-skeleton {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 8px;
  }
  .cv-skeleton-row {
    height: 10px;
    background: linear-gradient(90deg, var(--cv-border-soft) 0%, var(--cv-bg-soft) 50%, var(--cv-border-soft) 100%);
    background-size: 200% 100%;
    border-radius: 99px;
    animation: skeletonPulse 1.8s ease-in-out infinite;
  }
  .cv-skeleton-row.short { width: 60%; }
  .cv-skeleton-row.medium { width: 80%; }
  .cv-skeleton-row.full { width: 100%; }
  @keyframes skeletonPulse {
    0%, 100% { background-position: 200% 0; }
    50% { background-position: -200% 0; }
  }

  /* Hero (appears when JD has enough data) */
  .cv-result-hero {
    background: linear-gradient(180deg, var(--cv-bg-mint) 0%, var(--cv-bg-soft) 100%);
    border-radius: var(--cv-radius-lg);
    padding: 24px;
    margin: 0 0 20px;
    text-align: center;
    border: 1px solid var(--cv-green-200);
    animation: heroFade 480ms var(--cv-ease-out);
  }
  @keyframes heroFade {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }
  .cv-ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin: 0 auto 10px;
    padding: 4px 10px 4px 9px;
    background: var(--cv-bg);
    border: 1px solid var(--cv-green-200);
    border-radius: var(--cv-radius-pill);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--cv-green-700);
    text-transform: uppercase;
  }
  .cv-ai-badge.loading { color: var(--cv-fg-3); border-color: var(--cv-border); }
  .cv-ai-badge.error { color: #B8503A; border-color: #E8C9C0; background: #FBF1EE; }
  .cv-ai-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cv-green-600);
    box-shadow: 0 0 0 3px rgba(80,176,128,0.18);
  }
  .cv-ai-badge.loading .cv-ai-badge-dot {
    background: var(--cv-fg-3);
    box-shadow: none;
    animation: aiPulse 1.2s ease-in-out infinite;
  }
  .cv-ai-badge.error .cv-ai-badge-dot { background: #B8503A; box-shadow: none; }
  @keyframes aiPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  .cv-ai-regen {
    background: transparent;
    border: none;
    padding: 0;
    margin-left: 2px;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    opacity: 0.6;
    transition: opacity 140ms var(--cv-ease), transform 240ms var(--cv-ease);
  }
  .cv-ai-regen:hover { opacity: 1; }
  .cv-ai-regen svg { width: 11px; height: 11px; }
  .cv-ai-regen.spinning svg { animation: aiSpin 1s linear infinite; }
  @keyframes aiSpin { to { transform: rotate(360deg); } }

  .cv-result-stats {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--cv-navy-700);
  }
  .cv-result-stats .dot { color: var(--cv-green-600); font-weight: 800; }
  .cv-result-headline {
    font-weight: 800;
    font-size: 22px;
    line-height: 1.15;
    letter-spacing: -0.015em;
    color: var(--cv-navy-800);
    margin: 0 0 6px;
    text-wrap: balance;
  }
  .cv-result-sub {
    font-size: 13.5px;
    color: var(--cv-fg-2);
    margin: 0 0 16px;
    max-width: 380px;
    margin-left: auto;
    margin-right: auto;
  }
  .cv-result-cta-row {
    display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
  }

  /* Export bar — discrete row of icon buttons at the bottom of the hero */
  .cv-export-bar {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid rgba(7, 21, 43, 0.07);
  }
  .cv-export-icon {
    background: transparent;
    border: none;
    padding: 6px 10px;
    cursor: pointer;
    color: var(--cv-navy-600);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: 8px;
    transition: all 160ms var(--cv-ease);
    opacity: 0.7;
    position: relative;
    font: inherit;
    line-height: 1;
  }
  .cv-export-icon:hover {
    opacity: 1;
    color: var(--cv-navy-800);
    background: rgba(7, 21, 43, 0.04);
    transform: translateY(-1px);
  }
  .cv-export-icon:active { transform: translateY(0); }
  .cv-export-icon.busy { opacity: 0.4; cursor: wait; pointer-events: none; }
  .cv-export-icon.done { color: var(--cv-green-700); }
  .cv-export-icon svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.6;
  }
  .cv-export-label {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: inherit;
  }
  /* Tooltip on hover */
  .cv-export-icon[data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-2px);
    background: var(--cv-navy-800);
    color: var(--cv-fg-inverse);
    font-size: 10.5px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 140ms var(--cv-ease);
    z-index: 5;
  }
  .cv-export-icon:hover[data-tooltip]::before {
    opacity: 1;
  }

  /* ============================================
     LEAD CAPTURE MODAL — opens when user clicks "Find me candidates"
     ============================================ */
  .cv-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7, 21, 43, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 999;
    animation: modalFade 200ms var(--cv-ease-out);
  }
  @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
  .cv-modal {
    background: var(--cv-bg);
    border-radius: var(--cv-radius-xl);
    box-shadow: 0 24px 48px rgba(7,21,43,0.25);
    width: 100%;
    max-width: 440px;
    padding: 32px;
    text-align: center;
    animation: modalSlide 280ms var(--cv-ease-out);
    position: relative;
  }
  @keyframes modalSlide {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to { opacity: 1; transform: none; }
  }
  .cv-modal-close {
    position: absolute;
    top: 14px; right: 14px;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: var(--cv-fg-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 140ms var(--cv-ease);
  }
  .cv-modal-close:hover { background: var(--cv-bg-soft); color: var(--cv-navy-800); }
  .cv-modal-close svg { width: 14px; height: 14px; }
  .cv-modal-eyebrow {
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cv-green-700);
    margin: 0 0 10px;
  }
  .cv-modal h2 {
    font-weight: 800;
    font-size: 22px;
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--cv-navy-800);
    margin: 0 0 8px;
    text-wrap: balance;
  }
  .cv-modal p {
    font-size: 14px;
    color: var(--cv-fg-3);
    margin: 0 0 20px;
    line-height: 1.55;
  }
  .cv-modal-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cv-modal-input {
    padding: 13px 15px;
    border: 1.5px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
    background: var(--cv-bg);
    color: var(--cv-fg-1);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: border-color 180ms var(--cv-ease), box-shadow 180ms var(--cv-ease);
    text-align: center;
  }
  .cv-modal-input:focus {
    border-color: var(--cv-green-600);
    box-shadow: 0 0 0 3px rgba(80,176,128,0.14);
  }
  .cv-modal-input.error {
    border-color: var(--cv-error);
    box-shadow: 0 0 0 3px rgba(229,75,75,0.12);
  }
  .cv-modal-submit {
    background: var(--cv-green-600);
    color: var(--cv-fg-inverse);
    border: none;
    border-radius: var(--cv-radius-pill);
    padding: 13px 22px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 180ms var(--cv-ease);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: var(--cv-shadow-sm);
  }
  .cv-modal-submit:hover {
    background: var(--cv-green-700);
    box-shadow: var(--cv-shadow-md);
    transform: translateY(-1px);
  }
  .cv-modal-submit:disabled {
    background: var(--cv-fg-3);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
  }
  .cv-modal-submit svg { width: 13px; height: 13px; }
  .cv-modal-error {
    font-size: 12.5px;
    color: var(--cv-error);
    margin: 8px 0 0;
    text-align: center;
  }
  .cv-modal-fine {
    font-size: 11.5px;
    color: var(--cv-fg-3);
    margin: 14px 0 0;
    line-height: 1.5;
  }
  /* Success state */
  .cv-modal-success {
    text-align: center;
    animation: modalSlide 280ms var(--cv-ease-out);
  }
  .cv-modal-success-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: var(--cv-green-100);
    color: var(--cv-green-700);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .cv-modal-success-icon svg { width: 24px; height: 24px; }
  .cv-modal-success h2 {
    color: var(--cv-navy-800);
    margin-bottom: 8px;
  }
  .cv-modal-success p { margin-bottom: 18px; }
  .cv-modal-done-btn {
    background: var(--cv-navy-800);
    color: var(--cv-fg-inverse);
    border: none;
    border-radius: var(--cv-radius-pill);
    padding: 11px 24px;
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
    transition: all 180ms var(--cv-ease);
  }
  .cv-modal-done-btn:hover { background: var(--cv-navy-700); }

  /* Buttons */
  .cv-btn {
    font-family: var(--cv-font);
    font-weight: 700;
    font-size: 13.5px;
    border-radius: var(--cv-radius-pill);
    padding: 11px 18px;
    border: none;
    cursor: pointer;
    transition: all 180ms var(--cv-ease);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
  }
  .cv-btn-primary {
    background: var(--cv-green-600);
    color: var(--cv-fg-inverse);
    box-shadow: var(--cv-shadow-sm);
  }
  .cv-btn-primary:hover {
    background: var(--cv-green-700);
    box-shadow: var(--cv-shadow-md);
    transform: translateY(-1px);
  }
  .cv-btn-navy {
    background: var(--cv-navy-800);
    color: var(--cv-fg-inverse);
    box-shadow: var(--cv-shadow-sm);
  }
  .cv-btn-navy:hover {
    background: var(--cv-navy-700);
    box-shadow: var(--cv-shadow-md);
    transform: translateY(-1px);
  }
  .cv-btn svg { width: 12px; height: 12px; }

  /* The JD doc itself */
  .cv-jd-doc {
    padding: 4px 0 0;
  }
  .cv-jd-title {
    font-weight: 800;
    font-size: 20px;
    line-height: 1.2;
    color: var(--cv-navy-800);
    margin: 0 0 3px;
    letter-spacing: -0.01em;
  }
  .cv-jd-subtitle {
    font-size: 12.5px;
    color: var(--cv-fg-3);
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--cv-border-soft);
  }
  .cv-jd-section {
    margin-bottom: 16px;
    animation: sectionFade 360ms var(--cv-ease-out);
  }
  @keyframes sectionFade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: none; }
  }
  .cv-jd-h3 {
    display: flex; align-items: center; justify-content: space-between;
    font-weight: 700;
    font-size: 13px;
    color: var(--cv-navy-800);
    margin: 0 0 6px;
    letter-spacing: 0.01em;
  }
  .cv-jd-section ul { margin: 0; padding-left: 17px; }
  .cv-jd-section li {
    font-size: 13px;
    line-height: 1.55;
    color: var(--cv-fg-2);
    margin: 3px 0;
  }
  .cv-jd-section p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: var(--cv-fg-2);
  }
  .cv-jd-details { display: grid; grid-template-columns: max-content 1fr; gap: 5px 14px; font-size: 12.5px; }
  .cv-jd-details .dk { color: var(--cv-fg-3); font-weight: 600; }
  .cv-jd-details .dv { color: var(--cv-navy-800); font-weight: 500; }

  .cv-copy-btn {
    background: transparent;
    border: 1px solid var(--cv-border);
    color: var(--cv-fg-3);
    border-radius: var(--cv-radius-sm);
    padding: 3px 9px;
    font: inherit;
    font-size: 10.5px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
    transition: all 140ms var(--cv-ease);
  }
  .cv-copy-btn:hover { color: var(--cv-navy-800); border-color: var(--cv-navy-500); }
  .cv-copy-btn.copied { color: var(--cv-green-700); border-color: var(--cv-green-600); }
  .cv-copy-btn svg { width: 10px; height: 10px; }

  /* Footer note when JD ready */
  .cv-preview-footer {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--cv-border-soft);
    font-size: 11.5px;
    color: var(--cv-fg-3);
    text-align: center;
    line-height: 1.7;
  }
  .cv-preview-footer .restart {
    background: none; border: none; color: var(--cv-fg-3);
    text-decoration: underline; cursor: pointer; font: inherit;
    font-weight: 600;
    padding: 0;
  }
  .cv-preview-footer .restart:hover { color: var(--cv-navy-800); }
  /* AI status line inside footer — discrete, doesn't compete with the headline */
  .cv-footer-ai {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    color: var(--cv-fg-3);
  }
  .cv-footer-ai-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--cv-green-600);
    display: inline-block;
  }
  .cv-footer-ai.loading .cv-footer-ai-dot {
    background: var(--cv-fg-3);
    animation: aiPulse 1.2s ease-in-out infinite;
  }
  .cv-footer-ai.error { color: #B8503A; }
  .cv-footer-ai.error .cv-footer-ai-dot { background: #B8503A; }
  .cv-footer-ai-regen {
    background: transparent; border: none; padding: 0 0 0 2px;
    color: inherit; cursor: pointer; opacity: 0.6;
    display: inline-flex; align-items: center;
    transition: opacity 140ms var(--cv-ease);
  }
  .cv-footer-ai-regen:hover { opacity: 1; }
  .cv-footer-ai-regen svg { width: 10px; height: 10px; }
  .cv-footer-ai-regen.spinning svg { animation: aiSpin 1s linear infinite; }
  .cv-footer-sep { opacity: 0.5; padding: 0 6px; }

  /* Hint when JD almost ready */
  .cv-preview-hint {
    background: var(--cv-bg-soft);
    border: 1px dashed var(--cv-border);
    border-radius: var(--cv-radius-md);
    padding: 12px 14px;
    margin: 0 0 16px;
    font-size: 12.5px;
    color: var(--cv-fg-3);
    text-align: center;
  }

</style>

<div class="cv-intro">
  <span class="cv-intro-eyebrow">Free tool · No signup</span>
  <h1>Build a recruiter-grade job description in under 2 minutes.</h1>
  <p>Tell us about the role. We'll build a polished job description as you go — and show you how fast we can fill it.</p>
</div>

<div class="cv-shell">

  <!-- ============ FORM PANE (LEFT) ============ -->
  <div class="cv-form-pane">

    <!-- SECTION 1 — Your business -->
    <section class="cv-section" id="section-business">
      <span class="cv-eyebrow">Your business</span>
      <h2 class="cv-section-title">Tell us a bit about your company.</h2>
      <p class="cv-section-sub">We use this to write a job description that sounds like it came from you, not a template.</p>

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
            <option>Hospitality / F&amp;B</option>
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
    </section>

    <!-- SECTION 2 — The role -->
    <section class="cv-section locked" id="section-role">
      <span class="cv-eyebrow">The role</span>
      <h2 class="cv-section-title">Who are you looking to hire?</h2>
      <p class="cv-section-sub">Start broad, then narrow it down. You can mix specializations.</p>

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

      <div class="cv-field" id="roleField" hidden>
        <label class="cv-label" for="qRole">Pick the specific role</label>
        <select class="cv-select" id="qRole">
          <option value="">Choose a role...</option>
        </select>
        <input type="text" class="cv-input" id="qRoleOther" placeholder="Type the role title (e.g. AI Engineer, Recruiter...)" style="margin-top: 8px;" hidden />
      </div>

      <div class="cv-field" id="subFlavorField" hidden>
        <label class="cv-label">Add a specialization <span class="cv-label-optional">(optional)</span></label>
        <div class="cv-pills" id="subFlavorPills"></div>
      </div>

      <div class="cv-field-row-2" id="roleMetaField" hidden>
        <div>
          <label class="cv-label" for="qCount">How many?</label>
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
    </section>

    <!-- SECTION 3 — The work -->
    <section class="cv-section locked" id="section-work">
      <span class="cv-eyebrow">The work</span>
      <h2 class="cv-section-title">What will they actually do?</h2>
      <p class="cv-section-sub">We've pre-checked the most common responsibilities for this role. Adjust to match yours.</p>

      <div class="cv-field">
        <label class="cv-label">Responsibilities</label>
        <div class="cv-resp-list" id="respList">
          <p style="font-size:13px; color:var(--cv-fg-3); padding:14px; text-align:center; margin:0;">Pick a role to see suggested responsibilities.</p>
        </div>
      </div>

      <div class="cv-field">
        <label class="cv-label" for="qTasks">Anything else they should own? <span class="cv-label-optional">(optional)</span></label>
        <textarea class="cv-textarea" id="qTasks" rows="2" placeholder="e.g. light bookkeeping in QuickBooks, travel planning..."></textarea>
      </div>

      <div class="cv-field">
        <label class="cv-label">Tools they'll use</label>
        <div class="cv-pills" id="toolPills"></div>
        <div class="cv-add-tool-wrap" id="toolAddWrap" hidden>
          <button type="button" class="cv-add-btn" id="toolAddBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add another tool
          </button>
          <div id="toolInputWrap" hidden style="margin-top: 8px;">
            <input type="text" class="cv-input" id="toolInput" placeholder="Type a tool name and press Enter (e.g. DripJobs, MLS)" style="font-size: 13px; padding: 9px 13px;" />
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4 — The fit -->
    <section class="cv-section locked" id="section-fit">
      <span class="cv-eyebrow">The fit</span>
      <h2 class="cv-section-title">What makes someone a great fit?</h2>
      <p class="cv-section-sub">The must-haves you'd reject a candidate over.</p>

      <div class="cv-non-block">
        <p class="cv-non-cat">Software experience</p>
        <input type="text" class="cv-input" id="qNonSoft" placeholder="e.g. 2+ years using QuickBooks, fluent in HubSpot..." />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Experience in this role</p>
        <input type="text" class="cv-input" id="qNonRole" placeholder="e.g. 3+ years supporting a founder or C-suite executive" />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Industry experience <span class="cv-label-optional" style="text-transform:none; letter-spacing:0;">(optional)</span></p>
        <input type="text" class="cv-input" id="qNonIndustry" placeholder="e.g. real estate, SaaS, agency..." />
      </div>
      <div class="cv-non-block">
        <p class="cv-non-cat">Soft skills &amp; mindset</p>
        <input type="text" class="cv-input" id="qNonSoftSkill" placeholder="e.g. proactive, detail-oriented, comfortable with ambiguity" />
      </div>

      <div class="cv-field-row-2" style="margin-top:14px;">
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
          <label class="cv-label" for="qNice">Nice to have <span class="cv-label-optional">(optional)</span></label>
          <input type="text" class="cv-input" id="qNice" placeholder="e.g. background in startups" />
        </div>
      </div>
    </section>

    <!-- SECTION 5 — Logistics -->
    <section class="cv-section locked" id="section-logistics">
      <span class="cv-eyebrow">Logistics</span>
      <h2 class="cv-section-title">When and where will they work?</h2>
      <p class="cv-section-sub">A few quick logistics to match availability and time zone overlap.</p>

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

      <div class="cv-field" style="margin-top: 18px;">
        <label class="cv-label">Budget per month <span class="cv-label-optional">(optional)</span></label>
        <div class="cv-budget-display">
          <span class="cv-budget-val" id="budgetMinDisplay">$3,000</span>
          <span class="cv-budget-dash">–</span>
          <span class="cv-budget-val" id="budgetMaxDisplay">$5,000</span>
          <span class="cv-budget-unit">/ month</span>
        </div>
        <div class="cv-budget-slider-wrap">
          <div class="cv-budget-track"></div>
          <div class="cv-budget-track-fill" id="budgetTrackFill"></div>
          <input type="range" class="cv-budget-slider" id="budgetMin" min="1000" max="20000" step="500" value="3000" />
          <input type="range" class="cv-budget-slider" id="budgetMax" min="1000" max="20000" step="500" value="5000" />
        </div>
        <div class="cv-budget-bounds">
          <span>$1K</span>
          <span>$20K</span>
        </div>
        <div class="cv-budget-checkbox-row on" id="budgetShowRow">
          <span class="cv-budget-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="lbl">Show budget in the JD</span>
        </div>
      </div>
    </section>
  </div>

  <!-- ============ PREVIEW PANE (RIGHT) ============ -->
  <div class="cv-preview-pane">
    <!-- Empty state -->
    <div class="cv-preview-empty" id="previewEmpty">
      <div class="cv-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <h3>Your job description will build here</h3>
      <p>Start by telling us about your company — the JD will appear as you go.</p>
      <div class="cv-skeleton">
        <div class="cv-skeleton-row medium"></div>
        <div class="cv-skeleton-row short"></div>
        <div class="cv-skeleton-row full"></div>
        <div class="cv-skeleton-row medium"></div>
        <div class="cv-skeleton-row full"></div>
        <div class="cv-skeleton-row short"></div>
      </div>
    </div>

    <!-- Content state -->
    <div class="cv-preview-content" id="previewContent" hidden>
      <!-- Hero (appears when JD is ready) -->
      <div class="cv-result-hero" id="resultHero" hidden>
        <div class="cv-result-stats">
          <span id="resStat1">— Match</span>
          <span class="dot">·</span>
          <span id="resStat2">Candidates in — days</span>
          <span class="dot">·</span>
          <span id="resStat3">— tier</span>
        </div>
        <h3 class="cv-result-headline" id="resHeadline">Your role is ready.</h3>
        <p class="cv-result-sub" id="resSub">Based on your inputs, Coconut typically fills this role in a few days with vetted, dedicated talent.</p>
        <div class="cv-result-cta-row">
          <button type="button" class="cv-btn cv-btn-primary" id="ctaFindCandidates">
            Find me candidates
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button class="cv-btn cv-btn-navy" id="ctaCopy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
            Copy JD
          </button>
        </div>

        <!-- Export bar — additional ways to take the JD with them -->
        <div class="cv-export-bar">
          <button class="cv-export-icon" data-export="linkedin" data-tooltip="Copy & open LinkedIn" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            <span class="cv-export-label">LinkedIn</span>
          </button>
          <button class="cv-export-icon" data-export="pdf" data-tooltip="Download as PDF" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="cv-export-label">PDF</span>
          </button>
          <button class="cv-export-icon" data-export="doc" data-tooltip="Download as Word" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
            <span class="cv-export-label">DOC</span>
          </button>
          <button class="cv-export-icon" data-export="md" data-tooltip="Download as Markdown" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 12 17 15 14"/><line x1="12" y1="11" x2="12" y2="17"/></svg>
            <span class="cv-export-label">MD</span>
          </button>
        </div>
      </div>

      <!-- Hint when partial -->
      <div class="cv-preview-hint" id="previewHint" hidden>Keep going — a few more details to see your match.</div>

      <!-- The JD doc -->
      <div class="cv-jd-doc" id="jdDoc"></div>

      <!-- Footer -->
      <div class="cv-preview-footer" id="previewFooter" hidden>
        <span class="cv-footer-ai" id="footerAi" hidden>
          <span class="cv-footer-ai-dot"></span>
          <span id="footerAiText">Enhanced with AI</span>
          <button class="cv-footer-ai-regen" id="aiRegenBtn" type="button" title="Regenerate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </span>
        <span class="cv-footer-sep" id="footerSep" hidden>·</span>
        Built in real-time as you typed. <button class="restart" id="restartBtn">Start over</button>
      </div>
    </div>
  </div>
</div>

<!-- ============ LEAD CAPTURE MODAL ============ -->
<div class="cv-modal-backdrop" id="leadModal" hidden>
  <div class="cv-modal" role="dialog" aria-modal="true" aria-labelledby="leadModalTitle">
    <button class="cv-modal-close" id="leadModalClose" type="button" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <!-- Idle state — email form -->
    <div id="leadModalForm">
      <p class="cv-modal-eyebrow">Find me candidates</p>
      <h2 id="leadModalTitle">Drop your email and we'll match candidates to your JD.</h2>
      <p>We'll send you a shortlist of vetted, dedicated talent within 24 hours. No commitment.</p>
      <div class="cv-modal-form">
        <input type="email" class="cv-modal-input" id="leadEmailInput" placeholder="you@company.com" autocomplete="email" />
        <button type="button" class="cv-modal-submit" id="leadSubmitBtn">
          <span id="leadSubmitText">Send my JD &amp; find candidates</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
      <p class="cv-modal-error" id="leadErrorMsg" hidden></p>
      <p class="cv-modal-fine">We'll never share your email or spam you. We just need somewhere to send the shortlist.</p>
    </div>
    <!-- Success state -->
    <div id="leadModalSuccess" class="cv-modal-success" hidden>
      <div class="cv-modal-success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>You're in. We're on it.</h2>
      <p>We received your job description. Expect a shortlist of matched candidates in your inbox within 24 hours.</p>
      <button class="cv-modal-done-btn" id="leadDoneBtn" type="button">Done</button>
    </div>
  </div>
</div>


`;
  }

  initLogic() {
    var root = this.shadowRoot;
    var self = this;

    // Observe size changes so Wix can resize the iframe
    if (typeof ResizeObserver !== 'undefined') {
      try {
        var ro = new ResizeObserver(function() { self.notifyHeight(); });
        ro.observe(root.querySelector('.cv-shell') || root.host);
      } catch (e) { /* noop */ }
    }

// =========================================================
  // BUCKET TOOLS — curated from real Coconut OS placement data
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
  // ROLE LIBRARY
  // =========================================================
  var BUCKETS = {
    ea: { label: 'Executive / Admin Support', roles: [
      { id: 'ea', label: 'Executive Assistant', tier: 'Standard' },
      { id: 'senior_ea', label: 'Senior EA / EA to the CEO', tier: 'Advanced' },
      { id: 'general_admin', label: 'General Admin / Administrative Assistant', tier: 'Standard' },
      { id: 'chief_of_staff', label: 'Chief of Staff', tier: 'Pro' }
    ]},
    sales: { label: 'Sales', roles: [
      { id: 'sdr', label: 'Sales Development Representative (SDR)', tier: 'Standard' },
      { id: 'bdr', label: 'Business Development Representative (BDR)', tier: 'Advanced' },
      { id: 'setter', label: 'Appointment Setter / Cold Caller', tier: 'Standard' },
      { id: 'ae', label: 'Account Executive', tier: 'Advanced' }
    ]},
    marketing: { label: 'Marketing & Content', roles: [
      { id: 'social', label: 'Social Media Manager', tier: 'Standard' },
      { id: 'marketing', label: 'Marketing Specialist', tier: 'Advanced' },
      { id: 'content', label: 'Content Writer / Copywriter', tier: 'Standard' },
      { id: 'designer', label: 'Graphic Designer', tier: 'Advanced' },
      { id: 'video', label: 'Video Editor', tier: 'Advanced' },
      { id: 'seo', label: 'SEO Specialist', tier: 'Advanced' }
    ]},
    ops: { label: 'Operations', roles: [
      { id: 'pm', label: 'Project Manager / Coordinator', tier: 'Advanced' },
      { id: 'ops', label: 'Operations Specialist', tier: 'Advanced' },
      { id: 'data', label: 'Data Entry / Research Specialist', tier: 'Standard' }
    ]},
    finance: { label: 'Finance / Bookkeeping', roles: [
      { id: 'bookkeeper', label: 'Bookkeeper', tier: 'Standard' },
      { id: 'apar', label: 'AP/AR Specialist (Invoice Coder)', tier: 'Standard' },
      { id: 'analyst', label: 'Financial Analyst', tier: 'Pro' }
    ]},
    cs: { label: 'Customer Service', roles: [
      { id: 'csr', label: 'Customer Service Representative', tier: 'Standard' },
      { id: 'csm', label: 'Client Success Manager', tier: 'Advanced' }
    ]},
    other: { label: 'Something else', roles: [
      { id: 'other', label: "I'll describe the role myself", tier: 'Standard' }
    ]}
  };

  var ROLES = {
    ea: {
      description: 'right-hand support for a founder or executive — keeping the day organized, communications flowing, and priorities on track',
      responsibilities: [
        "Manage and triage the executive's inbox, flagging priorities and drafting replies in their voice",
        "Own calendar management, scheduling, and meeting prep across personal and professional commitments",
        "Coordinate domestic and international travel, including flights, accommodations, and itineraries",
        "Prepare meeting agendas, take notes during calls, and track action items to completion",
        "Act as a liaison between the executive and clients, vendors, and internal team members",
        "Handle confidential information with discretion and professionalism",
        "Track tasks, deadlines, and follow-ups across multiple ongoing projects",
        "Conduct research and prepare briefing documents on people, companies, and topics",
        "Manage expense tracking, receipts, and reimbursement workflows",
        "Maintain organized digital filing systems and SOPs",
        "Draft, proofread, and edit emails, memos, and other business documents"
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
      description: 'a high-trust partner to a CEO — operating with significant autonomy, handling sensitive communications, and acting as a gatekeeper',
      responsibilities: [
        "Act as the primary gatekeeper for the CEO's time, inbox, and calendar",
        "Manage complex executive communications, including board, investor, and stakeholder correspondence",
        "Coordinate multi-leg international travel with detailed itineraries",
        "Prepare board materials, investor decks, and executive briefing documents",
        "Attend executive meetings, take detailed minutes, and track follow-through",
        "Manage relationships with key external stakeholders",
        "Coordinate logistics for offsites, retreats, and high-stakes meetings",
        "Handle highly confidential information including financial, legal, and HR matters",
        "Streamline executive workflows and identify systemization opportunities",
        "Lead special projects and initiatives on behalf of the CEO"
      ],
      defaultChecked: [0,1,2,3,4,5,7,9],
      subFlavors: [
        { id: 'investor', label: '+ Investor Relations', adds: ['Coordinate investor outreach and follow-ups','Maintain investor CRM and milestone communications','Prepare investor updates and quarterly reports'], tools: ['HubSpot'] },
        { id: 'strategic', label: '+ Strategic Projects', adds: ['Lead cross-functional projects on behalf of the executive','Track OKRs and company-wide priorities','Build executive dashboards and reporting'], tools: ['Notion','Asana'] }
      ],
      tools: ['Google Workspace','Slack','Notion','Calendly','ChatGPT / Claude']
    },
    general_admin: {
      description: 'broad administrative support for a small business or growing team — handling a mix of admin, data, customer, and operations tasks',
      responsibilities: [
        "Manage email correspondence and inbox triage",
        "Schedule appointments, meetings, and calls for the team",
        "Handle data entry, list cleaning, and record maintenance",
        "Respond to customer service emails and basic support tickets",
        "Maintain organized digital filing systems and document libraries",
        "Process basic invoicing, payment tracking, and expense logging",
        "Conduct research on companies, prospects, or vendors",
        "Update and maintain CRM records with accurate information",
        "Post basic social media updates and manage simple content scheduling",
        "Handle ad hoc administrative requests as they come up"
      ],
      defaultChecked: [0,1,2,3,4,9],
      subFlavors: [
        { id: 'cs', label: '+ Customer Service focus', adds: ['Respond to inbound customer questions across email and chat','Resolve common issues using company playbook','Track tickets and customer outcomes'], tools: [] },
        { id: 'data', label: '+ Data Entry focus', adds: ['Maintain large, clean datasets across CRMs and spreadsheets','Audit records for accuracy and duplicates','Build and maintain simple dashboards'], tools: ['Microsoft Office'] }
      ],
      tools: ['Google Workspace','Microsoft Office','Slack']
    },
    chief_of_staff: {
      description: 'a strategic right-hand to a founder or CEO — bridging leadership and execution, owning cross-functional projects, and turning vision into operational reality',
      responsibilities: [
        "Partner with the founder on strategy, translating vision into executable plans",
        "Drive cross-functional projects and ensure on-time delivery",
        "Manage contractors, agencies, and internal team members",
        "Identify operational bottlenecks and design systems to remove them",
        "Build, document, and automate repeatable processes and SOPs",
        "Lead executive communications, including board and investor updates",
        "Manage hiring pipelines and coordinate interview processes",
        "Track OKRs, strategic initiatives, and company-wide KPIs",
        "Run leadership team meetings and follow up on action items"
      ],
      defaultChecked: [0,1,3,4,7,8],
      subFlavors: [
        { id: 'ops', label: '+ Operations focus', adds: ['Own day-to-day business operations and process management','Manage vendor relationships, contracts, and operational budgets','Build dashboards and reporting workflows'], tools: ['Notion'] }
      ],
      tools: ['Google Workspace','Slack','Notion','Asana','ChatGPT / Claude']
    }
  };

  function genericRole() {
    return {
      description: 'a dedicated professional to support your business operations',
      responsibilities: [
        "Execute core responsibilities of the role with attention to detail",
        "Communicate proactively with the team and stakeholders",
        "Maintain organized records and documentation",
        "Follow established processes and identify improvements",
        "Use modern tools to scale output and quality",
        "Adapt quickly to changing priorities and business needs"
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
    // Section 1
    company: '', industry: '', years: '', position: '',
    // Section 2
    bucket: '', role: '', roleLabel: '', roleOther: '', tier: 'Standard',
    subFlavors: new Set(), count: '1', exp: '',
    // Section 3
    checkedResp: new Set(), tasks: '', tools: new Set(), customTools: new Set(),
    // Section 4
    nonSoft: '', nonRole: '', nonIndustry: '', nonSoftSkill: '',
    english: '', nice: '',
    // Section 5
    hours: '', tzZone: '', tzWindow: '',
    // Budget (Section 5)
    budgetMin: 3000, budgetMax: 5000, budgetShow: true,
    // AI enrichment
    _aiAbout: null,
    _aiResponsibilities: null,
    _aiNonNegotiables: null,
    _aiNiceToHaves: null,
    _aiError: null,
    _aiStatus: 'idle',          // 'idle' | 'loading' | 'success' | 'error'
    _aiInputSignature: null     // hash of inputs at time of last AI call
  };

  // =========================================================
  // BACKEND (Wix Velo proxy holding the OpenAI key in secrets)
  // =========================================================
  var BACKEND_ENDPOINT = 'https://www.coconutva.com/_functions/generateJD';

  // =========================================================
  // DOM HELPERS
  // =========================================================
  var $ = function(id) { return root.getElementById(id); };
  var $$ = function(s) { return root.querySelectorAll(s); };

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  // =========================================================
  // SECTION REVEAL (progressive disclosure)
  // =========================================================
  var SECTIONS = [
    { id: 'section-business', complete: function() {
      return state.company.trim() && state.industry && state.years && state.position.trim();
    }},
    { id: 'section-role', complete: function() {
      if (!state.bucket || !state.role || !state.exp) return false;
      if (state.role === 'other' && !state.roleOther.trim()) return false;
      return true;
    }},
    { id: 'section-work', complete: function() {
      return state.checkedResp.size > 0 && state.tools.size > 0;
    }},
    { id: 'section-fit', complete: function() {
      return state.nonSoft.trim() && state.nonRole.trim() && state.english;
    }},
    { id: 'section-logistics', complete: function() {
      return state.hours && state.tzZone && state.tzWindow;
    }}
  ];

  function updateSectionLocks() {
    var anyPrevComplete = true;
    var firstUnlocked = null;
    SECTIONS.forEach(function(sec, idx) {
      var el = $(sec.id);
      if (idx === 0) {
        el.classList.remove('locked');
        return;
      }
      if (anyPrevComplete && SECTIONS[idx-1].complete()) {
        if (el.classList.contains('locked')) {
          el.classList.remove('locked');
          // Remember only the FIRST newly-unlocked section.
          // Several sections can become available at once (e.g. choosing a role
          // pre-checks default responsibilities + tools, which auto-completes
          // section-work the moment exp is picked). We must scroll to the
          // earliest one, not the deepest.
          if (!firstUnlocked) firstUnlocked = el;
        }
      } else {
        anyPrevComplete = false;
        el.classList.add('locked');
      }
    });

    // Single scroll per call, aimed at the first newly-unlocked section.
    if (firstUnlocked) {
      var target = firstUnlocked;
      setTimeout(function() {
        if (window.innerWidth < 960) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        var pane = root.querySelector('.cv-form-pane');
        if (!pane) return;
        requestAnimationFrame(function() {
          var top = Math.max(0, target.offsetTop - 8);
          pane.scrollTo({ top: top, behavior: 'smooth' });
        });
      }, 480);
    }
  }

  // =========================================================
  // SECTION 1 — Business
  // =========================================================
  ['qCompany','qIndustry','qYears','qPosition'].forEach(function(id) {
    $(id).addEventListener('input', updateBusiness);
    $(id).addEventListener('change', updateBusiness);
  });
  function updateBusiness() {
    state.company = $('qCompany').value;
    state.industry = $('qIndustry').value;
    state.years = $('qYears').value;
    state.position = $('qPosition').value;
    onStateChange();
  }

  // =========================================================
  // SECTION 2 — Role (bucket → role → sub-flavors → exp)
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
      state.checkedResp.clear();
      state.tools.clear();
      state.customTools.clear();
      $('qRoleOther').hidden = true;
      $('qRoleOther').value = '';
      $('qRole').value = '';
      $('roleField').hidden = false;
      $('subFlavorField').hidden = true;
      $('roleMetaField').hidden = true;
      populateRoleSelect();
      populateRespList();
      populateToolPills();
      onStateChange();
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
    var otherInput = $('qRoleOther');
    if (state.role === 'other') {
      otherInput.hidden = false;
      otherInput.focus();
    } else {
      otherInput.hidden = true;
      state.roleOther = '';
      otherInput.value = '';
    }
    state.subFlavors.clear();
    state.checkedResp.clear();
    state.tools.clear();
    state.customTools.clear();
    populateSubFlavors();
    populateRespList();
    populateToolPills();
    var roleData = getRoleData(state.role);
    var hasSubFlavors = roleData.subFlavors && roleData.subFlavors.length > 0;
    $('subFlavorField').hidden = !(state.role && hasSubFlavors);
    $('roleMetaField').hidden = !state.role;
    onStateChange();
  });

  $('qRoleOther').addEventListener('input', function() {
    state.roleOther = this.value;
    if (state.role === 'other') {
      state.roleLabel = this.value.trim() || 'Other';
    }
    onStateChange();
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
        // re-render resp + tools to add/remove sub-flavor specific items
        populateRespList();
        populateToolPills();
        onStateChange();
      });
      container.appendChild(p);
    });
  }

  $('qCount').addEventListener('change', function() { state.count = this.value; onStateChange(); });
  $('qExp').addEventListener('change', function() { state.exp = this.value; onStateChange(); });

  // =========================================================
  // SECTION 3 — Work (responsibilities + tools)
  // =========================================================
  function populateRespList() {
    var list = $('respList');
    if (!state.role) {
      list.innerHTML = '<p style="font-size:13px; color:var(--cv-fg-3); padding:14px; text-align:center; margin:0;">Pick a role to see suggested responsibilities.</p>';
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

    // Pre-check defaults only first time (when checkedResp empty)
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
        onStateChange();
      });
    });
  }

  function populateToolPills() {
    var container = $('toolPills');
    var addWrap = $('toolAddWrap');

    if (!state.bucket) {
      container.innerHTML = '<p style="font-size:12.5px; color:var(--cv-fg-3); padding:6px 4px; margin:0;">Pick a role to see relevant tools.</p>';
      addWrap.hidden = true;
      return;
    }

    addWrap.hidden = false;

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

    var allTools = [];
    roleSuggested.forEach(function(t) {
      if (allTools.indexOf(t) < 0) allTools.push(t);
    });
    bucketTools.forEach(function(t) {
      if (allTools.indexOf(t) < 0) allTools.push(t);
    });

    if (state.tools.size === 0) {
      roleSuggested.forEach(function(t) {
        if (allTools.indexOf(t) >= 0) state.tools.add(t);
      });
    }

    var html = '';
    allTools.forEach(function(tool) {
      var on = state.tools.has(tool);
      html += '<span class="cv-pill ' + (on ? 'on' : '') + '" data-tool="' + escapeAttr(tool) + '">' + escapeHtml(tool) + '</span>';
    });
    state.customTools.forEach(function(tool) {
      html += '<span class="cv-pill on custom" data-tool="' + escapeAttr(tool) + '" data-custom="1">' +
        escapeHtml(tool) +
        '<span class="pill-x" data-remove="' + escapeAttr(tool) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</span></span>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.cv-pill').forEach(function(p) {
      var xBtn = p.querySelector('.pill-x');
      if (xBtn) {
        xBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var toolName = xBtn.dataset.remove;
          state.tools.delete(toolName);
          state.customTools.delete(toolName);
          populateToolPills();
          onStateChange();
        });
      }
      p.addEventListener('click', function(e) {
        if (e.target.closest('.pill-x')) return;
        var t = p.dataset.tool;
        if (state.tools.has(t)) { state.tools.delete(t); p.classList.remove('on'); }
        else { state.tools.add(t); p.classList.add('on'); }
        onStateChange();
      });
    });
  }

  $('toolAddBtn').addEventListener('click', function() {
    $('toolInputWrap').hidden = false;
    $('toolInput').value = '';
    setTimeout(function() { $('toolInput').focus(); }, 10);
  });

  $('toolInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var val = this.value.trim();
      if (!val) return;
      var allCurrent = new Set();
      $$('#toolPills .cv-pill').forEach(function(p) { allCurrent.add(p.dataset.tool.toLowerCase()); });
      if (allCurrent.has(val.toLowerCase())) {
        state.tools.add(val);
      } else {
        state.customTools.add(val);
        state.tools.add(val);
      }
      this.value = '';
      $('toolInputWrap').hidden = true;
      populateToolPills();
      onStateChange();
    } else if (e.key === 'Escape') {
      this.value = '';
      $('toolInputWrap').hidden = true;
    }
  });

  $('toolInput').addEventListener('blur', function() {
    var self = this;
    setTimeout(function() {
      if (!self.value.trim()) $('toolInputWrap').hidden = true;
    }, 200);
  });

  $('qTasks').addEventListener('input', function() { state.tasks = this.value; onStateChange(); });

  // =========================================================
  // SECTION 4 — Fit
  // =========================================================
  ['qNonSoft','qNonRole','qNonIndustry','qNonSoftSkill','qEnglish','qNice'].forEach(function(id) {
    $(id).addEventListener('input', updateFit);
    $(id).addEventListener('change', updateFit);
  });
  function updateFit() {
    state.nonSoft = $('qNonSoft').value;
    state.nonRole = $('qNonRole').value;
    state.nonIndustry = $('qNonIndustry').value;
    state.nonSoftSkill = $('qNonSoftSkill').value;
    state.english = $('qEnglish').value;
    state.nice = $('qNice').value;
    onStateChange();
  }

  // =========================================================
  // SECTION 5 — Logistics
  // =========================================================
  ['qHours','qTzZone','qTzWindow'].forEach(function(id) {
    $(id).addEventListener('change', updateLogistics);
  });
  function updateLogistics() {
    state.hours = $('qHours').value;
    state.tzZone = $('qTzZone').value;
    state.tzWindow = $('qTzWindow').value;
    onStateChange();
  }

  // =========================================================
  // BUDGET — dual-handle slider with min/max coupling.
  // The two range inputs are visually overlaid; we enforce
  // min ≤ max - step and render a custom track fill on top.
  // =========================================================
  function formatBudget(v) {
    var n = parseInt(v, 10);
    if (n >= 1000) {
      if (n % 1000 === 0) return '$' + (n / 1000) + 'K';
      return '$' + (n / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return '$' + n;
  }
  function refreshBudgetUI() {
    var minEl = $('budgetMin');
    var maxEl = $('budgetMax');
    var min = parseInt(minEl.value, 10);
    var max = parseInt(maxEl.value, 10);
    var lo = parseInt(minEl.min, 10);
    var hi = parseInt(minEl.max, 10);
    var range = hi - lo;
    var leftPct = ((min - lo) / range) * 100;
    var rightPct = ((max - lo) / range) * 100;
    var fill = $('budgetTrackFill');
    if (fill) {
      fill.style.left = leftPct + '%';
      fill.style.width = (rightPct - leftPct) + '%';
    }
    $('budgetMinDisplay').textContent = formatBudget(min);
    $('budgetMaxDisplay').textContent = formatBudget(max);
    state.budgetMin = min;
    state.budgetMax = max;
  }
  function onBudgetChange(which) {
    var minEl = $('budgetMin');
    var maxEl = $('budgetMax');
    var min = parseInt(minEl.value, 10);
    var max = parseInt(maxEl.value, 10);
    var step = parseInt(minEl.step, 10);
    if (which === 'min' && min > max - step) {
      minEl.value = Math.max(parseInt(minEl.min, 10), max - step);
    } else if (which === 'max' && max < min + step) {
      maxEl.value = Math.min(parseInt(maxEl.max, 10), min + step);
    }
    refreshBudgetUI();
    onStateChange();
  }
  $('budgetMin').addEventListener('input', function() { onBudgetChange('min'); });
  $('budgetMax').addEventListener('input', function() { onBudgetChange('max'); });
  $('budgetShowRow').addEventListener('click', function() {
    state.budgetShow = !state.budgetShow;
    this.classList.toggle('on', state.budgetShow);
    onStateChange();
  });
  // Initial render of the track fill
  refreshBudgetUI();

  // =========================================================
  // STATE CHANGE → update locks + re-render preview + trigger AI if ready
  // =========================================================
  var renderTimer = null;
  var aiTriggerTimer = null;
  function onStateChange() {
    updateSectionLocks();
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 80);

    // Debounced AI trigger — only fires once user has settled
    if (aiTriggerTimer) clearTimeout(aiTriggerTimer);
    aiTriggerTimer = setTimeout(maybeTriggerAI, 800);
  }

  // =========================================================
  // BACKEND CALL — AI enrichment
  // =========================================================
  function inputSignature() {
    // Signature based on fields that influence AI output.
    // If user changes any of these, we re-run AI.
    return [
      state.company, state.industry, state.years, state.position,
      state.role, state.roleLabel,
      Array.from(state.subFlavors).sort().join('|'),
      state.exp,
      Array.from(state.checkedResp).sort().join('|'),
      state.tasks,
      Array.from(state.tools).sort().join('|'),
      Array.from(state.customTools).sort().join('|'),
      state.english,
      state.nonSoft, state.nonRole, state.nonIndustry, state.nonSoftSkill,
      state.nice,
      state.hours, state.tzZone, state.tzWindow,
      state.budgetMin, state.budgetMax, state.budgetShow
    ].join('§');
  }

  function buildPayload() {
    var roleData = getRoleData(state.role);
    var subFlavorLabels = [];
    state.subFlavors.forEach(function(fid) {
      var f = (roleData.subFlavors || []).find(function(x) { return x.id === fid; });
      if (f) subFlavorLabels.push(f.label);
    });
    return {
      company: state.company,
      industry: state.industry,
      years_in_business: state.years,
      hiring_manager_role: state.position,
      role: state.roleLabel || 'role',
      role_id: state.role,
      specializations: subFlavorLabels,
      experience_level: state.exp,
      checked_responsibilities: Array.from(state.checkedResp),
      free_text_extras: state.tasks,
      tools: Array.from(state.tools),
      custom_tools: Array.from(state.customTools),
      english_level: state.english,
      raw_non_negotiables: {
        software: state.nonSoft,
        role_experience: state.nonRole,
        industry_experience: state.nonIndustry,
        soft_skills: state.nonSoftSkill
      },
      raw_nice_to_have: state.nice,
      time_zone: state.tzZone,
      time_zone_window: state.tzWindow,
      budget_min: state.budgetMin,
      budget_max: state.budgetMax,
      budget_show: state.budgetShow,
      hours: state.hours,
      count: state.count,
      tier: state.tier,
      submitted_at: new Date().toISOString()
    };
  }

  function callBackend() {
    return new Promise(function(resolve, reject) {
      var timedOut = false;
      var timeoutPromise = new Promise(function(_, rej) {
        setTimeout(function() {
          timedOut = true;
          rej(new Error('Request timed out after 60 seconds.'));
        }, 60000);
      });
      var fetchPromise = fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      }).then(function(res) {
        if (timedOut) return;
        if (!res.ok) {
          return res.text().then(function(txt) {
            var msg = 'Backend error ' + res.status;
            try { var p = JSON.parse(txt); if (p && p.error) msg = p.error; }
            catch(e) { if (txt) msg = txt.slice(0, 200); }
            throw new Error(msg);
          });
        }
        return res.json();
      }).then(function(data) {
        if (timedOut) return;
        if (!data || !data.about_paragraph || !Array.isArray(data.responsibilities)) {
          throw new Error('Backend returned malformed response');
        }
        return data;
      });
      Promise.race([fetchPromise, timeoutPromise]).then(resolve).catch(reject);
    });
  }

  function maybeTriggerAI(force) {
    if (!isJDReady()) return;
    var sig = inputSignature();
    if (!force && state._aiInputSignature === sig && state._aiStatus === 'success') return;
    if (state._aiStatus === 'loading') return; // already in flight

    state._aiStatus = 'loading';
    state._aiInputSignature = sig;
    state._aiError = null;
    renderPreview();

    callBackend().then(function(ai) {
      // If user changed inputs while AI was in flight, drop this result
      // (a newer call will already have been queued).
      if (state._aiInputSignature !== sig) return;
      state._aiAbout = ai.about_paragraph;
      state._aiResponsibilities = ai.responsibilities;
      state._aiNonNegotiables = Array.isArray(ai.non_negotiables) ? ai.non_negotiables : null;
      state._aiNiceToHaves = Array.isArray(ai.nice_to_haves) ? ai.nice_to_haves : null;
      state._aiStatus = 'success';
      renderPreview();
    }).catch(function(err) {
      if (state._aiInputSignature !== sig) return;
      console.error('AI call failed:', err);
      state._aiError = err.message || 'AI enrichment unavailable';
      state._aiStatus = 'error';
      renderPreview();
    });
  }

  // =========================================================
  // PREVIEW RENDERING
  // =========================================================

  // The preview shows progressively as data comes in:
  //  - Empty state until we have company OR role
  //  - Title + subtitle as soon as we have role
  //  - About paragraph when we have company + role
  //  - Responsibilities when we have checked resp
  //  - Tools when tools selected
  //  - Non-negotiables when at least one filled
  //  - Details when logistics filled
  //  - Hero (match score + CTAs) when "ready" (role + 3+ resps + tools + english)

  function hasAnyData() {
    return !!(state.company || state.role || state.industry || state.years || state.position);
  }

  function isJDReady() {
    return !!(state.role && state.checkedResp.size >= 3 && state.tools.size >= 1 && state.english);
  }

  function computeResults() {
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
    if (state.exp === 'senior') match -= 3;
    if (state.subFlavors.size >= 3) match -= 2;
    if (state.english === 'Fluent — near-native, client-facing') match -= 2;
    if (state.hours === '20 hours') match += 2;
    if (state.tzWindow === 'Flexible — overlap a few hours daily') match += 1;
    match = Math.max(80, Math.min(96, match));

    var daysBase = { ea: '2-5', sdr: '2-4', general_admin: '2-5', social: '3-5', marketing: '3-5', csr: '3-5', bookkeeper: '3-6' };
    var days = daysBase[state.role] || '3-7';

    return { match: match, days: days };
  }

  // Industry-specific copy hints
  function industryNote(industry) {
    if (!industry) return '';
    var i = industry.toLowerCase();
    if (i.indexOf('real estate') >= 0) return ' real estate operation';
    if (i.indexOf('saas') >= 0 || i.indexOf('tech') >= 0) return ' SaaS company';
    if (i.indexOf('marketing') >= 0 || i.indexOf('agency') >= 0) return ' agency';
    if (i.indexOf('e-commerce') >= 0 || i.indexOf('retail') >= 0) return ' e-commerce business';
    if (i.indexOf('healthcare') >= 0) return ' healthcare practice';
    if (i.indexOf('financial') >= 0) return ' financial services firm';
    if (i.indexOf('construction') >= 0) return ' construction business';
    if (i.indexOf('education') >= 0) return ' education company';
    if (i.indexOf('hospitality') >= 0 || i.indexOf('f&b') >= 0) return ' hospitality business';
    if (i.indexOf('professional') >= 0) return ' professional services firm';
    return ' company';
  }

  function companyAge(years) {
    if (!years) return '';
    if (years === 'Less than 1 year') return 'early-stage';
    if (years === '1–3 years') return 'growing';
    if (years === '3–5 years') return 'established';
    if (years === '5–10 years') return 'well-established';
    if (years === '10+ years') return 'mature';
    return '';
  }

  function buildAboutParagraphDeterministic() {
    var roleLabel = state.roleLabel;
    var roleData = getRoleData(state.role);
    var company = state.company.trim() || 'Your company';
    var ageWord = companyAge(state.years);
    var industryWord = industryNote(state.industry);

    var s1;
    if (!state.role) {
      // No role chosen yet — descriptive of the company only.
      // Pulls the user forward without making up role details.
      if (ageWord && industryWord) {
        s1 = company + ' is a ' + ageWord + industryWord + '. Pick a role on the left and the rest of this JD will fill in as you go.';
      } else if (industryWord) {
        s1 = company + ' is a' + industryWord + '. Pick a role on the left and the rest of this JD will fill in as you go.';
      } else if (ageWord) {
        s1 = company + ' is a ' + ageWord + ' business. Pick a role on the left and the rest of this JD will fill in as you go.';
      } else {
        s1 = company + ' is preparing to hire. Pick a role on the left and the rest of this JD will fill in as you go.';
      }
      return s1;
    }

    // Role IS chosen — proper hiring sentence.
    if (ageWord && industryWord) {
      s1 = company + ' is a ' + ageWord + industryWord + ' hiring a remote ' + roleLabel + ' to ' + roleData.description + '.';
    } else if (industryWord) {
      s1 = company + ' is a' + industryWord + ' hiring a remote ' + roleLabel + ' to ' + roleData.description + '.';
    } else {
      s1 = company + ' is hiring a remote ' + roleLabel + ' to ' + roleData.description + '.';
    }

    // Second sentence: hours + tz
    var s2 = '';
    if (state.hours && state.tzZone) {
      var hoursLower = state.hours.toLowerCase().replace(' (full-time)', ', full-time');
      s2 = ' This is a fully remote, ' + hoursLower + ' role with overlap in ' + state.tzZone + '.';
    } else if (state.hours) {
      s2 = ' This is a fully remote, ' + state.hours.toLowerCase().replace(' (full-time)', ', full-time') + ' role.';
    } else {
      s2 = ' This is a fully remote role.';
    }

    return s1 + s2;
  }

  function buildAboutParagraph() {
    // Prefer AI version when available; fall back to deterministic
    if (state._aiAbout && state._aiStatus === 'success') return state._aiAbout;
    return buildAboutParagraphDeterministic();
  }

  function buildResponsibilitiesDeterministic() {
    var checked = Array.from(state.checkedResp);
    if (state.tasks.trim()) {
      state.tasks.split(/[\n,]/).forEach(function(t) {
        var c = t.trim().replace(/^[-•]\s*/, '');
        if (c) checked.push(c.charAt(0).toUpperCase() + c.slice(1));
      });
    }
    return checked;
  }

  function buildResponsibilities() {
    if (state._aiResponsibilities && state._aiStatus === 'success') return state._aiResponsibilities;
    return buildResponsibilitiesDeterministic();
  }

  function isMeaningful(v) {
    if (!v) return false;
    var s = String(v).trim().toLowerCase();
    if (!s) return false;
    var skipValues = ['n/a','na','none','-','—','skip','no','not applicable','nope'];
    return skipValues.indexOf(s) < 0;
  }

  function buildNonNegotiablesDeterministic() {
    var nons = [];
    if (isMeaningful(state.nonSoft)) nons.push(state.nonSoft.trim());
    if (isMeaningful(state.nonRole)) nons.push(state.nonRole.trim());
    if (isMeaningful(state.nonIndustry)) nons.push('Experience in ' + state.nonIndustry.trim());
    if (isMeaningful(state.nonSoftSkill)) nons.push(state.nonSoftSkill.trim());
    if (state.english) nons.push(state.english + ' English');
    return nons;
  }

  function buildNonNegotiables() {
    if (state._aiNonNegotiables && state._aiStatus === 'success') return state._aiNonNegotiables;
    return buildNonNegotiablesDeterministic();
  }

  function buildNiceToHavesDeterministic() {
    var nices = [];
    if (isMeaningful(state.nice)) nices.push(state.nice.trim());
    return nices;
  }

  function buildNiceToHaves() {
    if (state._aiNiceToHaves && state._aiStatus === 'success') return state._aiNiceToHaves;
    return buildNiceToHavesDeterministic();
  }

  function copyBtnHtml(key) {
    return '<button class="cv-copy-btn" data-copy="' + key + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>' +
      'Copy</button>';
  }

  function renderPreview() {
    // 1. Toggle empty vs content states
    if (!hasAnyData()) {
      $('previewEmpty').hidden = false;
      $('previewContent').hidden = true;
      return;
    }
    $('previewEmpty').hidden = true;
    $('previewContent').hidden = false;

    // 2. Hero
    var ready = isJDReady();
    var hero = $('resultHero');
    var hint = $('previewHint');
    var footer = $('previewFooter');

    if (ready) {
      hero.hidden = false;
      hint.hidden = true;
      footer.hidden = false;
      var results = computeResults();
      $('resStat1').textContent = results.match + '% Match';
      $('resStat2').textContent = 'Candidates in ' + results.days + ' days';
      $('resStat3').textContent = state.tier + ' tier';
      $('resHeadline').textContent = 'Your ' + (state.roleLabel || 'role') + ' job description is ready.';
      $('resSub').textContent = 'Based on your inputs, Coconut typically fills this role in ' + results.days + ' days with vetted, dedicated talent.';

      // AI status — now lives in the footer (Tyler's feedback: keep hero clean,
      // make AI feel like a finishing touch, not the headline).
      var ai = $('footerAi');
      var aiText = $('footerAiText');
      var sep = $('footerSep');
      var regenBtn = $('aiRegenBtn');
      if (state._aiStatus === 'loading') {
        ai.hidden = false; sep.hidden = false;
        ai.className = 'cv-footer-ai loading';
        aiText.textContent = 'Enhancing with AI...';
        regenBtn.classList.add('spinning');
      } else if (state._aiStatus === 'success') {
        ai.hidden = false; sep.hidden = false;
        ai.className = 'cv-footer-ai';
        aiText.textContent = 'Enhanced with AI';
        regenBtn.classList.remove('spinning');
      } else if (state._aiStatus === 'error') {
        ai.hidden = false; sep.hidden = false;
        ai.className = 'cv-footer-ai error';
        aiText.textContent = 'AI unavailable — using template';
        regenBtn.classList.remove('spinning');
      } else {
        ai.hidden = true; sep.hidden = true;
      }

      // Campaign tag — passed to the backend on lead submit (for later attribution).
      // Kept on state so the modal flow can grab it at submit time.
      var roleSlug = (state.roleLabel || 'role').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      var subSlugs = Array.from(state.subFlavors).join('_');
      state._campaign = 'jd_' + roleSlug + (subSlugs ? '_' + subSlugs : '');
    } else {
      hero.hidden = true;
      footer.hidden = true;
      // Hint shown when we have role but not all data
      if (state.role && state.checkedResp.size >= 1) {
        hint.hidden = false;
        var missing = [];
        if (state.checkedResp.size < 3) missing.push('a few more responsibilities');
        if (state.tools.size < 1) missing.push('at least one tool');
        if (!state.english) missing.push('English level');
        if (missing.length) {
          hint.textContent = 'Add ' + missing.join(', ') + ' to see your match score and time to hire.';
        }
      } else {
        hint.hidden = true;
      }
    }

    // 3. JD doc — build sections progressively
    var doc = $('jdDoc');
    var html = '';
    var roleLabel = state.roleLabel || 'this role';

    // Title + subtitle — show as soon as we have anything to anchor it
    var titleText;
    if (state.role) {
      titleText = escapeHtml(roleLabel);
    } else if (state.company.trim()) {
      titleText = 'Job description draft';
    } else {
      titleText = 'Your job description';
    }
    var companyText = '';
    if (state.role && state.company.trim()) {
      companyText = ' — ' + escapeHtml(state.company.trim());
    } else if (!state.role && state.company.trim()) {
      companyText = ' · ' + escapeHtml(state.company.trim());
    }

    var subtitleParts = ['Remote'];
    if (state.hours) subtitleParts.push(state.hours);
    if (state.tzZone) subtitleParts.push(state.tzZone);
    html += '<h3 class="cv-jd-title">' + titleText + companyText + '</h3>';
    html += '<p class="cv-jd-subtitle">' + escapeHtml(subtitleParts.join(' · ')) + '</p>';

    // About — show as soon as ANY company/industry/years info is in
    if (state.company.trim() || state.industry || state.years || state.role) {
      var aboutHeader = state.role ? 'About the role' : 'About the company';
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">' + aboutHeader + ' ' + copyBtnHtml('about') + '</div>' +
        '<div id="copyTarget-about"><p>' + escapeHtml(buildAboutParagraph()) + '</p></div></div>';
    }

    // Responsibilities
    var resp = buildResponsibilities();
    if (resp.length) {
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">What you\'ll do ' + copyBtnHtml('do') + '</div>' +
        '<ul id="copyTarget-do">' +
        resp.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Tools
    if (state.tools.size) {
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">Tools you\'ll use ' + copyBtnHtml('tools') + '</div>' +
        '<ul id="copyTarget-tools">' +
        Array.from(state.tools).map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Non-negotiables
    var nons = buildNonNegotiables();
    if (nons.length) {
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">What we\'re looking for ' + copyBtnHtml('non') + '</div>' +
        '<ul id="copyTarget-non">' +
        nons.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Nice to have
    var nices = buildNiceToHaves();
    if (nices.length) {
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">Nice to have ' + copyBtnHtml('nice') + '</div>' +
        '<ul id="copyTarget-nice">' +
        nices.map(function(t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
        '</ul></div>';
    }

    // Details
    if (state.hours || state.tzZone || state.tzWindow) {
      var budgetLine = '';
      if (state.budgetShow) {
        budgetLine = '<div class="dk">Budget</div><div class="dv">' +
          formatBudget(state.budgetMin) + '–' + formatBudget(state.budgetMax) + ' / month</div>';
      }
      html += '<div class="cv-jd-section">' +
        '<div class="cv-jd-h3">The details ' + copyBtnHtml('details') + '</div>' +
        '<div class="cv-jd-details" id="copyTarget-details">' +
        (state.hours ? '<div class="dk">Hours</div><div class="dv">' + escapeHtml(state.hours) + '</div>' : '') +
        (state.tzZone ? '<div class="dk">Time zone</div><div class="dv">' + escapeHtml(state.tzZone) + (state.tzWindow ? ' · ' + escapeHtml(state.tzWindow) : '') + '</div>' : '') +
        budgetLine +
        '<div class="dk">Location</div><div class="dv">Remote</div>' +
        '</div></div>';
    }

    doc.innerHTML = html;

    // Wire copy buttons
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
          var bl = jdBudgetLine();
          if (bl) details.push('Budget: ' + bl);
          details.push('Location: Remote');
          text = details.join('\n');
        } else {
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
  }

  // =========================================================
  // EXPORT — text/markdown/linkedin/doc/pdf
  // =========================================================
  function jdRoleLabel() { return state.roleLabel || 'this role'; }
  function jdSafeFilename() {
    var name = (state.roleLabel || 'job-description').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'job-description';
    if (state.company.trim()) {
      var co = state.company.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (co) name = name + '-' + co;
    }
    return name;
  }
  function jdSubtitleParts() {
    var p = ['Remote'];
    if (state.hours) p.push(state.hours);
    if (state.tzZone) p.push(state.tzZone);
    return p;
  }
  // Budget formatted for inclusion in exports/plain text/etc.
  // Returns empty string when the user toggled "Show budget in JD" off.
  function jdBudgetLine() {
    if (!state.budgetShow) return '';
    return formatBudget(state.budgetMin) + '–' + formatBudget(state.budgetMax) + ' / month';
  }

  // Plain text version (used by Copy JD button and Copy plain)
  function buildPlainText() {
    var lines = [];
    lines.push(jdRoleLabel() + (state.company.trim() ? ' — ' + state.company.trim() : ''));
    lines.push(jdSubtitleParts().join(' · '));
    lines.push('');
    lines.push('ABOUT THE ROLE');
    lines.push(buildAboutParagraph());
    lines.push('');
    var resp = buildResponsibilities();
    if (resp.length) {
      lines.push("WHAT YOU'LL DO");
      resp.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    if (state.tools.size) {
      lines.push("TOOLS YOU'LL USE");
      Array.from(state.tools).forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    var nons = buildNonNegotiables();
    if (nons.length) {
      lines.push("WHAT WE'RE LOOKING FOR");
      nons.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    var nices = buildNiceToHaves();
    if (nices.length) {
      lines.push('NICE TO HAVE');
      nices.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    lines.push('THE DETAILS');
    if (state.hours) lines.push('Hours: ' + state.hours);
    if (state.tzZone) lines.push('Time zone: ' + state.tzZone + (state.tzWindow ? ' · ' + state.tzWindow : ''));
    var bl1 = jdBudgetLine();
    if (bl1) lines.push('Budget: ' + bl1);
    lines.push('Location: Remote');
    return lines.join('\n');
  }

  // Markdown version
  function buildMarkdown() {
    var lines = [];
    lines.push('# ' + jdRoleLabel() + (state.company.trim() ? ' — ' + state.company.trim() : ''));
    lines.push('*' + jdSubtitleParts().join(' · ') + '*');
    lines.push('');
    lines.push('## About the role');
    lines.push('');
    lines.push(buildAboutParagraph());
    lines.push('');
    var resp = buildResponsibilities();
    if (resp.length) {
      lines.push("## What you'll do");
      lines.push('');
      resp.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    if (state.tools.size) {
      lines.push("## Tools you'll use");
      lines.push('');
      Array.from(state.tools).forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    var nons = buildNonNegotiables();
    if (nons.length) {
      lines.push("## What we're looking for");
      lines.push('');
      nons.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    var nices = buildNiceToHaves();
    if (nices.length) {
      lines.push('## Nice to have');
      lines.push('');
      nices.forEach(function(t) { lines.push('- ' + t); });
      lines.push('');
    }
    lines.push('## The details');
    lines.push('');
    if (state.hours) lines.push('- **Hours:** ' + state.hours);
    if (state.tzZone) lines.push('- **Time zone:** ' + state.tzZone + (state.tzWindow ? ' · ' + state.tzWindow : ''));
    var bl2 = jdBudgetLine();
    if (bl2) lines.push('- **Budget:** ' + bl2);
    lines.push('- **Location:** Remote');
    return lines.join('\n');
  }

  // LinkedIn version — uses Unicode bold (Mathematical Sans-Serif Bold) for headings
  // since LinkedIn doesn't support markdown but does render those Unicode chars as bold.
  function toLinkedInBold(s) {
    return String(s).split('').map(function(c) {
      var code = c.charCodeAt(0);
      // A-Z -> Mathematical Sans-Serif Bold Capital (U+1D5D4..U+1D5ED)
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + (code - 65));
      // a-z -> Mathematical Sans-Serif Bold Small (U+1D5EE..U+1D607)
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + (code - 97));
      // 0-9 -> Mathematical Sans-Serif Bold Digit (U+1D7EC..U+1D7F5)
      if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + (code - 48));
      return c;
    }).join('');
  }
  function buildLinkedInText() {
    var lines = [];
    lines.push(toLinkedInBold(jdRoleLabel()) + (state.company.trim() ? ' — ' + state.company.trim() : ''));
    lines.push(jdSubtitleParts().join(' · '));
    lines.push('');
    lines.push(buildAboutParagraph());
    lines.push('');
    var resp = buildResponsibilities();
    if (resp.length) {
      lines.push(toLinkedInBold("What you'll do") + ':');
      resp.forEach(function(t) { lines.push('• ' + t); });
      lines.push('');
    }
    if (state.tools.size) {
      lines.push(toLinkedInBold("Tools you'll use") + ':');
      Array.from(state.tools).forEach(function(t) { lines.push('• ' + t); });
      lines.push('');
    }
    var nons = buildNonNegotiables();
    if (nons.length) {
      lines.push(toLinkedInBold("What we're looking for") + ':');
      nons.forEach(function(t) { lines.push('• ' + t); });
      lines.push('');
    }
    var nices = buildNiceToHaves();
    if (nices.length) {
      lines.push(toLinkedInBold('Nice to have') + ':');
      nices.forEach(function(t) { lines.push('• ' + t); });
      lines.push('');
    }
    lines.push(toLinkedInBold('Details') + ': ' + jdSubtitleParts().join(' · ') +
      (state.tzWindow ? ' · ' + state.tzWindow : ''));
    var bl3 = jdBudgetLine();
    if (bl3) lines.push(toLinkedInBold('Budget') + ': ' + bl3);
    lines.push('');
    lines.push('—');
    lines.push('Need to hire someone like this? Coconut Virtual Professionals can help → https://www.coconutva.com');
    return lines.join('\n');
  }

  // Word-compatible HTML (saved with .doc extension)
  function buildWordHtml() {
    var resp = buildResponsibilities();
    var tools = Array.from(state.tools);
    var nons = buildNonNegotiables();
    var nices = buildNiceToHaves();
    var subtitle = jdSubtitleParts().join(' · ');
    var titleHtml = escapeHtml(jdRoleLabel()) + (state.company.trim() ? ' — ' + escapeHtml(state.company.trim()) : '');

    var sections = '';
    sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:18pt;margin-bottom:6pt;">About the role</h2>';
    sections += '<p style="margin:0 0 12pt 0;">' + escapeHtml(buildAboutParagraph()) + '</p>';
    if (resp.length) {
      sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:14pt;margin-bottom:6pt;">What you\'ll do</h2><ul>';
      resp.forEach(function(t) { sections += '<li style="margin:4pt 0;">' + escapeHtml(t) + '</li>'; });
      sections += '</ul>';
    }
    if (tools.length) {
      sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:14pt;margin-bottom:6pt;">Tools you\'ll use</h2><ul>';
      tools.forEach(function(t) { sections += '<li style="margin:4pt 0;">' + escapeHtml(t) + '</li>'; });
      sections += '</ul>';
    }
    if (nons.length) {
      sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:14pt;margin-bottom:6pt;">What we\'re looking for</h2><ul>';
      nons.forEach(function(t) { sections += '<li style="margin:4pt 0;">' + escapeHtml(t) + '</li>'; });
      sections += '</ul>';
    }
    if (nices.length) {
      sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:14pt;margin-bottom:6pt;">Nice to have</h2><ul>';
      nices.forEach(function(t) { sections += '<li style="margin:4pt 0;">' + escapeHtml(t) + '</li>'; });
      sections += '</ul>';
    }
    sections += '<h2 style="color:#0B1E3F;font-size:14pt;margin-top:14pt;margin-bottom:6pt;">The details</h2><ul>';
    if (state.hours) sections += '<li><strong>Hours:</strong> ' + escapeHtml(state.hours) + '</li>';
    if (state.tzZone) sections += '<li><strong>Time zone:</strong> ' + escapeHtml(state.tzZone) + (state.tzWindow ? ' · ' + escapeHtml(state.tzWindow) : '') + '</li>';
    var bl4 = jdBudgetLine();
    if (bl4) sections += '<li><strong>Budget:</strong> ' + escapeHtml(bl4) + '</li>';
    sections += '<li><strong>Location:</strong> Remote</li>';
    sections += '</ul>';

    return '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"' +
      ' xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>' + titleHtml + '</title></head>' +
      '<body style="font-family:Calibri,Arial,sans-serif;max-width:700px;color:#07152B;">' +
      '<h1 style="color:#0B1E3F;font-size:22pt;margin:0 0 2pt 0;">' + titleHtml + '</h1>' +
      '<p style="color:#5C6B85;font-size:11pt;margin:0 0 14pt 0;">' + escapeHtml(subtitle) + '</p>' +
      sections +
      '</body></html>';
  }

  // Trigger a blob download
  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Load jsPDF lazily (only on first PDF request)
  var _jsPDFPromise = null;
  function loadJsPDF() {
    if (_jsPDFPromise) return _jsPDFPromise;
    _jsPDFPromise = new Promise(function(resolve, reject) {
      if (window.jspdf && window.jspdf.jsPDF) { resolve(window.jspdf); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
      s.onload = function() {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf);
        else reject(new Error('jsPDF failed to load'));
      };
      s.onerror = function() { reject(new Error('jsPDF script could not be fetched')); };
      document.head.appendChild(s);
    });
    return _jsPDFPromise;
  }

  function generatePDF() {
    return loadJsPDF().then(function(jspdfNS) {
      var jsPDF = jspdfNS.jsPDF;
      var doc = new jsPDF({ unit: 'pt', format: 'letter' });
      var margin = 56;
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var maxWidth = pageWidth - margin * 2;
      var y = margin;

      function addPageIfNeeded(neededHeight) {
        if (y + neededHeight > pageHeight - margin) { doc.addPage(); y = margin; }
      }
      function writeWrapped(text, opts) {
        opts = opts || {};
        doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
        doc.setFontSize(opts.size || 11);
        if (opts.color) doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
        else doc.setTextColor(7, 21, 43);
        var lineHeight = (opts.size || 11) * 1.35;
        var lines = doc.splitTextToSize(text, maxWidth - (opts.indent || 0));
        lines.forEach(function(ln) {
          addPageIfNeeded(lineHeight);
          doc.text(ln, margin + (opts.indent || 0), y);
          y += lineHeight;
        });
      }
      function spacer(h) { addPageIfNeeded(h); y += h; }
      function heading(text) {
        spacer(10);
        writeWrapped(text, { bold: true, size: 13, color: [11, 30, 63] });
        spacer(2);
      }
      function bulletList(items) {
        items.forEach(function(it) {
          var lineH = 11 * 1.35;
          // bullet dot
          var lines = doc.splitTextToSize(it, maxWidth - 14);
          addPageIfNeeded(lineH * lines.length);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(7, 21, 43);
          doc.text('•', margin, y);
          lines.forEach(function(ln, idx) {
            if (idx > 0) addPageIfNeeded(lineH);
            doc.text(ln, margin + 14, y);
            y += lineH;
          });
        });
      }

      // Title
      writeWrapped(jdRoleLabel() + (state.company.trim() ? ' — ' + state.company.trim() : ''),
        { bold: true, size: 20, color: [11, 30, 63] });
      writeWrapped(jdSubtitleParts().join(' · '),
        { size: 10, color: [92, 107, 133] });
      spacer(10);

      heading('About the role');
      writeWrapped(buildAboutParagraph(), { size: 11 });

      var resp = buildResponsibilities();
      if (resp.length) {
        heading("What you'll do");
        bulletList(resp);
      }
      if (state.tools.size) {
        heading("Tools you'll use");
        bulletList(Array.from(state.tools));
      }
      var nons = buildNonNegotiables();
      if (nons.length) {
        heading("What we're looking for");
        bulletList(nons);
      }
      var nices = buildNiceToHaves();
      if (nices.length) {
        heading('Nice to have');
        bulletList(nices);
      }
      heading('The details');
      var detailItems = [];
      if (state.hours) detailItems.push('Hours: ' + state.hours);
      if (state.tzZone) detailItems.push('Time zone: ' + state.tzZone + (state.tzWindow ? ' · ' + state.tzWindow : ''));
      var bl5 = jdBudgetLine();
      if (bl5) detailItems.push('Budget: ' + bl5);
      detailItems.push('Location: Remote');
      bulletList(detailItems);

      doc.save(jdSafeFilename() + '.pdf');
    });
  }

  // Visual feedback helper for export icons
  function flashIcon(iconEl, kind) {
    if (!iconEl) return;
    if (kind === 'busy') { iconEl.classList.add('busy'); return; }
    if (kind === 'done') {
      iconEl.classList.remove('busy');
      iconEl.classList.add('done');
      setTimeout(function() { iconEl.classList.remove('done'); }, 1400);
    } else if (kind === 'error') {
      iconEl.classList.remove('busy');
      var tip = iconEl.getAttribute('data-tooltip');
      iconEl.setAttribute('data-tooltip', 'Failed — try again');
      setTimeout(function() {
        if (tip) iconEl.setAttribute('data-tooltip', tip);
      }, 2000);
    }
  }

  // Wire export bar
  $$('.cv-export-icon').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var kind = btn.dataset.export;
      try {
        if (kind === 'linkedin') {
          // Copy first, then open the LinkedIn post composer in a new tab.
          // LinkedIn no longer accepts pre-filled post text via URL params (anti-spam),
          // so the user pastes (Cmd/Ctrl+V) into the composer. The clipboard is ready.
          navigator.clipboard.writeText(buildLinkedInText()).then(
            function() {
              flashIcon(btn, 'done');
              // Brief delay so the user perceives the "Copied" feedback before the tab opens
              setTimeout(function() {
                // /feed/?shareActive=true opens the "Start a post" composer when logged in,
                // or the LinkedIn login page otherwise (which redirects back after auth).
                window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
              }, 500);
            },
            function() { flashIcon(btn, 'error'); }
          );
        } else if (kind === 'md') {
          var blob = new Blob([buildMarkdown()], { type: 'text/markdown;charset=utf-8' });
          downloadBlob(jdSafeFilename() + '.md', blob);
          flashIcon(btn, 'done');
        } else if (kind === 'doc') {
          var blobDoc = new Blob([buildWordHtml()], { type: 'application/msword' });
          downloadBlob(jdSafeFilename() + '.doc', blobDoc);
          flashIcon(btn, 'done');
        } else if (kind === 'pdf') {
          flashIcon(btn, 'busy');
          generatePDF().then(
            function() { flashIcon(btn, 'done'); },
            function(err) { console.error('PDF gen failed:', err); flashIcon(btn, 'error'); }
          );
        }
      } catch (e) {
        console.error('Export failed:', e);
        flashIcon(btn, 'error');
      }
    });
  });

  // =========================================================
  // Copy entire JD (main "Copy JD" CTA, reuses plain builder)
  // =========================================================
  $('ctaCopy').addEventListener('click', function() {
    navigator.clipboard.writeText(buildPlainText()).then(function() {
      var btn = $('ctaCopy');
      var original = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
      setTimeout(function() { btn.innerHTML = original; }, 1800);
    });
  });

  // =========================================================
  // LEAD CAPTURE MODAL — replaces the Calendly link
  // Flow:
  //   1. User clicks "Find me candidates"
  //   2. Modal asks for email
  //   3. Submit → POST /captureLead with full JD payload + email
  //   4. Show success state ("we'll be in touch within 24h")
  // =========================================================
  var LEAD_ENDPOINT = 'https://www.coconutva.com/_functions/captureLead';
  var leadSubmitting = false;

  function openLeadModal() {
    $('leadModal').hidden = false;
    $('leadModalForm').hidden = false;
    $('leadModalSuccess').hidden = true;
    $('leadErrorMsg').hidden = true;
    $('leadEmailInput').value = '';
    $('leadEmailInput').classList.remove('error');
    setTimeout(function() { $('leadEmailInput').focus(); }, 80);
  }
  function closeLeadModal() {
    $('leadModal').hidden = true;
  }

  $('ctaFindCandidates').addEventListener('click', openLeadModal);
  $('leadModalClose').addEventListener('click', closeLeadModal);
  $('leadDoneBtn').addEventListener('click', closeLeadModal);

  // Close on backdrop click (but not inside the modal)
  $('leadModal').addEventListener('click', function(e) {
    if (e.target === this) closeLeadModal();
  });

  // ESC to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !$('leadModal').hidden) closeLeadModal();
  });

  function isValidEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  }

  function showLeadError(msg) {
    var err = $('leadErrorMsg');
    err.textContent = msg;
    err.hidden = false;
    $('leadEmailInput').classList.add('error');
  }

  function submitLead() {
    if (leadSubmitting) return;
    var email = $('leadEmailInput').value.trim();
    if (!email) { showLeadError('Please enter your email.'); return; }
    if (!isValidEmail(email)) { showLeadError('That email doesn\'t look quite right.'); return; }

    leadSubmitting = true;
    $('leadErrorMsg').hidden = true;
    $('leadEmailInput').classList.remove('error');
    var btn = $('leadSubmitBtn');
    var btnText = $('leadSubmitText');
    var originalText = btnText.textContent;
    btn.disabled = true;
    btnText.textContent = 'Sending...';

    var payload = buildPayload();
    payload.email = email;
    payload.campaign = state._campaign || 'jd_unknown';
    payload.event_type = 'find_candidates';
    payload.jd_plain_text = buildPlainText();

    var timedOut = false;
    var timeout = setTimeout(function() {
      timedOut = true;
      leadSubmitting = false;
      btn.disabled = false;
      btnText.textContent = originalText;
      showLeadError('Request took too long. Please try again.');
    }, 30000);

    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(res) {
      if (timedOut) return;
      clearTimeout(timeout);
      if (!res.ok) {
        return res.text().then(function(t) { throw new Error(t || 'Server error'); });
      }
      return res.json().catch(function() { return {}; });
    }).then(function() {
      if (timedOut) return;
      leadSubmitting = false;
      btn.disabled = false;
      btnText.textContent = originalText;
      // Show success state
      $('leadModalForm').hidden = true;
      $('leadModalSuccess').hidden = false;
    }).catch(function(err) {
      if (timedOut) return;
      clearTimeout(timeout);
      console.error('Lead capture failed:', err);
      leadSubmitting = false;
      btn.disabled = false;
      btnText.textContent = originalText;
      showLeadError('Something went wrong. Please try again or email us directly.');
    });
  }

  $('leadSubmitBtn').addEventListener('click', submitLead);
  $('leadEmailInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); submitLead(); }
  });
  $('leadEmailInput').addEventListener('input', function() {
    this.classList.remove('error');
    $('leadErrorMsg').hidden = true;
  });

  // =========================================================
  // Regenerate with AI (force re-call)
  // =========================================================
  $('aiRegenBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    if (state._aiStatus === 'loading') return;
    maybeTriggerAI(true);
  });

  // =========================================================
  // Restart
  // =========================================================
  $('restartBtn').addEventListener('click', function() {
    if (confirm('Start over and clear all your inputs?')) {
      location.reload();
    }
  });

  // =========================================================
  // INIT
  // =========================================================
  updateSectionLocks();
  renderPreview();


    // Notify height once everything is wired
    setTimeout(function() { self.notifyHeight(); }, 100);
    setTimeout(function() { self.notifyHeight(); }, 600);
  }
}

if (!customElements.get('coconut-jd-generator')) {
  customElements.define('coconut-jd-generator', CoconutJDGenerator);
}
