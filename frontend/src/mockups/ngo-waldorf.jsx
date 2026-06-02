import { useState } from "react";

// ─── DESIGN TOKENS (exakt von freunde-waldorf.de) ────────────────────────────
// Primär:  #c8540a (orange-braun), #e05a00 (helles orange)
// Dunkel:  #1a1a18 (fast-schwarz)
// Akzent:  #d94f1e (rot-orange für Banner)
// Schrift: System-Fettschrift wie auf der Seite

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;900&family=Playfair+Display:wght@700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --orange: #c8540a;
    --orange-l: #e06010;
    --red: #d94f1e;
    --dark: #1a1a18;
    --text: #2d2d2b;
    --muted: #6b6560;
    --muted2: #9c9890;
    --bg: #ffffff;
    --bg2: #f8f6f3;
    --border: #e8e3dc;
    --border2: #d4cfc8;
    --sans: 'Source Sans 3', 'Arial', sans-serif;
    --serif: 'Playfair Display', Georgia, serif;
    --shadow: 0 2px 12px rgba(0,0,0,.1);
    --shadow-lg: 0 4px 24px rgba(0,0,0,.14);
  }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); }
  * { -webkit-font-smoothing: antialiased; }

  /* ── APP SHELL ── */
  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── SIDEBAR ── */
  .sb { width: 240px; min-width: 240px; background: var(--bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }

  .sb-logo { padding: 16px 20px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .logo-w { width: 44px; height: 44px; flex-shrink: 0; }
  .logo-text h1 { font-size: .85rem; font-weight: 900; color: var(--dark); line-height: 1.1; letter-spacing: -.01em; }
  .logo-text span { font-size: .65rem; color: var(--orange); font-weight: 700; letter-spacing: .02em; }

  .sb-sect { padding: 14px 16px 3px; }
  .sb-sect label { font-size: .6rem; font-weight: 700; color: var(--muted2); letter-spacing: .12em; text-transform: uppercase; }
  .ni { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: .81rem; color: var(--muted); transition: all .15s; margin: 2px 8px; font-weight: 600; }
  .ni:hover { background: var(--bg2); color: var(--dark); }
  .ni.on { background: #fff3ec; color: var(--orange); border-left: 3px solid var(--orange); padding-left: 7px; }
  .ni .ico { font-size: .9rem; width: 20px; text-align: center; flex-shrink: 0; }
  .nib { margin-left: auto; font-size: .6rem; padding: 1px 7px; border-radius: 50px; font-weight: 700; }
  .nib-r { background: #ffebe6; color: var(--red); }
  .nib-a { background: #fff3e0; color: var(--orange); }

  .sb-bottom { margin-top: auto; border-top: 1px solid var(--border); background: var(--bg2); }
  .role-box { padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .role-box label { font-size: .58rem; font-weight: 700; color: var(--muted2); letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: 5px; }
  .role-box select { background: var(--bg); border: 1.5px solid var(--border2); color: var(--dark); padding: 7px 10px; border-radius: 8px; font-family: var(--sans); font-size: .78rem; font-weight: 600; width: 100%; outline: none; cursor: pointer; }
  .ctx-box { padding: 10px 16px 14px; }
  .ctx-box label { font-size: .58rem; font-weight: 700; color: var(--muted2); letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .ctx-info { font-size: .72rem; color: var(--muted); line-height: 1.5; font-weight: 600; }
  .ctx-info strong { color: var(--dark); display: block; margin-bottom: 1px; }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* ── TOPBAR ── */
  .topbar { background: var(--bg); border-bottom: 1px solid var(--border); padding: 0 24px; height: 54px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .topbar h2 { font-size: 1rem; font-weight: 900; color: var(--dark); letter-spacing: -.01em; }
  .topbar .tsub { font-size: .62rem; color: var(--muted2); margin-top: 1px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
  .topbar-r { display: flex; gap: 8px; }

  .content { flex: 1; overflow-y: auto; background: var(--bg2); }

  /* ── BUTTONS ── */
  .btn { padding: 10px 20px; border-radius: 6px; font-family: var(--sans); font-size: .82rem; font-weight: 700; cursor: pointer; border: none; transition: all .15s; white-space: nowrap; letter-spacing: .01em; }
  .btn-sm { padding: 6px 14px; font-size: .74rem; }
  .btn-xs { padding: 4px 10px; font-size: .68rem; }
  .btn-or { background: var(--orange); color: #fff; box-shadow: 0 2px 8px rgba(200,84,10,.3); }
  .btn-or:hover { background: var(--orange-l); }
  .btn-rd { background: var(--red); color: #fff; }
  .btn-rd:hover { background: #c04018; }
  .btn-gh { background: #fff; color: var(--muted); border: 1.5px solid var(--border2); font-weight: 600; }
  .btn-gh:hover { background: var(--bg2); color: var(--dark); }
  .btn-ol { background: #fff3ec; color: var(--orange); border: 1.5px solid rgba(200,84,10,.25); font-weight: 700; }
  .btn-ol:hover { background: #ffe8d6; }
  .btn-block { width: 100%; text-align: center; }

  /* ── BADGES ── */
  .bdg { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 50px; font-size: .63rem; font-weight: 700; letter-spacing: .02em; }
  .bo { background: #fff3ec; color: var(--orange); }
  .br { background: #ffebe6; color: var(--red); }
  .bg { background: #e8f5ec; color: #2d7a45; }
  .bgs { background: #2d7a45; color: #fff; }
  .bb { background: #e8eef8; color: #2563a8; }
  .ba { background: #fff3e0; color: var(--orange); }
  .bx { background: var(--bg2); color: var(--muted); }
  .bp { background: #f3eefb; color: #6b3fa0; }

  /* ── LAYOUT ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .split-r { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
  .split-l { display: grid; grid-template-columns: 300px 1fr; gap: 16px; align-items: start; }

  /* ── HERO HEADER (Freiwilliger Startseite) ── */
  .hero { position: relative; background: #1a1a18; overflow: hidden; min-height: 200px; flex-shrink: 0; }
  .hero-img { width: 100%; height: 200px; object-fit: cover; opacity: .7; display: block; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(200,84,10,.7) 0%, rgba(26,26,24,.4) 100%); }
  .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 20px; }
  .hero-banner { display: inline-block; background: var(--orange); color: #fff; font-size: .68rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; padding: 3px 10px; margin-bottom: 4px; clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%); }
  .hero-title { font-size: 1.4rem; font-weight: 900; color: #fff; line-height: 1.1; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
  .hero-sub { font-size: .75rem; color: rgba(255,255,255,.85); margin-top: 4px; font-weight: 600; }

  /* ── SECTION HEADER (orange diagonal stripe) ── */
  .sec-head { background: var(--orange); color: #fff; padding: 10px 20px; font-size: .78rem; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; position: relative; clip-path: polygon(0 0, 100% 0, 98% 100%, 0 100%); margin-bottom: 0; }

  /* ── CARDS ── */
  .card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow); }
  .card-h { padding: 13px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg); }
  .card-h h3 { font-size: .85rem; font-weight: 900; color: var(--dark); }
  .card-h .sub { font-size: .6rem; color: var(--muted2); margin-top: 1px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .card-b { padding: 16px 18px; }
  .card-or { border-top: 3px solid var(--orange); }

  /* ── TABLE ── */
  table { width: 100%; border-collapse: collapse; }
  th { padding: 8px 16px; text-align: left; font-size: .62rem; color: var(--muted2); letter-spacing: .08em; border-bottom: 2px solid var(--border); font-weight: 700; text-transform: uppercase; background: var(--bg2); }
  td { padding: 11px 16px; font-size: .8rem; border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--text); }
  tr:last-child td { border-bottom: none; }
  tr.cl:hover td { background: #fff8f5; cursor: pointer; }
  tr.sel td { background: #fff3ec; }

  /* ── STAT CARDS ── */
  .sc { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; box-shadow: var(--shadow); }
  .sc .sl { font-size: .6rem; font-weight: 700; color: var(--muted2); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 8px; }
  .sc .sv { font-size: 1.8rem; font-weight: 900; color: var(--dark); line-height: 1; }
  .sc .sd { font-size: .7rem; color: var(--muted); margin-top: 5px; font-weight: 600; }
  .sc-or { border-top: 3px solid var(--orange); }

  /* ── ALERTS ── */
  .al { border-radius: 8px; padding: 11px 14px; display: flex; align-items: flex-start; gap: 10px; font-size: .78rem; margin-bottom: 12px; font-weight: 600; }
  .al-or { background: #fff3ec; border: 1.5px solid rgba(200,84,10,.25); color: var(--orange); }
  .al-g { background: #e8f5ec; border: 1.5px solid rgba(45,122,69,.2); color: #2d7a45; }
  .al-b { background: #e8eef8; border: 1.5px solid rgba(37,99,168,.2); color: #2563a8; }
  .al-r { background: #ffebe6; border: 1.5px solid rgba(217,79,30,.2); color: var(--red); }
  .al i { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
  .al span { line-height: 1.45; }

  /* ── STEPPER ── */
  .stepper { display: flex; align-items: center; padding: 14px 20px; background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; overflow-x: auto; }
  .step { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .sdot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 900; flex-shrink: 0; }
  .sdot-done { background: var(--orange); color: #fff; }
  .sdot-act { background: var(--red); color: #fff; box-shadow: 0 0 0 4px rgba(217,79,30,.15); }
  .sdot-pen { background: var(--bg2); color: var(--muted2); border: 2px solid var(--border2); }
  .slabel { font-size: .7rem; font-weight: 700; }
  .slabel-done { color: var(--orange); }
  .slabel-act { color: var(--red); }
  .slabel-pen { color: var(--muted2); }
  .sline { flex: 1; height: 2px; background: var(--border); margin: 0 8px; min-width: 20px; border-radius: 2px; }
  .sline-done { background: var(--orange); }

  /* ── DOC ITEMS ── */
  .di { background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; transition: all .15s; }
  .di:hover { border-color: var(--orange); }
  .di.on { border-color: var(--orange); background: #fff8f5; }
  .di .dico { font-size: 1.3rem; flex-shrink: 0; }
  .di .dinfo { flex: 1; min-width: 0; }
  .di .dinfo h4 { font-size: .8rem; font-weight: 700; margin-bottom: 2px; color: var(--dark); }
  .di .dinfo p { font-size: .7rem; color: var(--muted); line-height: 1.4; }
  .di .dinfo .dmeta { font-size: .62rem; color: var(--muted2); margin-top: 3px; font-weight: 600; }
  .di .dact { display: flex; gap: 6px; flex-shrink: 0; }

  /* ── UPLOAD ZONE ── */
  .uz { border: 2px dashed var(--border2); border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all .15s; background: var(--bg); }
  .uz:hover { border-color: var(--orange); background: #fff8f5; }
  .uz .uico { font-size: 1.8rem; margin-bottom: 6px; }
  .uz p { font-size: .76rem; color: var(--muted); font-weight: 600; }
  .uz span { font-size: .68rem; color: var(--orange); display: block; margin-top: 3px; font-weight: 700; }

  /* ── STELLEN POOL CARD ── */
  .pc { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 16px; cursor: pointer; transition: all .15s; position: relative; box-shadow: var(--shadow); }
  .pc:hover { border-color: var(--orange); box-shadow: 0 4px 16px rgba(200,84,10,.12); transform: translateY(-1px); }
  .pc.sel1 { border-color: var(--orange); background: #fff8f5; box-shadow: 0 4px 16px rgba(200,84,10,.15); }
  .pc.sel2 { border-color: var(--red); background: #fff5f3; }
  .pc.dis { opacity: .4; cursor: not-allowed; }
  .pc h4 { font-size: .85rem; font-weight: 900; margin-bottom: 3px; color: var(--dark); }
  .pc .psub { font-size: .71rem; color: var(--muted); margin-bottom: 9px; font-weight: 600; }
  .mbar-bg { height: 5px; background: var(--bg2); border-radius: 3px; margin-top: 8px; }
  .mbar-fill { height: 100%; border-radius: 3px; transition: width .5s ease; }
  .ptag { font-size: .62rem; padding: 2px 8px; border-radius: 50px; margin: 2px; display: inline-block; font-weight: 700; }
  .ptag-or { background: #fff3ec; color: var(--orange); }
  .ptag-b { background: #e8eef8; color: #2563a8; }
  .ptag-g { background: #e8f5ec; color: #2d7a45; }

  /* ── FILTER TAGS ── */
  .tag { font-size: .73rem; padding: 5px 14px; border-radius: 50px; cursor: pointer; border: 1.5px solid var(--border2); color: var(--muted); transition: all .15s; display: inline-block; margin: 3px; font-weight: 700; }
  .tag.on { background: var(--orange); border-color: var(--orange); color: #fff; }

  /* ── FORM ── */
  .ff { margin-bottom: 14px; }
  .ff label { font-size: .71rem; font-weight: 700; display: block; margin-bottom: 5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .fi { background: var(--bg2); border: 1.5px solid var(--border2); border-radius: 8px; padding: 10px 12px; width: 100%; font-size: .8rem; color: var(--muted); font-family: var(--sans); font-weight: 600; }
  .fta { background: var(--bg2); border: 1.5px solid var(--border2); border-radius: 8px; padding: 10px 12px; width: 100%; font-size: .8rem; color: var(--dark); font-family: var(--sans); resize: vertical; min-height: 80px; outline: none; }
  .fta:focus { border-color: var(--orange); }
  .fsel { background: var(--bg2); border: 1.5px solid var(--border2); border-radius: 8px; padding: 10px 12px; width: 100%; font-size: .8rem; color: var(--dark); font-family: var(--sans); outline: none; font-weight: 600; }

  /* ── SECTION LABEL ── */
  .slbl { font-size: .6rem; font-weight: 700; color: var(--muted2); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 10px; margin-top: 18px; padding-bottom: 6px; border-bottom: 2px solid var(--border); }
  .slbl:first-child { margin-top: 0; }

  /* ── TIMELINE ── */
  .tl { display: flex; flex-direction: column; }
  .tl-item { display: flex; gap: 10px; }
  .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .tl-or { background: var(--orange); }
  .tl-rd { background: var(--red); }
  .tl-x { background: var(--border2); }
  .tl-body { padding-bottom: 14px; }
  .tl-body h4 { font-size: .78rem; font-weight: 700; margin-bottom: 2px; }
  .tl-body p { font-size: .7rem; color: var(--muted); }
  .tl-conn { width: 2px; min-height: 10px; margin: 2px 4px; border-radius: 2px; }
  .tl-conn-or { background: rgba(200,84,10,.3); }
  .tl-conn-x { background: var(--border); }

  /* ── FEED ── */
  .feed { display: flex; flex-direction: column; }
  .fi2 { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .fi2:last-child { border-bottom: none; }
  .fdot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .fd-or { background: var(--orange); }
  .fd-rd { background: var(--red); }
  .fd-g { background: #2d7a45; }
  .fd-b { background: #2563a8; }
  .fd-x { background: var(--muted2); }
  .fb .ft { font-size: .78rem; font-weight: 700; margin-bottom: 2px; color: var(--dark); }
  .fb .fs { font-size: .7rem; color: var(--muted); line-height: 1.4; }
  .fb .fm { font-size: .61rem; color: var(--muted2); margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }

  /* ── COMMENT ── */
  .cmt { background: var(--bg2); border: 1.5px solid var(--border); border-radius: 8px; padding: 11px 14px; margin-bottom: 9px; }
  .cmt .cf { font-size: .7rem; font-weight: 700; margin-bottom: 3px; display: flex; align-items: center; gap: 7px; }
  .cmt .ct2 { font-size: .76rem; color: var(--muted); line-height: 1.5; }
  .cmt .ctime { font-size: .62rem; color: var(--muted2); margin-top: 5px; font-weight: 700; text-transform: uppercase; }

  /* ── MODAL ── */
  .mbg { position: fixed; inset: 0; background: rgba(26,26,24,.55); backdrop-filter: blur(3px); z-index: 300; display: flex; align-items: center; justify-content: center; }
  .modal { background: var(--bg); border-radius: 14px; width: 460px; max-width: 95vw; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,.18); }
  .mh { padding: 16px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .mh h3 { font-size: .9rem; font-weight: 900; }
  .mc { background: none; border: none; color: var(--muted); font-size: 1.2rem; cursor: pointer; }
  .mb { padding: 20px 22px; }
  .mf { padding: 12px 22px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; background: var(--bg2); }

  /* ── FLOW ── */
  .flow-item { display: flex; gap: 14px; }
  .fl-left { display: flex; flex-direction: column; align-items: center; }
  .fl-dot { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 900; flex-shrink: 0; }
  .fl-done { background: var(--orange); color: #fff; }
  .fl-act { background: var(--red); color: #fff; animation: pulse 2s infinite; }
  .fl-pen { background: var(--bg2); color: var(--muted2); border: 2px solid var(--border2); }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(217,79,30,.3)}50%{box-shadow:0 0 0 6px rgba(217,79,30,0)} }
  .fl-line { width: 2px; flex: 1; min-height: 14px; margin: 2px 0; border-radius: 2px; }
  .fl-line-done { background: rgba(200,84,10,.4); }
  .fl-line-pen { background: var(--border); }
  .fl-body { flex: 1; background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 11px 14px; margin-bottom: 9px; box-shadow: var(--shadow); }
  .fl-body h4 { font-size: .81rem; font-weight: 900; margin-bottom: 3px; color: var(--dark); }
  .fl-body p { font-size: .72rem; color: var(--muted); line-height: 1.5; }

  /* ── OVERRIDE BAR ── */
  .override-bar { background: #fff3ec; border: 1.5px solid rgba(200,84,10,.25); border-radius: 8px; padding: 9px 13px; display: flex; align-items: center; gap: 9px; font-size: .74rem; margin-bottom: 10px; color: var(--orange); font-weight: 600; }

  /* ── CANDIDATE CARD ── */
  .cc { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px; cursor: pointer; transition: all .15s; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .cc:hover { border-color: var(--orange); box-shadow: 0 3px 10px rgba(200,84,10,.1); transform: translateY(-1px); }
  .cc.on { border-color: var(--orange); background: #fff8f5; box-shadow: 0 3px 10px rgba(200,84,10,.12); }
  .cc h4 { font-size: .83rem; font-weight: 900; margin-bottom: 2px; color: var(--dark); }
  .cc .csub { font-size: .7rem; color: var(--muted); margin-bottom: 8px; font-weight: 600; }
  .ctags { display: flex; gap: 5px; flex-wrap: wrap; }
  .ct { font-size: .62rem; padding: 2px 8px; border-radius: 50px; font-weight: 700; }
  .ct-or { background: #fff3ec; color: var(--orange); }
  .ct-b { background: #e8eef8; color: #2563a8; }
  .ct-g { background: #e8f5ec; color: #2d7a45; }

  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  .fi3 { animation: fadeIn .22s ease; }
  .empty { text-align: center; padding: 36px; color: var(--muted2); font-size: .82rem; font-weight: 600; }
  hr { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
  .pr { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-size: .75rem; line-height: 1.8; color: var(--muted); white-space: pre-wrap; min-height: 140px; }
  .pr strong { color: var(--dark); display: block; margin-bottom: 8px; font-size: .82rem; font-weight: 900; }
  .pad { padding: 20px; }
  .pad-sm { padding: 14px; }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────

const ROLES = {
  koordinator: { label: "NGO Koordinator", ctx: "NGO ZENTRALE · ALLE PROGRAMME" },
  einsatzstelle: { label: "Einsatzstelle (Accra)", ctx: "SCHULE ACCRA NORD · KWAME ASANTE" },
  freiwilliger: { label: "Freiwillige/r (Mia Stern)", ctx: "MIA STERN · BEWERBUNG 2026" },
};

const STELLE_POOL = [
  { id:1, name:"Naturschutz Oaxaca", land:"🇲🇽 Mexiko", prog:"Umwelt MX 2026", spr:["Spanisch B2"], fok:["Umwelt","Naturschutz"], dur:"6 Monate", frei:1 },
  { id:2, name:"Schule Accra Nord", land:"🇬🇭 Ghana", prog:"Bildung GH 2026", spr:["Englisch B2"], fok:["Bildung"], dur:"12 Monate", frei:2 },
  { id:3, name:"Klinik Lima Sur", land:"🇵🇪 Peru", prog:"Gesundheit PE 2026", spr:["Spanisch B1"], fok:["Gesundheit"], dur:"6 Monate", frei:1 },
  { id:4, name:"Bildung Kampala", land:"🇺🇬 Uganda", prog:"Bildung UG 2026", spr:["Englisch C1"], fok:["Bildung","Soziales"], dur:"12 Monate", frei:3 },
  { id:5, name:"Regenwald Chiapas", land:"🇲🇽 Mexiko", prog:"Umwelt MX 2026", spr:["Spanisch B1"], fok:["Umwelt"], dur:"3 Monate", frei:0 },
  { id:6, name:"Soziales Nairobi", land:"🇰🇪 Kenia", prog:"Sozial KE 2026", spr:["Englisch B2"], fok:["Soziales"], dur:"6 Monate", frei:2 },
];

function matchScore(cand, stelle) {
  let s = 0;
  if (stelle.spr.some(sl => cand.sprachen.some(cl => cl.startsWith(sl.split(" ")[0])))) s += 50;
  if (stelle.fok.some(f => cand.interessen.includes(f))) s += 35;
  if (cand.dauer === stelle.dur) s += 15;
  return s;
}

const initCandidates = [
  { id:1, name:"Anna Müller", email:"anna@mail.de", alter:23, sprachen:["Spanisch B2","Englisch C1"], interessen:["Umwelt","Naturschutz"], verfügbar:"März 2026", dauer:"6 Monate", phase:"aktiv", stelle:"Naturschutz Oaxaca", programm:"Umwelt MX 2026", land:"Mexiko", seit:"März 2026", bewStatus:"aktiv", matchScore:100, kommentare:[], docs:{ frei:[{id:"cv",name:"Lebenslauf",status:"freigegeben",up:"10.02.2026",content:"Anna Müller · Lebenslauf\n\nBildung: B.Sc. Biologie 2023\nErfahrung: BUND Praktikum 2022\nSprachen: Spanisch B2, Englisch C1"},{id:"ml",name:"Motivationsschreiben",status:"freigegeben",up:"10.02.2026",content:"Sehr geehrte Damen und Herren,\n\nDie Arbeit im Naturschutz ist meine Leidenschaft..."}], es:[], anf:[] }},
  { id:2, name:"Tom Becker", email:"tom@mail.de", alter:26, sprachen:["Englisch C1"], interessen:["Bildung"], verfügbar:"Mai 2026", dauer:"12 Monate", phase:"platziert", stelle:"Schule Accra Nord", programm:"Bildung GH 2026", land:"Ghana", seit:"Mai 2026", bewStatus:"empfohlen", matchScore:95, kommentare:[{von:"Einsatzstelle",text:"Sehr gute Unterlagen, Sprachkenntnisse top. Empfehle Aufnahme.",zeit:"gestern 14:20",type:"empfehlung"}], docs:{ frei:[{id:"cv",name:"Lebenslauf",status:"freigegeben",up:"20.05.2026",content:"Tom Becker · Lebenslauf\n\nBildung: Lehramt Grundschule 2020\nSprachen: Englisch C1"},{id:"ml",name:"Motivationsschreiben",status:"freigegeben",up:"20.05.2026",content:"Bildung ist meine Leidenschaft..."}], es:[{id:"eb",name:"Einsatzbeschreibung",status:"hochgeladen",up:"22.05.2026",esFreigabe:true}], anf:[] }},
  { id:3, name:"Mia Stern", email:"mia@mail.de", alter:24, sprachen:["Englisch B2"], interessen:["Bildung"], verfügbar:"Juli 2026", dauer:"12 Monate", phase:"dokumente", stelle:"Schule Accra Nord", programm:"Bildung GH 2026", land:"Ghana", seit:null, bewStatus:"beworben", matchScore:88, kommentare:[], docs:{ frei:[{id:"cv",name:"Lebenslauf",status:"hochgeladen",up:"30.05.2026",content:"Mia Stern · Lebenslauf\n\nBildung: B.A. Erziehungswissenschaften 2022\nErfahrung: Praktikum Schule 2021\nSprachen: Englisch B2"},{id:"ml",name:"Motivationsschreiben",status:"hochgeladen",up:"30.05.2026",content:"Sehr geehrte Damen und Herren,\n\nIch bewerbe mich motiviert für die Stelle in Accra, weil..."}], es:[], anf:[] }},
  { id:4, name:"Felix Horn", email:"felix@mail.de", alter:22, sprachen:["Spanisch C1"], interessen:["Umwelt"], verfügbar:"Sept 2026", dauer:"6 Monate", phase:"pool", stelle:"Schule Accra Nord", programm:"Bildung GH 2026", land:null, seit:null, bewStatus:"qualifiziert", matchScore:61, kommentare:[], docs:{ frei:[{id:"cv",name:"Lebenslauf",status:"ausstehend",up:null,content:null},{id:"ml",name:"Motivationsschreiben",status:"ausstehend",up:null,content:null}], es:[], anf:[] }},
  { id:5, name:"Max Klein", email:"max@mail.de", alter:23, sprachen:["Spanisch B2"], interessen:["Umwelt"], verfügbar:"Juli 2026", dauer:"6 Monate", phase:"bewerbung", stelle:null, programm:null, land:null, seit:null, bewStatus:"neu", matchScore:null, kommentare:[], docs:{ frei:[], es:[], anf:[] }},
];

const initFeed = [
  {id:1,text:"Mia Sterns Dokumente hochgeladen",sub:"Lebenslauf + Motivationsschreiben · Prüfung ausstehend",time:"heute 10:05",dot:"fd-or",aktor:"Freiwillige/r"},
  {id:2,text:"Einsatzstelle empfiehlt Tom Becker",sub:"\"Sehr gute Unterlagen, Sprachkenntnisse top\"",time:"gestern 14:20",dot:"fd-b",aktor:"Einsatzstelle"},
  {id:3,text:"Einsatzbeschreibung für Tom Becker hochgeladen",sub:"Von Einsatzstelle — freigegeben",time:"gestern 11:30",dot:"fd-b",aktor:"Einsatzstelle"},
  {id:4,text:"Tom Beckers Lebenslauf freigegeben",sub:"",time:"25.05.2026",dot:"fd-g",aktor:"Verwaltung"},
  {id:5,text:"Felix Horn in Stellen-Pool freigegeben",sub:"Kann sich auf bis zu 2 Stellen bewerben",time:"20.05.2026",dot:"fd-g",aktor:"Verwaltung"},
];

// ─── WALDORF LOGO SVG ─────────────────────────────────────────────────────────
function WaldorfLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="38" rx="14" ry="20" fill="#c8540a" transform="rotate(-15 28 38)" />
      <ellipse cx="50" cy="32" rx="14" ry="22" fill="#d94f1e" />
      <ellipse cx="72" cy="38" rx="14" ry="20" fill="#e8a020" transform="rotate(15 72 38)" />
      <ellipse cx="28" cy="70" rx="10" ry="12" fill="#c8540a" opacity=".7" transform="rotate(-10 28 70)" />
      <ellipse cx="50" cy="74" rx="10" ry="14" fill="#d94f1e" opacity=".8" />
      <ellipse cx="72" cy="70" rx="10" ry="12" fill="#e8a020" opacity=".7" transform="rotate(10 72 70)" />
    </svg>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState("freiwilliger");
  const [view, setView] = useState("meine-bewerbung");
  const [candidates, setCandidates] = useState(initCandidates);
  const [feed, setFeed] = useState(initFeed);
  const [selId, setSelId] = useState(null);
  const [modal, setModal] = useState(null);

  const sel = candidates.find(c => c.id === selId);

  function addFeed(entry) { setFeed(f => [{ id: Date.now(), ...entry }, ...f]); }
  function updateC(id, fn) { setCandidates(cs => cs.map(c => c.id === id ? fn(c) : c)); }

  const navDefs = {
    koordinator: [
      { id:"dashboard",   ico:"◈", label:"Dashboard" },
      { id:"prozess",     ico:"⟳", label:"Prozessfluss" },
      { id:"freiwillige", ico:"◉", label:"Freiwillige", badge: candidates.filter(c=>c.phase==="bewerbung").length, bt:"nib-r" },
      { id:"bewerbung",   ico:"◈", label:"Bewerbungsprozess" },
      { id:"stellenpool", ico:"◎", label:"Stellen-Pool" },
      { id:"dokumente",   ico:"◻", label:"Dokument-Review", badge: candidates.flatMap(c=>[...c.docs.frei,...c.docs.es]).filter(d=>d.status==="hochgeladen").length, bt:"nib-a" },
      { id:"monitoring",  ico:"◉", label:"Monitoring Feed" },
      { id:"kommunikation",ico:"💬",label:"Kommunikation" },
    ],
    einsatzstelle: [
      { id:"bewerber",    ico:"◈", label:"Meine Bewerber" },
      { id:"es-dokumente",ico:"◻", label:"Dokumente" },
      { id:"kommunikation",ico:"💬",label:"Kommunikation" },
    ],
    freiwilliger: [
      { id:"meine-bewerbung", ico:"🏠", label:"Meine Bewerbung" },
      { id:"stellen",          ico:"🌍", label:"Einsatzstellen" },
      { id:"dokumente-fw",     ico:"📎", label:"Meine Dokumente" },
      { id:"kommunikation",    ico:"💬", label:"Nachrichten" },
    ],
  };

  function switchRole(r) {
    setRole(r);
    setSelId(null);
    const firstView = { koordinator:"dashboard", einsatzstelle:"bewerber", freiwilliger:"meine-bewerbung" };
    setView(firstView[r]);
  }

  const navItems = navDefs[role] || [];
  const mia = candidates.find(c => c.id === 3);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-logo">
            <WaldorfLogo size={42} />
            <div className="logo-text">
              <h1>Freunde Waldorf</h1>
              <span>Freiwilligendienste</span>
            </div>
          </div>
          <div className="sb-sect"><label>Navigation</label></div>
          {navItems.map(n => (
            <div key={n.id} className={`ni ${view===n.id?"on":""}`} onClick={()=>{setView(n.id);setSelId(null);}}>
              <span className="ico">{n.ico}</span>
              {n.label}
              {n.badge>0 && <span className={`nib ${n.bt}`}>{n.badge}</span>}
            </div>
          ))}
          <div className="sb-bottom">
            <div className="role-box">
              <label>Ansicht als</label>
              <select value={role} onChange={e=>switchRole(e.target.value)}>
                <option value="freiwilliger">Freiwillige/r (Mia Stern)</option>
                <option value="koordinator">NGO Koordinator</option>
                <option value="einsatzstelle">Einsatzstelle (Accra)</option>
              </select>
            </div>
            <div className="ctx-box">
              <label>Kontext</label>
              <div className="ctx-info">
                <strong>{ROLES[role].label}</strong>
                {ROLES[role].ctx}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <Topbar view={view} role={role} sel={sel} setModal={setModal} />
          <div className="content">
            {role==="freiwilliger" && <>
              {view==="meine-bewerbung" && <MeineBewerbungView candidate={mia} updateC={updateC} addFeed={addFeed} />}
              {view==="stellen"         && <StellenView candidate={mia} updateC={updateC} addFeed={addFeed} />}
              {view==="dokumente-fw"    && <DokumenteFWView candidate={mia} updateC={updateC} addFeed={addFeed} />}
              {view==="kommunikation"   && <KommunikationFWView />}
            </>}
            {role==="koordinator" && <>
              {view==="dashboard"    && <DashboardView candidates={candidates} feed={feed} setView={setView} setModal={setModal} />}
              {view==="prozess"      && <ProzessView />}
              {view==="freiwillige"  && <FreiwilligeView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
              {view==="bewerbung"    && <BewerbungView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
              {view==="stellenpool"  && <StellenPoolView />}
              {view==="dokumente"    && <DokumentReviewView candidates={candidates} updateC={updateC} addFeed={addFeed} />}
              {view==="monitoring"   && <MonitoringView candidates={candidates} feed={feed} updateC={updateC} addFeed={addFeed} />}
              {view==="kommunikation"&& <KommunikationView />}
            </>}
            {role==="einsatzstelle" && <>
              {view==="bewerber"     && <BewerberView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
              {view==="es-dokumente" && <EsDokumenteView candidates={candidates} updateC={updateC} addFeed={addFeed} />}
              {view==="kommunikation"&& <KommunikationView />}
            </>}
          </div>
        </div>

        {modal?.type==="kommentar" && <KommentarModal c={candidates.find(x=>x.id===modal.cid)} role={role} onSubmit={(t,ty)=>{const k={von:role==="einsatzstelle"?"Einsatzstelle":"Verwaltung",text:t,zeit:"gerade",type:ty};updateC(modal.cid,c=>({...c,kommentare:[k,...c.kommentare],bewStatus:ty==="empfehlung"?"empfohlen":ty==="bedenken"?"bedenken":c.bewStatus}));addFeed({text:`${k.von}: ${ty} für ${candidates.find(x=>x.id===modal.cid)?.name}`,sub:`"${t.slice(0,55)}..."`,time:"gerade",dot:"fd-b",aktor:k.von});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="anforderung" && <AnforderungModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(name,mode)=>{const a={id:`anf_${Date.now()}`,name,mode,status:mode==="direkt"?"angefordert":"wartet",am:"gerade"};updateC(modal.cid,c=>({...c,docs:{...c.docs,anf:[...c.docs.anf,a]}}));addFeed({text:`Einsatzstelle fordert "${name}" von ${candidates.find(x=>x.id===modal.cid)?.name}`,sub:mode==="direkt"?"Direkt · n8n sendet Mail":"Wartet auf Verwaltungsfreigabe",time:"gerade",dot:mode==="direkt"?"fd-or":"fd-b",aktor:"Einsatzstelle"});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="uploadEs"  && <UploadEsModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(name)=>{const d={id:`es_${Date.now()}`,name,status:"hochgeladen",up:"heute",esFreigabe:false};updateC(modal.cid,c=>({...c,docs:{...c.docs,es:[...c.docs.es,d]}}));addFeed({text:`Einsatzstelle lädt "${name}" hoch`,sub:`Für ${candidates.find(x=>x.id===modal.cid)?.name}`,time:"gerade",dot:"fd-b",aktor:"Einsatzstelle"});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="override"  && <OverrideModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(s)=>{updateC(modal.cid,c=>({...c,bewStatus:s}));addFeed({text:`Verwaltung setzt Status: ${candidates.find(x=>x.id===modal.cid)?.name} → "${s}"`,sub:"",time:"gerade",dot:"fd-or",aktor:"Verwaltung"});setModal(null);}} onClose={()=>setModal(null)} />}
      </div>
    </>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────────────
const VIEW_TITLES = { "meine-bewerbung":"Meine Bewerbung", stellen:"Freie Einsatzstellen", "dokumente-fw":"Meine Dokumente", kommunikation:"Nachrichten", dashboard:"Dashboard", prozess:"Prozessfluss", freiwillige:"Freiwillige", bewerbung:"Bewerbungsprozess", stellenpool:"Stellen-Pool", dokumente:"Dokument-Review", monitoring:"Monitoring", bewerber:"Meine Bewerber", "es-dokumente":"Dokumente" };

function Topbar({ view, role, sel, setModal }) {
  return (
    <div className="topbar">
      <div>
        <h2>{VIEW_TITLES[view] || view}</h2>
        <div className="tsub">{ROLES[role].ctx}</div>
      </div>
      <div className="topbar-r">
        {role==="einsatzstelle" && view==="bewerber" && sel && (<>
          <button className="btn btn-ol btn-sm" onClick={()=>setModal({type:"anforderung",cid:sel.id})}>+ Dok. anfordern</button>
          <button className="btn btn-ol btn-sm" onClick={()=>setModal({type:"uploadEs",cid:sel.id})}>↑ Hochladen</button>
          <button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"kommentar",cid:sel.id})}>✎ Kommentar</button>
        </>)}
        {role==="koordinator" && sel && (
          <button className="btn btn-ol btn-sm" onClick={()=>setModal({type:"override",cid:sel.id})}>⚡ Status</button>
        )}
      </div>
    </div>
  );
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function SBadge({ s }) {
  const m = { neu:"bb",qualifiziert:"bb",beworben:"ba",empfohlen:"bg",bedenken:"ba",angenommen:"bgs",platziert:"bgs",aktiv:"bgs",abgelehnt:"br",abgeschlossen:"bx",wartend:"bx" };
  return <span className={`bdg ${m[s]||"bx"}`}>{s}</span>;
}
function DocBadge({ s }) {
  const m = { hochgeladen:"ba",freigegeben:"bg",ausstehend:"bx",abgelehnt:"br",angefordert:"bo",wartet:"bp",blockiert:"br" };
  return <span className={`bdg ${m[s]||"bx"}`}>{s}</span>;
}

// ─── FREIWILLIGER: MEINE BEWERBUNG ────────────────────────────────────────────
function MeineBewerbungView({ candidate: c, updateC, addFeed }) {
  const phase = c?.phase || "bewerbung";
  const phaseIdx = { bewerbung:0, pool:1, dokumente:2, platziert:3, aktiv:3 }[phase] ?? 0;
  const stepLabels = ["Bewerbung", "Stellenwahl", "Dokumente", "Platziert"];

  const heroImg = "https://www.freunde-waldorf.de/fileadmin/_processed_/2/c/csm_fsj_schule_freiwillger_im_Morgenkreis_ebb8fbaec2.jpg";

  return (
    <div className="fi3">
      {/* HERO */}
      <div className="hero">
        <img src={heroImg} alt="Freiwilligendienst" className="hero-img" onError={e=>e.target.style.display="none"} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-banner">Dein Freiwilligendienst</div>
          <div className="hero-title">Hallo, Mia! 👋</div>
          <div className="hero-sub">Schule Accra Nord · Ghana · 12 Monate</div>
        </div>
      </div>

      {/* STEPPER */}
      <div className="stepper">
        {stepLabels.map((label, i) => (
          <div key={i} className="step" style={{ flex: i < stepLabels.length - 1 ? 1 : 0 }}>
            <div className={`sdot ${i < phaseIdx ? "sdot-done" : i === phaseIdx ? "sdot-act" : "sdot-pen"}`}>
              {i < phaseIdx ? "✓" : i + 1}
            </div>
            <div className={`slabel ${i < phaseIdx ? "slabel-done" : i === phaseIdx ? "slabel-act" : "slabel-pen"}`}>{label}</div>
            {i < stepLabels.length - 1 && <div className={`sline ${i < phaseIdx ? "sline-done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="pad">
        {/* ALERT */}
        {phase === "dokumente" && (
          <div className="al al-or">
            <i>📎</i>
            <span>Du wurdest vorläufig vorgemerkt! Bitte lade jetzt deine Unterlagen hoch, um deinen Platz zu sichern.</span>
          </div>
        )}
        {phase === "aktiv" && (
          <div className="al al-g">
            <i>🎉</i>
            <span>Dein Einsatz läuft! Herzlichen Glückwunsch — du machst einen tollen Job in Accra.</span>
          </div>
        )}

        <div className="g2" style={{ gap: 14 }}>
          {/* STATUS CARD */}
          <div className="card card-or">
            <div className="card-h"><h3>Dein Status</h3><SBadge s={c?.bewStatus || "neu"} /></div>
            <div className="card-b">
              {[["Einsatzstelle", c?.stelle || "Noch nicht gewählt"],["Programm", c?.programm || "—"],["Land", c?.land ? `🌍 ${c.land}` : "—"],["Verfügbar ab", c?.verfügbar],["Einsatzdauer", c?.dauer]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:".78rem"}}>
                  <span style={{color:"var(--muted)",fontWeight:600}}>{k}</span>
                  <span style={{fontWeight:700,color:"var(--dark)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AUFGABEN */}
          <div className="card">
            <div className="card-h"><h3>Offene Aufgaben</h3></div>
            <div className="card-b">
              {phase === "bewerbung" && (
                <>
                  <div className="al al-or"><i>📝</i><span>Deine Grundbewerbung ist noch nicht abgeschlossen.</span></div>
                  <button className="btn btn-or btn-block" onClick={()=>updateC(c.id,x=>({...x,phase:"pool",bewStatus:"qualifiziert"}))}>Bewerbung einreichen →</button>
                </>
              )}
              {phase === "pool" && (
                <div className="al al-b"><i>🌍</i><span>Du kannst jetzt Einsatzstellen auswählen! Gehe zu „Einsatzstellen".</span></div>
              )}
              {phase === "dokumente" && (
                <>
                  {c?.docs?.frei?.map(d => (
                    <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                      <span style={{fontSize:".78rem",fontWeight:600}}>{d.id === "cv" ? "📄" : "✉️"} {d.name}</span>
                      <DocBadge s={d.status} />
                    </div>
                  ))}
                  <button className="btn btn-or btn-block" style={{marginTop:12}} onClick={()=>setView?.("dokumente-fw")}>
                    Dokumente hochladen →
                  </button>
                </>
              )}
              {(phase === "platziert" || phase === "aktiv") && (
                <div>
                  {[["Gesundheitsfragebogen","ausstehend"],["Notfallkontakt","ausstehend"],["Bewerbungsformular","freigegeben"],["Lebenslauf","freigegeben"]].map(([name, s]) => (
                    <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                      <span style={{fontSize:".78rem",fontWeight:600}}>{name}</span>
                      <DocBadge s={s} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROZESS TIMELINE */}
        <div style={{marginTop:20}}>
          <div className="sec-head">Dein Weg zum Einsatz</div>
          <div className="card" style={{borderRadius:"0 0 10px 10px",borderTop:"none"}}>
            <div className="card-b">
              <div className="tl">
                {[
                  ["Bewerbung eingereicht","Grundbewerbung mit deinen Kriterien",["bewerbung","pool","dokumente","platziert","aktiv"].includes(phase)?"tl-or":"tl-x"],
                  ["Freigegeben für Stellen-Pool","Du kannst dich auf Einsatzstellen bewerben",["pool","dokumente","platziert","aktiv"].includes(phase)?"tl-or":"tl-x"],
                  ["Stellenbewerbung abgeschickt","Bewerbung auf bis zu 2 Einsatzstellen",["dokumente","platziert","aktiv"].includes(phase)?"tl-or":"tl-x"],
                  ["Dokumente hochgeladen","Lebenslauf & Motivationsschreiben eingereicht",["platziert","aktiv"].includes(phase)?"tl-or":phase==="dokumente"?"tl-rd":"tl-x"],
                  ["Platzierung bestätigt","Einsatzstelle und Verwaltung haben zugestimmt",["aktiv"].includes(phase)?"tl-or":"tl-x"],
                ].map(([title, sub, dotClass], i, arr) => (
                  <div key={i} className="tl-item">
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <div className={`tl-dot ${dotClass}`}/>
                      {i < arr.length - 1 && <div className={`tl-conn ${dotClass!=="tl-x"?"tl-conn-or":"tl-conn-x"}`} style={{height:22}}/>}
                    </div>
                    <div className="tl-body">
                      <h4 style={{color:dotClass==="tl-or"?"var(--orange)":dotClass==="tl-rd"?"var(--red)":"var(--muted2)"}}>{title}</h4>
                      <p>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FREIWILLIGER: STELLEN ────────────────────────────────────────────────────
function StellenView({ candidate: c, updateC, addFeed }) {
  const [sel1, setSel1] = useState(c?.stelle || null);
  const [sel2, setSel2] = useState(null);
  const [fFok, setFFok] = useState(null);
  const phase = c?.phase || "bewerbung";
  const scores = STELLE_POOL.map(s => ({ ...s, score: matchScore(c || { sprachen:[], interessen:[], dauer:"" }, s) })).sort((a,b)=>b.score-a.score);
  const foks = [...new Set(STELLE_POOL.flatMap(s=>s.fok))];
  const list = fFok ? scores.filter(s=>s.fok.includes(fFok)) : scores;
  const sc = (s) => s>=80?"#2d7a45":s>=50?"var(--orange)":"var(--red)";

  function bewerben() {
    const stellen = [sel1, sel2].filter(Boolean);
    updateC(c.id, x => ({ ...x, phase:"dokumente", bewStatus:"beworben", stelle: sel1 }));
    addFeed({ text:`${c.name} bewirbt sich`, sub: stellen.join(", "), time:"gerade", dot:"fd-or", aktor:"Freiwillige/r" });
  }

  if (phase === "bewerbung") {
    return (
      <div className="pad fi3">
        <div className="al al-or"><i>⏳</i><span>Du musst zuerst deine Grundbewerbung einreichen, bevor du Einsatzstellen sehen kannst.</span></div>
      </div>
    );
  }

  return (
    <div className="fi3">
      <div className="hero" style={{minHeight:120}}>
        <img src="https://www.freunde-waldorf.de/fileadmin/redakteure/bilder/Entwuerfe/Freiwillige_ausflug.png" alt="" className="hero-img" style={{height:120}} onError={e=>e.target.style.display="none"} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-banner">Freie Einsatzstellen</div>
          <div className="hero-title" style={{fontSize:"1.1rem"}}>Wähle bis zu 2 Stellen aus</div>
        </div>
      </div>

      <div className="pad">
        {(sel1 || sel2) && (
          <div className="al al-or" style={{marginBottom:12}}>
            <i>✓</i>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,marginBottom:2}}>Deine Auswahl:</div>
              {sel1 && <div>① {sel1}</div>}
              {sel2 && <div>② {sel2}</div>}
            </div>
            {sel1 && <button className="btn btn-or btn-sm" onClick={bewerben}>Bewerbung absenden →</button>}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <span className={`tag ${!fFok?"on":""}`} onClick={()=>setFFok(null)}>Alle Bereiche</span>
          {foks.map(f=><span key={f} className={`tag ${fFok===f?"on":""}`} onClick={()=>setFFok(fFok===f?null:f)}>{f}</span>)}
        </div>

        <div className="g2" style={{gap:12}}>
          {list.map(s => {
            const iS1 = sel1===s.name, iS2 = sel2===s.name, maxed = sel1&&sel2&&!iS1&&!iS2;
            return (
              <div key={s.id} className={`pc ${iS1?"sel1":iS2?"sel2":s.frei===0||maxed?"dis":""}`}
                onClick={()=>{if(s.frei===0||maxed)return;if(iS1){setSel1(sel2);setSel2(null);}else if(iS2)setSel2(null);else if(!sel1)setSel1(s.name);else if(!sel2)setSel2(s.name);}}>
                {(iS1||iS2)&&<div style={{position:"absolute",top:10,right:10}}><span className={`bdg ${iS1?"bo":"bp"}`}>{iS1?"① Wahl":"② Wahl"}</span></div>}
                <h4>{s.name}</h4>
                <div className="psub">{s.land} · {s.prog}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                  {s.spr.map(l=><span key={l} className="ptag ptag-b">{l}</span>)}
                  {s.fok.map(f=><span key={f} className="ptag ptag-or">{f}</span>)}
                  <span className="ptag ptag-g">{s.dur}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:".7rem",fontWeight:700}}>
                  <span style={{color:"var(--muted)"}}>Passgenauigkeit</span>
                  <span style={{color:sc(s.score)}}>{s.score}%</span>
                </div>
                <div className="mbar-bg"><div className="mbar-fill" style={{width:`${s.score}%`,background:sc(s.score)}}/></div>
                <div style={{fontSize:".68rem",fontWeight:700,color:s.frei===0?"var(--red)":"var(--muted)",marginTop:6}}>{s.frei===0?"Ausgebucht":`${s.frei} Platz${s.frei!==1?"ä":""}${s.frei!==1?"tze":""} frei`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── FREIWILLIGER: DOKUMENTE ──────────────────────────────────────────────────
function DokumenteFWView({ candidate: c, updateC, addFeed }) {
  const docs = c?.docs?.frei || [];
  const anf = c?.docs?.anf || [];

  function upload(docId) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, frei: x.docs.frei.map(d => d.id===docId ? {...d,status:"hochgeladen",up:"heute"} : d) } }));
    addFeed({ text:`${c.name} lädt ${docId==="cv"?"Lebenslauf":"Motivationsschreiben"} hoch`, sub:"Prüfung ausstehend", time:"gerade", dot:"fd-or", aktor:"Freiwillige/r" });
  }

  return (
    <div className="pad fi3">
      <div className="sec-head">Deine Unterlagen</div>
      <div className="card" style={{borderRadius:"0 0 10px 10px",borderTop:"none",marginBottom:16}}>
        <div className="card-b">
          <div className="al al-b" style={{marginBottom:16}}>
            <i>ℹ</i>
            <span>Alle Dokumente werden von der Verwaltung geprüft und freigegeben, bevor deine Platzierung final bestätigt wird.</span>
          </div>
          {docs.map(d => (
            <div key={d.id} className="di">
              <div className="dico">{d.id==="cv"?"📄":"✉️"}</div>
              <div className="dinfo">
                <h4>{d.name}</h4>
                <p>{d.status==="ausstehend"?"Bitte hochladen — PDF oder DOCX, max. 5 MB":d.status==="hochgeladen"?"Hochgeladen — wird geprüft ⏳":d.status==="freigegeben"?"✓ Freigegeben von der Verwaltung":"✕ Abgelehnt — bitte neu hochladen"}</p>
                {d.up && <div className="dmeta">Hochgeladen: {d.up}</div>}
              </div>
              <div className="dact">
                {(d.status==="ausstehend"||d.status==="abgelehnt")
                  ? <button className="btn btn-or btn-sm" onClick={()=>upload(d.id)}>↑ Hochladen</button>
                  : <DocBadge s={d.status}/>}
              </div>
            </div>
          ))}
          {docs.every(d=>["hochgeladen","freigegeben"].includes(d.status)) && (
            <div className="al al-g" style={{marginTop:12,marginBottom:0}}><i>✓</i><span>Alle Dokumente eingereicht — die Verwaltung prüft deine Unterlagen.</span></div>
          )}
        </div>
      </div>

      {anf.length > 0 && (
        <>
          <div className="sec-head">Angeforderte Dokumente</div>
          <div className="card" style={{borderRadius:"0 0 10px 10px",borderTop:"none"}}>
            <div className="card-b">
              <div className="al al-or" style={{marginBottom:12}}><i>📋</i><span>Die Einsatzstelle hat zusätzliche Dokumente angefordert.</span></div>
              {anf.map(a=>(
                <div key={a.id} className="di">
                  <div className="dico">📋</div>
                  <div className="dinfo"><h4>{a.name}</h4><p>Angefordert von der Einsatzstelle</p></div>
                  <div className="dact">
                    {a.status==="angefordert"
                      ? <button className="btn btn-or btn-sm">↑ Hochladen</button>
                      : <DocBadge s={a.status}/>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FREIWILLIGER: KOMMUNIKATION ──────────────────────────────────────────────
function KommunikationFWView() {
  const msgs = [
    {sender:"Koordination Freunde Waldorf",text:"Hallo Mia! Wir haben deine Dokumente erhalten und prüfen sie gerade. Meldung in 2-3 Werktagen.",time:"heute 09:30",ich:false},
    {sender:"Ich",text:"Vielen Dank! Ich freue mich sehr auf den Einsatz in Accra.",time:"gestern 18:22",ich:true},
    {sender:"Koordination Freunde Waldorf",text:"Wir haben auch Informationen zur Vorbereitung für dich vorbereitet. Schau mal in deine Aufgaben.",time:"gestern 11:00",ich:false},
  ];
  return (
    <div className="fi3">
      <div className="hero" style={{minHeight:100}}>
        <div style={{background:"var(--orange)",padding:"16px 20px",position:"relative",zIndex:1}}>
          <div style={{color:"rgba(255,255,255,.7)",fontSize:".65rem",fontWeight:700,letterSpacing:".08em",marginBottom:3}}>NACHRICHTEN</div>
          <div style={{color:"#fff",fontSize:"1rem",fontWeight:900}}>Koordination Freunde Waldorf</div>
          <div style={{color:"rgba(255,255,255,.75)",fontSize:".72rem",marginTop:3}}>Deine Ansprechperson für alle Fragen</div>
        </div>
      </div>
      <div className="pad">
        <div className="card">
          <div className="card-b">
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.ich?"flex-end":"flex-start",marginBottom:12}}>
                <div style={{maxWidth:"75%",background:m.ich?"var(--orange)":"var(--bg2)",color:m.ich?"#fff":"var(--dark)",borderRadius:m.ich?"14px 14px 2px 14px":"14px 14px 14px 2px",padding:"10px 14px",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
                  {!m.ich && <div style={{fontSize:".63rem",fontWeight:700,color:"var(--orange)",marginBottom:4}}>{m.sender}</div>}
                  <div style={{fontSize:".78rem",lineHeight:1.5,fontWeight:500}}>{m.text}</div>
                  <div style={{fontSize:".6rem",color:m.ich?"rgba(255,255,255,.7)":"var(--muted2)",marginTop:4,fontWeight:600,textAlign:"right"}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
            <div style={{flex:1,background:"var(--bg2)",border:"1.5px solid var(--border2)",borderRadius:50,padding:"8px 16px",fontSize:".78rem",color:"var(--muted2)",fontWeight:600}}>Nachricht schreiben...</div>
            <button className="btn btn-or btn-sm" style={{borderRadius:50}}>Senden</button>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <div className="sec-head">Kontakt Freunde Waldorf</div>
          <div className="card" style={{borderRadius:"0 0 10px 10px",borderTop:"none"}}>
            <div className="card-b">
              {[["📞","Telefon","+49 (0)721 20111-0","Mo-Fr 9:00-16:30 Uhr"],["✉️","E-Mail","kontakt@freunde-waldorf.de","Rund um die Uhr erreichbar"]].map(([ico,label,val,meta])=>(
                <div key={label} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
                  <div style={{fontSize:"1.2rem",width:30,textAlign:"center"}}>{ico}</div>
                  <div><div style={{fontSize:".72rem",fontWeight:700,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".04em"}}>{label}</div><div style={{fontSize:".8rem",fontWeight:700,color:"var(--orange)"}}>{val}</div><div style={{fontSize:".68rem",color:"var(--muted)"}}>{meta}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KOORDINATOR VIEWS ────────────────────────────────────────────────────────
function DashboardView({ candidates, feed, setView, setModal }) {
  const pending = candidates.filter(c=>c.phase==="bewerbung").length;
  const pendingDocs = candidates.flatMap(c=>[...c.docs.frei,...c.docs.es]).filter(d=>d.status==="hochgeladen").length;
  return (
    <div className="pad fi3">
      <div className="g4" style={{marginBottom:16}}>
        {[["Aktive Freiwillige",candidates.filter(c=>c.phase==="aktiv").length,"var(--orange)"],["Platziert",candidates.filter(c=>["platziert","aktiv"].includes(c.phase)).length,"var(--dark)"],["Neue Bewerbungen",pending,"var(--red)"],["Offene Docs",pendingDocs,"var(--orange)"]].map(([l,v,c])=>(
          <div key={l} className="sc sc-or"><div className="sl">{l}</div><div className="sv" style={{color:c}}>{v}</div></div>
        ))}
      </div>
      {pending>0&&<div className="al al-or"><i>⚠</i><span><strong>{pending} neue Bewerbung{pending>1?"en":""}</strong> wartet auf Prüfung</span><button className="btn btn-or btn-sm" style={{marginLeft:"auto"}} onClick={()=>setView("bewerbung")}>Prüfen →</button></div>}
      {pendingDocs>0&&<div className="al al-r"><i>📎</i><span><strong>{pendingDocs} Dokument{pendingDocs>1?"e":""}</strong> warten auf Freigabe</span><button className="btn btn-or btn-sm" style={{marginLeft:"auto"}} onClick={()=>setView("dokumente")}>Review →</button></div>}
      <div className="g2">
        <div className="card">
          <div className="card-h"><h3>Freiwillige</h3></div>
          <table><thead><tr><th>Name</th><th>Phase</th><th>Stelle</th></tr></thead><tbody>
            {candidates.map(c=><tr key={c.id} className="cl"><td><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:".68rem",color:"var(--muted)"}}>{c.email}</div></td><td><SBadge s={c.bewStatus}/></td><td style={{fontSize:".74rem",color:"var(--muted)",fontWeight:600}}>{c.stelle||"—"}</td></tr>)}
          </tbody></table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Aktivitäts-Feed</h3></div>
          <div className="card-b">
            <div className="feed">
              {feed.slice(0,5).map(f=><div key={f.id} className="fi2"><div className={`fdot ${f.dot}`}/><div className="fb"><div className="ft">{f.text}</div>{f.sub&&<div className="fs">{f.sub}</div>}<div className="fm">{f.time} · {f.aktor}</div></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProzessView() {
  const steps = [
    {n:"1",title:"Grundbewerbung",desc:"Freiwilliger füllt Anmeldeformular aus",tools:["Formbricks","n8n","NocoDB"],state:"done"},
    {n:"2",title:"Prüfung & Freigabe",desc:"Koordinator prüft und gibt für Stellen-Pool frei",tools:["NocoDB","Mailpit"],state:"done"},
    {n:"3",title:"Stellenwahl",desc:"Freiwilliger wählt bis zu 2 Einsatzstellen",tools:["NocoDB","n8n"],state:"done"},
    {n:"4",title:"Einsatzstelle prüft",desc:"Kommentar/Empfehlung durch Einsatzstelle",tools:["NocoDB","Rocket.Chat"],state:"act"},
    {n:"5",title:"Dokumente",desc:"Lebenslauf + Motivationsschreiben hochladen, weitere anfordern",tools:["NocoDB","Mailpit"],state:"pen"},
    {n:"6",title:"Placement",desc:"Verwaltung bestätigt, alle Parteien werden informiert",tools:["NocoDB","n8n","Mailpit"],state:"pen"},
    {n:"7",title:"Einsatz aktiv",desc:"Monatliche Check-ins, Rocket.Chat Kommunikation",tools:["Rocket.Chat","Formbricks"],state:"pen"},
    {n:"8",title:"Abschluss",desc:"Abschlussberichte, Archivierung, Alumni",tools:["NocoDB","Formbricks"],state:"pen"},
  ];
  const tc = {Formbricks:"ba",n8n:"br",NocoDB:"bb","Rocket.Chat":"bg",Mailpit:"bx"};
  return (
    <div className="pad fi3" style={{maxWidth:600}}>
      {steps.map((s,i)=>(
        <div key={i} className="flow-item">
          <div className="fl-left">
            <div className={`fl-dot ${s.state==="done"?"fl-done":s.state==="act"?"fl-act":"fl-pen"}`}>{s.n}</div>
            {i<steps.length-1&&<div className={`fl-line ${s.state==="done"?"fl-line-done":"fl-line-pen"}`} style={{height:28}}/>}
          </div>
          <div className="fl-body">
            <h4>{s.title}</h4><p>{s.desc}</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
              {s.tools.map(t=><span key={t} className={`bdg ${tc[t]||"bx"}`} style={{fontSize:".58rem"}}>{t}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateList({ candidates, selId, setSelId }) {
  return (
    <div>
      {candidates.map(c=>(
        <div key={c.id} className={`cc ${selId===c.id?"on":""}`} onClick={()=>setSelId(c.id)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><h4>{c.name}</h4><div className="csub">{c.email} · {c.alter} J.</div></div>
            {c.matchScore!=null&&<div style={{textAlign:"right"}}><div style={{fontSize:".85rem",fontWeight:900,color:c.matchScore>=85?"var(--orange)":"var(--muted)"}}>{c.matchScore}%</div><div style={{fontSize:".58rem",color:"var(--muted2)",fontWeight:700}}>Match</div></div>}
          </div>
          <div className="ctags" style={{marginBottom:7}}>
            {c.sprachen.map(s=><span key={s} className="ct ct-b">{s}</span>)}
            {c.interessen.map(i=><span key={i} className="ct ct-or">{i}</span>)}
            <span className="ct ct-g">{c.dauer}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <SBadge s={c.bewStatus}/>
            {c.kommentare.length>0&&<span style={{fontSize:".63rem",color:"var(--muted)",fontWeight:700}}>💬 {c.kommentare.length}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateDetail({ c, role, updateC, addFeed, setModal }) {
  const [tab, setTab] = useState("profil");

  function approveDoc(docId) {
    updateC(c.id, x=>({...x,docs:{...x.docs,frei:x.docs.frei.map(d=>d.id===docId?{...d,status:"freigegeben"}:d)}}));
    addFeed({text:`Dokument freigegeben`,sub:c.name,time:"gerade",dot:"fd-g",aktor:"Verwaltung"});
  }
  function rejectDoc(docId) {
    updateC(c.id, x=>({...x,docs:{...x.docs,frei:x.docs.frei.map(d=>d.id===docId?{...d,status:"abgelehnt"}:d)}}));
    addFeed({text:`Dokument abgelehnt — Upload-Anfrage an ${c.name}`,sub:"",time:"gerade",dot:"fd-rd",aktor:"Verwaltung"});
  }

  const pendingAnf = c.docs.anf.filter(a=>a.status==="wartet");

  return (
    <div className="card fi3">
      <div className="card-h"><div><h3>{c.name}</h3><div className="sub">{c.stelle||"Nicht platziert"}</div></div><SBadge s={c.bewStatus}/></div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border)",padding:"0 16px"}}>
        {["profil","dokumente","kommentare"].map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 12px",fontSize:".73rem",cursor:"pointer",borderBottom:tab===t?"3px solid var(--orange)":"3px solid transparent",color:tab===t?"var(--orange)":"var(--muted)",marginBottom:-1,textTransform:"capitalize",fontWeight:700,transition:"all .15s"}}>
            {t}
            {t==="kommentare"&&c.kommentare.length>0&&<span style={{marginLeft:4,background:"#fff3ec",color:"var(--orange)",padding:"1px 5px",borderRadius:8,fontSize:".58rem",fontWeight:700}}>{c.kommentare.length}</span>}
          </div>
        ))}
      </div>
      <div className="card-b">
        {tab==="profil"&&(
          <div>
            {role==="koordinator"&&<div className="override-bar"><span>⚡</span><span style={{flex:1}}>Verwaltungs-Override</span><button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"override",cid:c.id})}>Überschreiben</button></div>}
            {role==="einsatzstelle"&&<div className="al al-b"><i>ℹ</i><span>Kommentare sind für die NGO-Zentrale sichtbar. Finale Entscheidung bei der Verwaltung.</span></div>}
            {[["Sprachen",c.sprachen.join(", ")],["Interessen",c.interessen.join(", ")],["Verfügbar",c.verfügbar],["Dauer",c.dauer],["Match",c.matchScore!=null?`${c.matchScore}%`:"—"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:".78rem"}}>
                <span style={{color:"var(--muted)",fontWeight:600}}>{k}</span><span style={{fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {tab==="dokumente"&&(
          <div>
            {pendingAnf.length>0&&role==="koordinator"&&pendingAnf.map(a=>(
              <div key={a.id} className="al al-or">
                <i>📋</i><div style={{flex:1}}><div style={{fontWeight:700,fontSize:".77rem"}}>„{a.name}" wartet auf Freigabe</div></div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-or btn-xs" onClick={()=>updateC(c.id,x=>({...x,docs:{...x.docs,anf:x.docs.anf.map(xa=>xa.id===a.id?{...xa,status:"angefordert"}:xa)}}))}>Freigeben</button>
                  <button className="btn btn-gh btn-xs" onClick={()=>updateC(c.id,x=>({...x,docs:{...x.docs,anf:x.docs.anf.map(xa=>xa.id===a.id?{...xa,status:"blockiert"}:xa)}}))}>Blockieren</button>
                </div>
              </div>
            ))}
            <div className="slbl">Dokumente vom/von Freiwillige/n</div>
            {c.docs.frei.map(d=>(
              <div key={d.id} className="di">
                <div className="dico">{d.id==="cv"?"📄":"✉️"}</div>
                <div className="dinfo"><h4>{d.name}</h4><p>{d.status==="hochgeladen"?"Hochgeladen — Prüfung ausstehend":d.status==="freigegeben"?"Freigegeben ✓":"Noch nicht hochgeladen"}</p>{d.up&&<div className="dmeta">{d.up}</div>}</div>
                {role==="koordinator"&&d.status==="hochgeladen"
                  ?<div className="dact"><button className="btn btn-or btn-xs" onClick={()=>approveDoc(d.id)}>✓</button><button className="btn btn-gh btn-xs" onClick={()=>rejectDoc(d.id)}>✕</button></div>
                  :<DocBadge s={d.status}/>}
              </div>
            ))}
            {c.docs.es.length>0&&<>
              <div className="slbl">Dokumente von Einsatzstelle</div>
              {c.docs.es.map(d=><div key={d.id} className="di"><div className="dico">🏢</div><div className="dinfo"><h4>{d.name}</h4><p>{d.esFreigabe?"Freigegeben":"Wartet auf Freigabe"}</p></div><span className={`bdg ${d.esFreigabe?"bg":"ba"}`}>{d.esFreigabe?"freigegeben":"ausstehend"}</span></div>)}
            </>}
          </div>
        )}
        {tab==="kommentare"&&(
          <div>
            {c.kommentare.length===0?<div style={{fontSize:".74rem",color:"var(--muted2)",padding:"8px 0",fontWeight:600}}>Noch keine Kommentare</div>
            :c.kommentare.map((k,i)=><div key={i} className="cmt"><div className="cf"><span>{k.von}</span><span className={`bdg ${k.type==="empfehlung"?"bg":k.type==="bedenken"?"ba":"bb"}`}>{k.type}</span></div><div className="ct2">{k.text}</div><div className="ctime">{k.zeit}</div></div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function FreiwilligeView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  return <div className="pad split-l fi3"><CandidateList candidates={candidates} selId={selId} setSelId={setSelId}/><div>{sel?<CandidateDetail c={sel} role="koordinator" updateC={updateC} addFeed={addFeed} setModal={setModal}/>:<div className="card"><div className="empty">Freiwillige/n auswählen</div></div>}</div></div>;
}

function BewerbungView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  const phases = ["bewerbung","pool","dokumente","platziert","aktiv"];
  const phaseLabels = {bewerbung:"Grundbewerbung",pool:"Stellen-Pool",dokumente:"Dokumente",platziert:"Platziert",aktiv:"Aktiv"};
  return (
    <div className="pad split-l fi3">
      <div>
        {phases.map(ph=>{
          const list = candidates.filter(c=>c.phase===ph);
          if(!list.length)return null;
          return <div key={ph} style={{marginBottom:14}}><div className="sec-head" style={{borderRadius:6,marginBottom:8}}>{phaseLabels[ph]} ({list.length})</div><CandidateList candidates={list} selId={selId} setSelId={setSelId}/></div>;
        })}
      </div>
      <div>
        {sel?<div><CandidateDetail c={sel} role="koordinator" updateC={updateC} addFeed={addFeed} setModal={setModal}/>
          {sel.phase==="bewerbung"&&<div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="btn btn-or" style={{flex:1}} onClick={()=>{updateC(sel.id,c=>({...c,phase:"pool",bewStatus:"qualifiziert"}));addFeed({text:`${sel.name} für Stellen-Pool freigegeben`,sub:"",time:"gerade",dot:"fd-g",aktor:"Verwaltung"});}}>✓ Für Pool freigeben</button>
            <button className="btn btn-gh" onClick={()=>{updateC(sel.id,c=>({...c,bewStatus:"abgelehnt"}));addFeed({text:`Bewerbung abgelehnt: ${sel.name}`,sub:"",time:"gerade",dot:"fd-rd",aktor:"Verwaltung"});}}>Ablehnen</button>
          </div>}
        </div>:<div className="card"><div className="empty">Bewerber auswählen</div></div>}
      </div>
    </div>
  );
}

function StellenPoolView() {
  const [fFok, setFFok] = useState(null);
  const foks = [...new Set(STELLE_POOL.flatMap(s=>s.fok))];
  const list = fFok?STELLE_POOL.filter(s=>s.fok.includes(fFok)):STELLE_POOL;
  return (
    <div className="pad fi3">
      <div style={{marginBottom:14}}><span className={`tag ${!fFok?"on":""}`} onClick={()=>setFFok(null)}>Alle</span>{foks.map(f=><span key={f} className={`tag ${fFok===f?"on":""}`} onClick={()=>setFFok(fFok===f?null:f)}>{f}</span>)}</div>
      <div className="g2" style={{gap:12}}>
        {list.map(s=><div key={s.id} className={`pc ${s.frei===0?"dis":""}`}><h4>{s.name}</h4><div className="psub">{s.land} · {s.prog}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{s.spr.map(l=><span key={l} className="ptag ptag-b">{l}</span>)}{s.fok.map(f=><span key={f} className="ptag ptag-or">{f}</span>)}<span className="ptag ptag-g">{s.dur}</span></div><div style={{fontSize:".7rem",fontWeight:700,color:s.frei===0?"var(--red)":"var(--muted)"}}>{s.frei===0?"Ausgebucht":`${s.frei} Platz${s.frei!==1?"ä":""}${s.frei!==1?"tze":""} frei`}</div></div>)}
      </div>
    </div>
  );
}

function DokumentReviewView({ candidates, updateC, addFeed }) {
  const [actDoc, setActDoc] = useState(null);
  const allDocs = candidates.flatMap(c=>[...c.docs.frei.map(d=>({...d,cid:c.id,cname:c.name,key:"frei",ico:d.id==="cv"?"📄":"✉️"})),...c.docs.es.map(d=>({...d,cid:c.id,cname:c.name,key:"es",ico:"🏢"}))]).filter(d=>d.status==="hochgeladen");
  function approve(d){updateC(d.cid,c=>({...c,docs:{...c.docs,[d.key]:c.docs[d.key].map(x=>x.id===d.id?{...x,status:"freigegeben",esFreigabe:true}:x)}}));setActDoc(x=>x?{...x,status:"freigegeben"}:x);addFeed({text:`Dok. freigegeben: ${d.name}`,sub:d.cname,time:"gerade",dot:"fd-g",aktor:"Verwaltung"});}
  function reject(d){updateC(d.cid,c=>({...c,docs:{...c.docs,[d.key]:c.docs[d.key].map(x=>x.id===d.id?{...x,status:"abgelehnt"}:x)}}));setActDoc(x=>x?{...x,status:"abgelehnt"}:x);addFeed({text:`Dok. abgelehnt — Anfrage an ${d.cname}`,sub:"",time:"gerade",dot:"fd-rd",aktor:"Verwaltung"});}
  return (
    <div className="pad split-r fi3">
      <div>
        <div className="slbl">Offene Prüfungen ({allDocs.length})</div>
        {allDocs.length===0&&<div className="empty">Alle geprüft ✓</div>}
        {allDocs.map((d,i)=><div key={i} className={`di ${actDoc?.id===d.id&&actDoc?.cid===d.cid?"on":""}`} style={{cursor:"pointer"}} onClick={()=>setActDoc(d)}><div className="dico">{d.ico}</div><div className="dinfo"><h4>{d.name}</h4><p>{d.cname}</p>{d.up&&<div className="dmeta">{d.up}</div>}</div><DocBadge s={d.status}/></div>)}
      </div>
      <div>
        {actDoc?<div className="card"><div className="card-h"><div><h3>{actDoc.name}</h3><div className="sub">{actDoc.cname}</div></div><DocBadge s={actDoc.status}/></div><div className="card-b">{actDoc.content?<div className="pr"><strong>{actDoc.name}</strong>{actDoc.content}</div>:<div className="pr" style={{display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted2)"}}>Kein Inhalt</div>}{actDoc.status==="hochgeladen"&&actDoc.content&&<div style={{display:"flex",gap:8,marginTop:12}}><button className="btn btn-or" style={{flex:1}} onClick={()=>approve(actDoc)}>✓ Freigeben</button><button className="btn btn-gh" onClick={()=>reject(actDoc)}>✕ Ablehnen</button></div>}{actDoc.status==="freigegeben"&&<div className="al al-g" style={{margin:0}}><i>✓</i><span>Freigegeben</span></div>}{actDoc.status==="abgelehnt"&&<div className="al al-r" style={{margin:0}}><i>✕</i><span>Abgelehnt — Upload-Aufforderung gesendet</span></div>}</div></div>:<div className="card"><div className="empty">Dokument auswählen</div></div>}
      </div>
    </div>
  );
}

function MonitoringView({ candidates, feed, updateC, addFeed }) {
  return (
    <div className="pad g2 fi3">
      <div>
        <div className="card"><div className="card-h"><h3>Aktivitäts-Feed</h3></div><div className="card-b"><div className="feed">{feed.map(f=><div key={f.id} className="fi2"><div className={`fdot ${f.dot}`}/><div className="fb"><div className="ft">{f.text}</div>{f.sub&&<div className="fs">{f.sub}</div>}<div className="fm">{f.time} · {f.aktor}</div></div></div>)}</div></div></div>
      </div>
      <div>
        <div className="card"><div className="card-h"><h3>Status Übersicht</h3></div><table><thead><tr><th>Name</th><th>Status</th><th>Docs</th></tr></thead><tbody>{candidates.map(c=><tr key={c.id}><td style={{fontWeight:700}}>{c.name}</td><td><SBadge s={c.bewStatus}/></td><td><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{c.docs.frei.map(d=><span key={d.id} className={`bdg ${d.status==="freigegeben"?"bg":d.status==="hochgeladen"?"ba":"bx"}`} style={{fontSize:".54rem"}}>{d.name.split(" ")[0]}</span>)}</div></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

function KommunikationView() {
  const msgs=[{sender:"Carlos Ruiz (Oaxaca)",text:"Anna macht super Arbeit!",time:"heute 09:12",ch:"#umwelt-mx-2026"},{sender:"Kwame Asante (Accra)",text:"Brauchen weiteren Freiwilligen für September",time:"gestern 16:30",ch:"#bildung-gh-2026"},{sender:"System (n8n)",text:"Neue Bewerbung: Max Klein → Naturschutz Oaxaca",time:"gestern 14:05",ch:"#koordinatoren"}];
  return <div className="pad fi3"><div className="card"><div className="card-h"><h3>💬 Rocket.Chat</h3></div><div className="card-b">{msgs.map((m,i)=><div key={i} style={{padding:"9px 0",borderBottom:"1px solid var(--border)"}}><div style={{fontSize:".72rem",fontWeight:700,color:"var(--orange)"}}>{m.sender}</div><div style={{fontSize:".78rem",color:"var(--dark)",marginTop:2,lineHeight:1.5}}>{m.text}</div><div style={{fontSize:".62rem",color:"var(--muted2)",marginTop:3,fontWeight:700}}>{m.time} · {m.ch}</div></div>)}</div></div></div>;
}

// ─── EINSATZSTELLE VIEWS ──────────────────────────────────────────────────────
function BewerberView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  const myC = candidates.filter(c=>c.stelle==="Schule Accra Nord");
  return (
    <div className="pad split-l fi3">
      <div><div className="al al-b"><i>ℹ</i><span>Sie können Kommentare hinterlassen. Finale Entscheidung bei der NGO-Zentrale.</span></div><CandidateList candidates={myC} selId={selId} setSelId={setSelId}/></div>
      <div>{sel?<div><CandidateDetail c={sel} role="einsatzstelle" updateC={updateC} addFeed={addFeed} setModal={setModal}/><div style={{display:"flex",gap:8,marginTop:10}}><button className="btn btn-ol btn-sm" onClick={()=>setModal({type:"anforderung",cid:sel.id})}>+ Dok. anfordern</button><button className="btn btn-ol btn-sm" onClick={()=>setModal({type:"uploadEs",cid:sel.id})}>↑ Hochladen</button><button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"kommentar",cid:sel.id})}>✎ Kommentar</button></div></div>:<div className="card"><div className="empty">Bewerber auswählen</div></div>}</div>
    </div>
  );
}

function EsDokumenteView({ candidates, updateC, addFeed }) {
  const myC = candidates.filter(c=>c.stelle==="Schule Accra Nord");
  return <div className="pad fi3">{myC.map(c=><div key={c.id} className="card" style={{marginBottom:14}}><div className="card-h"><h3>{c.name}</h3><SBadge s={c.bewStatus}/></div><div className="card-b"><div className="slbl">Anforderungen</div>{c.docs.anf.length===0?<div style={{fontSize:".74rem",color:"var(--muted2)",fontWeight:600}}>Keine</div>:c.docs.anf.map(a=><div key={a.id} className="di"><div className="dico">📋</div><div className="dinfo"><h4>{a.name}</h4></div><DocBadge s={a.status}/></div>)}<div className="slbl">Ihre Dokumente</div>{c.docs.es.length===0?<div style={{fontSize:".74rem",color:"var(--muted2)",fontWeight:600}}>Keine hochgeladen</div>:c.docs.es.map(d=><div key={d.id} className="di"><div className="dico">🏢</div><div className="dinfo"><h4>{d.name}</h4></div><span className={`bdg ${d.esFreigabe?"bg":"ba"}`}>{d.esFreigabe?"freigegeben":"ausstehend"}</span></div>)}</div></div>)}</div>;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function KommentarModal({ c, role, onSubmit, onClose }) {
  const [text, setText] = useState(""); const [type, setType] = useState("empfehlung");
  return <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="mh"><h3>Kommentar zu {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div><div className="mb"><div className="ff"><label>Typ</label><select className="fsel" value={type} onChange={e=>setType(e.target.value)}><option value="empfehlung">Empfehlung</option><option value="bedenken">Bedenken</option><option value="info">Info</option></select></div><div className="ff"><label>Kommentar</label><textarea className="fta" value={text} onChange={e=>setText(e.target.value)} placeholder="Ihre Einschätzung..."/></div><div className="al al-b"><i>ℹ</i><span>Sichtbar für NGO-Verwaltung. Finale Entscheidung bei der Zentrale.</span></div></div><div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-or" disabled={!text.trim()} onClick={()=>onSubmit(text,type)}>Senden</button></div></div></div>;
}

function AnforderungModal({ c, onSubmit, onClose }) {
  const [typ, setTyp] = useState("Erweitertes Führungszeugnis"); const [mode, setMode] = useState("direkt"); const [custom, setCustom] = useState("");
  const opts = ["Erweitertes Führungszeugnis","Impfnachweis","Visa-Kopie","Sprachzertifikat","Versicherungsnachweis","Sonstiges"];
  return <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="mh"><h3>Dokument anfordern von {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div><div className="mb"><div className="ff"><label>Dokument-Typ</label><select className="fsel" value={typ} onChange={e=>setTyp(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>{typ==="Sonstiges"&&<div className="ff"><label>Bezeichnung</label><input className="fi" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="z.B. Referenzschreiben"/></div>}<div className="ff"><label>Modus</label><select className="fsel" value={mode} onChange={e=>setMode(e.target.value)}><option value="direkt">Direkt — n8n sendet sofort Mail</option><option value="via_verwaltung">Via Verwaltung — Freigabe nötig</option></select></div><div className={`al ${mode==="direkt"?"al-or":"al-b"}`}><i>{mode==="direkt"?"⚡":"🔒"}</i><span>{mode==="direkt"?"Freiwillige/r wird direkt benachrichtigt.":"Anforderung wird zuerst der Verwaltung vorgelegt."}</span></div></div><div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-or" onClick={()=>onSubmit(typ==="Sonstiges"?custom:typ,mode)}>Anfordern</button></div></div></div>;
}

function UploadEsModal({ c, onSubmit, onClose }) {
  const [typ, setTyp] = useState("Einsatzbeschreibung");
  const opts = ["Einsatzbeschreibung","Hausordnung","Notfallprotokoll","Orientierungsplan","Sonstiges"];
  return <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="mh"><h3>Dokument hochladen für {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div><div className="mb"><div className="ff"><label>Typ</label><select className="fsel" value={typ} onChange={e=>setTyp(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></div><div className="uz"><div className="uico">📎</div><p>PDF, DOCX oder JPG</p><span>Klicken oder Datei ziehen (simuliert)</span></div><div className="al al-or"><i>ℹ</i><span>Wird durch Verwaltung geprüft bevor es für Freiwillige sichtbar ist.</span></div></div><div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-or" onClick={()=>onSubmit(typ)}>Hochladen (simuliert)</button></div></div></div>;
}

function OverrideModal({ c, onSubmit, onClose }) {
  const [status, setStatus] = useState("empfohlen");
  return <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="mh"><h3>Status überschreiben: {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div><div className="mb"><div className="override-bar"><span>⚡</span><span>Verwaltungs-Override</span></div><div className="ff"><label>Neuer Status</label><select className="fsel" value={status} onChange={e=>setStatus(e.target.value)}><option value="neu">Neu</option><option value="qualifiziert">Qualifiziert</option><option value="empfohlen">Empfohlen</option><option value="bedenken">Bedenken</option><option value="angenommen">Angenommen</option><option value="abgelehnt">Abgelehnt</option></select></div></div><div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-or" onClick={()=>onSubmit(status)}>Status setzen</button></div></div></div>;
}
