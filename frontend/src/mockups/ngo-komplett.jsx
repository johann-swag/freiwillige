import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#f7f5f0; --surface:#ffffff; --s2:#f0ede6; --s3:#e8e3d8;
    --border:#ddd8cc; --b2:#c8c0b0;
    --g:#3d7a4a; --gl:#e8f3eb; --b:#2563a8; --bl:#e8eef8;
    --a:#b86a00; --al:#fdf3e3; --r:#b83232; --rl:#fdf0f0;
    --p:#6b3fa0; --pl:#f3eefb; --o:#c05e00; --ol:#fdf1e8;
    --text:#1a1a18; --muted:#6b6558; --muted2:#8c8070;
    --serif:'Playfair Display',Georgia,serif; --mono:'DM Mono',monospace; --sans:'Source Sans 3',sans-serif;
    --radius:10px; --shadow:0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.05);
  }
  body { background:var(--bg); color:var(--text); font-family:var(--sans); min-height:100vh; }
  .app { display:flex; height:100vh; overflow:hidden; }

  /* SIDEBAR */
  .sb { width:238px; min-width:238px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; overflow:hidden; box-shadow:2px 0 8px rgba(0,0,0,.04); }
  .sb-logo { padding:20px 18px 16px; border-bottom:1px solid var(--border); background:var(--g); }
  .sb-logo h1 { font-family:var(--serif); font-size:1.15rem; color:#fff; line-height:1.2; font-weight:600; }
  .sb-logo .ver { font-family:var(--mono); font-size:0.52rem; color:rgba(255,255,255,.65); letter-spacing:.1em; margin-top:4px; }
  .sb-sect { padding:14px 14px 4px; }
  .sb-sect span { font-family:var(--mono); font-size:0.52rem; color:var(--muted2); letter-spacing:.12em; text-transform:uppercase; padding:0 6px; }
  .ni { display:flex; align-items:center; gap:9px; padding:8px 9px; border-radius:8px; cursor:pointer; font-size:0.8rem; color:var(--muted); transition:all .15s; margin:1px 8px; }
  .ni:hover { background:var(--s2); color:var(--text); }
  .ni.on { background:var(--gl); color:var(--g); font-weight:600; border-left:3px solid var(--g); padding-left:6px; }
  .ni .ico { font-size:.85rem; width:18px; text-align:center; }
  .nib { margin-left:auto; font-size:.58rem; font-family:var(--mono); padding:1px 6px; border-radius:10px; font-weight:600; }
  .nib-r { background:var(--rl); color:var(--r); }
  .nib-a { background:var(--al); color:var(--a); }
  .sb-bottom { margin-top:auto; border-top:1px solid var(--border); background:var(--s2); }
  .role-box { padding:12px 14px; border-bottom:1px solid var(--border); }
  .role-box label { font-family:var(--mono); font-size:.52rem; color:var(--muted2); letter-spacing:.1em; display:block; margin-bottom:5px; text-transform:uppercase; }
  .role-box select { background:var(--surface); border:1px solid var(--border); color:var(--text); padding:7px 9px; border-radius:8px; font-family:var(--sans); font-size:.77rem; width:100%; outline:none; cursor:pointer; }
  .ctx-box { padding:10px 14px 14px; }
  .ctx-box label { font-family:var(--mono); font-size:.52rem; color:var(--muted2); letter-spacing:.1em; display:block; margin-bottom:5px; text-transform:uppercase; }
  .ctx-info { font-size:.72rem; color:var(--muted); line-height:1.5; }
  .ctx-info strong { color:var(--text); display:block; margin-bottom:2px; font-weight:600; }

  /* MAIN */
  .main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .topbar { padding:13px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--surface); flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .topbar h2 { font-family:var(--serif); font-size:1.3rem; color:var(--text); font-weight:600; }
  .topbar .tsub { font-family:var(--mono); font-size:.59rem; color:var(--muted2); margin-top:2px; letter-spacing:.04em; }
  .topbar-r { display:flex; gap:8px; align-items:center; }
  .content { flex:1; overflow-y:auto; padding:22px 26px; background:var(--bg); }

  /* BUTTONS */
  .btn { padding:7px 16px; border-radius:50px; font-family:var(--sans); font-size:.77rem; font-weight:600; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; letter-spacing:.01em; }
  .btn-sm { padding:5px 12px; font-size:.71rem; }
  .btn-xs { padding:3px 9px; font-size:.67rem; }
  .btn-pg { background:var(--g); color:#fff; box-shadow:0 2px 6px rgba(61,122,74,.25); } .btn-pg:hover { background:#336640; }
  .btn-pb { background:var(--bl); color:var(--b); border:1px solid rgba(37,99,168,.2); } .btn-pb:hover { background:#dce8f5; }
  .btn-pa { background:var(--al); color:var(--a); border:1px solid rgba(184,106,0,.2); } .btn-pa:hover { background:#fde8c8; }
  .btn-pr { background:var(--rl); color:var(--r); border:1px solid rgba(184,50,50,.2); } .btn-pr:hover { background:#fbdcdc; }
  .btn-pp { background:var(--pl); color:var(--p); border:1px solid rgba(107,63,160,.2); } .btn-pp:hover { background:#ece3f8; }
  .btn-po { background:var(--ol); color:var(--o); border:1px solid rgba(192,94,0,.2); } .btn-po:hover { background:#fde5d0; }
  .btn-gh { background:transparent; color:var(--muted); border:1.5px solid var(--border); } .btn-gh:hover { background:var(--s2); color:var(--text); }

  /* BADGES */
  .bdg { display:inline-flex; align-items:center; padding:2px 9px; border-radius:50px; font-family:var(--sans); font-size:.62rem; font-weight:600; }
  .bg { background:var(--gl); color:var(--g); }
  .bgs { background:var(--g); color:#fff; }
  .bb { background:var(--bl); color:var(--b); }
  .ba { background:var(--al); color:var(--a); }
  .br { background:var(--rl); color:var(--r); }
  .bp { background:var(--pl); color:var(--p); }
  .bo { background:var(--ol); color:var(--o); }
  .bx { background:var(--s3); color:var(--muted); }

  /* LAYOUT */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  .g4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; }
  .split-r { display:grid; grid-template-columns:1fr 340px; gap:16px; align-items:start; }
  .split-l { display:grid; grid-template-columns:300px 1fr; gap:16px; align-items:start; }

  /* CARDS */
  .card { background:var(--surface); border:1px solid var(--border); border-radius:12px; box-shadow:var(--shadow); }
  .card-h { padding:13px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .card-h h3 { font-size:.85rem; font-weight:600; font-family:var(--serif); color:var(--text); }
  .card-h .sub { font-family:var(--mono); font-size:.56rem; color:var(--muted2); margin-top:2px; }
  .card-b { padding:16px 18px; }

  /* TABLE */
  table { width:100%; border-collapse:collapse; }
  th { padding:9px 16px; text-align:left; font-family:var(--mono); font-size:.56rem; color:var(--muted2); letter-spacing:.08em; border-bottom:1px solid var(--border); font-weight:500; background:var(--s2); }
  td { padding:10px 16px; font-size:.78rem; border-bottom:1px solid var(--border); vertical-align:middle; color:var(--text); }
  tr:last-child td { border-bottom:none; }
  tr.cl:hover td { background:var(--s2); cursor:pointer; }
  tr.sel td { background:var(--gl); }

  /* STAT */
  .sc { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 18px; box-shadow:var(--shadow); }
  .sc .sl { font-family:var(--mono); font-size:.56rem; color:var(--muted2); letter-spacing:.1em; margin-bottom:8px; text-transform:uppercase; }
  .sc .sv { font-family:var(--serif); font-size:1.7rem; line-height:1; color:var(--text); }
  .sc .sd { font-size:.69rem; color:var(--muted); margin-top:5px; }

  /* ALERTS */
  .al { border-radius:10px; padding:11px 14px; display:flex; align-items:flex-start; gap:10px; font-size:.76rem; margin-bottom:12px; }
  .al-g { background:var(--gl); border:1px solid rgba(61,122,74,.2); color:var(--g); }
  .al-b { background:var(--bl); border:1px solid rgba(37,99,168,.2); color:var(--b); }
  .al-a { background:var(--al); border:1px solid rgba(184,106,0,.2); color:var(--a); }
  .al-r { background:var(--rl); border:1px solid rgba(184,50,50,.2); color:var(--r); }
  .al-o { background:var(--ol); border:1px solid rgba(192,94,0,.2); color:var(--o); }
  .al i { font-size:.95rem; flex-shrink:0; margin-top:1px; }

  /* FORM */
  .ff { margin-bottom:14px; }
  .ff label { font-size:.72rem; font-weight:600; display:block; margin-bottom:5px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; }
  .fi { background:var(--s2); border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; width:100%; font-size:.78rem; color:var(--muted); font-family:var(--sans); }
  .fta { background:var(--s2); border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; width:100%; font-size:.78rem; color:var(--text); font-family:var(--sans); resize:vertical; min-height:76px; outline:none; }
  .fta:focus { border-color:var(--g); }
  .fsel { background:var(--s2); border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; width:100%; font-size:.78rem; color:var(--text); font-family:var(--sans); outline:none; }

  /* SECTION LABEL */
  .slbl { font-family:var(--mono); font-size:.55rem; color:var(--muted2); letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; margin-top:18px; padding-bottom:6px; border-bottom:1.5px solid var(--border); }
  .slbl:first-child { margin-top:0; }

  /* STEP STEPPER */
  .stepper { display:flex; align-items:center; margin-bottom:24px; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px 20px; box-shadow:var(--shadow); }
  .step { display:flex; align-items:center; gap:7px; }
  .sdot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:.68rem; font-weight:700; flex-shrink:0; }
  .sdot-done { background:var(--g); color:#fff; }
  .sdot-act { background:var(--b); color:#fff; box-shadow:0 0 0 4px var(--bl); }
  .sdot-pen { background:var(--s3); color:var(--muted2); border:2px solid var(--border); }
  .slabel { font-size:.7rem; font-weight:600; }
  .slabel-done { color:var(--g); } .slabel-act { color:var(--b); } .slabel-pen { color:var(--muted2); }
  .sline { flex:1; height:2px; background:var(--border); margin:0 8px; min-width:16px; border-radius:2px; }
  .sline-done { background:var(--g); }

  /* CANDIDATE CARD */
  .cc { background:var(--surface); border:1.5px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; cursor:pointer; transition:all .15s; box-shadow:0 1px 3px rgba(0,0,0,.04); }
  .cc:hover { border-color:var(--b2); box-shadow:0 2px 8px rgba(0,0,0,.08); transform:translateY(-1px); }
  .cc.on { border-color:var(--g); background:var(--gl); box-shadow:0 2px 8px rgba(61,122,74,.12); }
  .cc h4 { font-size:.82rem; font-weight:600; margin-bottom:2px; font-family:var(--serif); }
  .cc .csub { font-size:.69rem; color:var(--muted); margin-bottom:8px; }
  .ctags { display:flex; gap:5px; flex-wrap:wrap; }
  .ct { font-family:var(--mono); font-size:.57rem; padding:2px 7px; border-radius:50px; }
  .ct-b { background:var(--bl); color:var(--b); }
  .ct-p { background:var(--pl); color:var(--p); }
  .ct-a { background:var(--al); color:var(--a); }
  .ct-g { background:var(--gl); color:var(--g); }

  /* POOL CARD */
  .pc { background:var(--surface); border:1.5px solid var(--border); border-radius:12px; padding:16px; cursor:pointer; transition:all .15s; position:relative; box-shadow:var(--shadow); }
  .pc:hover { border-color:var(--g); box-shadow:0 4px 12px rgba(61,122,74,.12); transform:translateY(-1px); }
  .pc.sel1 { border-color:var(--b); background:var(--bl); }
  .pc.sel2 { border-color:var(--p); background:var(--pl); }
  .pc.dis { opacity:.45; cursor:not-allowed; }
  .pc h4 { font-size:.84rem; font-weight:600; margin-bottom:3px; font-family:var(--serif); }
  .pc .psub { font-size:.7rem; color:var(--muted); margin-bottom:9px; }
  .mbar-bg { height:5px; background:var(--s3); border-radius:3px; margin-top:8px; }
  .mbar-fill { height:100%; border-radius:3px; transition:width .5s ease; }

  /* DOC ITEM */
  /* DOC ITEM */
  .di { background:var(--s2); border:1.5px solid var(--border); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:11px; margin-bottom:9px; transition:all .15s; }
  .di.cl:hover { border-color:var(--g); cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.06); }
  .di.on { border-color:var(--b); background:var(--bl); }
  .di .dico { font-size:1.3rem; flex-shrink:0; }
  .di .dinfo { flex:1; min-width:0; }
  .di .dinfo h4 { font-size:.79rem; font-weight:600; margin-bottom:2px; font-family:var(--serif); }
  .di .dinfo p { font-size:.69rem; color:var(--muted); line-height:1.4; }
  .di .dinfo .dmeta { font-family:var(--mono); font-size:.56rem; color:var(--muted2); margin-top:3px; }
  .di .dact { display:flex; gap:6px; flex-shrink:0; }

  /* UPLOAD ZONE */
  .uz { border:2px dashed var(--border); border-radius:10px; padding:18px; text-align:center; cursor:pointer; transition:all .15s; margin-bottom:10px; background:var(--s2); }
  .uz:hover { border-color:var(--g); background:var(--gl); }
  .uz .uico { font-size:1.5rem; margin-bottom:6px; }
  .uz p { font-size:.75rem; color:var(--muted); }
  .uz span { font-size:.67rem; color:var(--g); display:block; margin-top:3px; }

  /* FEED */
  .feed { display:flex; flex-direction:column; }
  .fi2 { display:flex; gap:11px; padding:10px 0; border-bottom:1px solid var(--border); }
  .fi2:last-child { border-bottom:none; }
  .fdot { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:5px; }
  .fd-g { background:var(--g); } .fd-b { background:var(--b); } .fd-a { background:var(--a); }
  .fd-r { background:var(--r); } .fd-p { background:var(--p); } .fd-o { background:var(--o); }
  .fb { flex:1; }
  .fb .ft { font-size:.77rem; font-weight:600; margin-bottom:2px; color:var(--text); }
  .fb .fs { font-size:.69rem; color:var(--muted); line-height:1.35; }
  .fb .fm { font-family:var(--mono); font-size:.56rem; color:var(--muted2); margin-top:4px; }
  .atag { font-family:var(--mono); font-size:.55rem; padding:1px 6px; border-radius:50px; margin-left:6px; }

  /* COMMENTS */
  .cmt { background:var(--s2); border:1.5px solid var(--border); border-radius:10px; padding:11px 14px; margin-bottom:9px; }
  .cmt .cf { font-size:.69rem; font-weight:700; margin-bottom:3px; display:flex; align-items:center; gap:7px; color:var(--text); }
  .cmt .ct2 { font-size:.75rem; color:var(--muted); line-height:1.5; }
  .cmt .ctime { font-family:var(--mono); font-size:.56rem; color:var(--muted2); margin-top:5px; }

  /* MODAL */
  .mbg { position:fixed; inset:0; background:rgba(26,26,24,.5); backdrop-filter:blur(4px); z-index:300; display:flex; align-items:center; justify-content:center; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:16px; width:460px; max-width:95vw; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,.15); }
  .mh { padding:16px 22px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--s2); }
  .mh h3 { font-size:.9rem; font-weight:600; font-family:var(--serif); }
  .mc { background:none; border:none; color:var(--muted); font-size:1.1rem; cursor:pointer; }
  .mb { padding:20px 22px; }
  .mf { padding:12px 22px; border-top:1px solid var(--border); display:flex; gap:8px; justify-content:flex-end; background:var(--s2); }

  /* FLOW */
  .flow-item { display:flex; gap:14px; }
  .fl-left { display:flex; flex-direction:column; align-items:center; }
  .fl-dot { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:.68rem; font-weight:700; flex-shrink:0; }
  .fl-dot.done { background:var(--g); color:#fff; }
  .fl-dot.act { background:var(--b); color:#fff; animation:pulse 2s infinite; }
  .fl-dot.pen { background:var(--s3); color:var(--muted2); border:2px solid var(--border); }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,168,.3)}50%{box-shadow:0 0 0 6px rgba(37,99,168,0)} }
  .fl-line { width:2px; flex:1; min-height:14px; margin:2px 0; border-radius:2px; }
  .fl-line.done { background:var(--g); opacity:.4; } .fl-line.pen { background:var(--border); }
  .fl-body { flex:1; background:var(--surface); border:1.5px solid var(--border); border-radius:10px; padding:11px 14px; margin-bottom:9px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
  .fl-body h4 { font-size:.81rem; font-weight:600; margin-bottom:3px; font-family:var(--serif); }
  .fl-body p { font-size:.71rem; color:var(--muted); line-height:1.5; }
  .tl { display:flex; flex-direction:column; }
  .tl-item { display:flex; gap:10px; }
  .tl-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; margin-top:5px; }
  .tl-g{background:var(--g)} .tl-b{background:var(--b)} .tl-x{background:var(--muted2)}
  .tl-body { padding-bottom:14px; }
  .tl-body h4 { font-size:.77rem; font-weight:600; margin-bottom:2px; }
  .tl-body p { font-size:.69rem; color:var(--muted); }
  .tl-conn { width:2px; min-height:10px; margin:2px 3px; border-radius:2px; } .tl-conn-g{background:rgba(61,122,74,.35)} .tl-conn-x{background:var(--border)}
  .override-bar { background:var(--ol); border:1.5px solid rgba(192,94,0,.2); border-radius:10px; padding:9px 13px; display:flex; align-items:center; gap:9px; font-size:.74rem; margin-bottom:10px; color:var(--o); }
  .ptag { font-family:var(--mono); font-size:.56rem; padding:2px 7px; border-radius:50px; margin:2px; display:inline-block; }
  .ptag-b{background:var(--bl);color:var(--b)} .ptag-p{background:var(--pl);color:var(--p)} .ptag-a{background:var(--al);color:var(--a)}
  .tag { font-family:var(--sans); font-size:.71rem; padding:4px 12px; border-radius:50px; cursor:pointer; border:1.5px solid var(--border); color:var(--muted); transition:all .15s; display:inline-block; margin:3px; font-weight:500; }
  .tag.on { background:var(--gl); border-color:var(--g); color:var(--g); font-weight:600; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
  .fi3 { animation:fadeIn .2s ease; }
  .empty { text-align:center; padding:36px; color:var(--muted2); font-size:.8rem; }
  hr { border:none; border-top:1px solid var(--border); margin:14px 0; }
  .pr { background:var(--s2); border-radius:10px; padding:16px; font-size:.74rem; line-height:1.8; color:var(--muted); white-space:pre-wrap; min-height:140px; border:1px solid var(--border); }
  .pr strong { color:var(--text); display:block; margin-bottom:8px; font-size:.8rem; font-family:var(--serif); font-weight:600; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

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
  {id:1,text:"Mia Sterns Dokumente hochgeladen",sub:"Lebenslauf + Motivationsschreiben · Prüfung ausstehend",time:"heute 10:05",dot:"fd-a",aktor:"Freiwillige/r"},
  {id:2,text:"Einsatzstelle empfiehlt Tom Becker",sub:"\"Sehr gute Unterlagen, Sprachkenntnisse top\"",time:"gestern 14:20",dot:"fd-p",aktor:"Einsatzstelle"},
  {id:3,text:"Einsatzbeschreibung für Tom Becker hochgeladen",sub:"Von Einsatzstelle — freigegeben",time:"gestern 11:30",dot:"fd-b",aktor:"Einsatzstelle"},
  {id:4,text:"Tom Beckers Lebenslauf freigegeben",sub:"",time:"25.05.2026",dot:"fd-g",aktor:"Verwaltung"},
  {id:5,text:"Felix Horn in Stellen-Pool freigegeben",sub:"Kann sich auf bis zu 2 Stellen bewerben",time:"20.05.2026",dot:"fd-g",aktor:"Verwaltung"},
];

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole] = useState("koordinator");
  const [view, setView] = useState("dashboard");
  const [candidates, setCandidates] = useState(initCandidates);
  const [feed, setFeed] = useState(initFeed);
  const [selId, setSelId] = useState(null);
  const [modal, setModal] = useState(null);

  const sel = candidates.find(c => c.id === selId);

  function addFeed(entry) { setFeed(f => [{ id: Date.now(), ...entry }, ...f]); }

  function updateC(id, fn) {
    setCandidates(cs => cs.map(c => c.id === id ? fn(c) : c));
  }

  // Role-specific nav
  const navDefs = {
    koordinator: [
      { id:"dashboard",   ico:"◈", label:"Dashboard" },
      { id:"prozess",     ico:"⟳", label:"Prozessfluss" },
      { id:"freiwillige", ico:"◉", label:"Freiwillige", badge: candidates.filter(c=>c.phase==="bewerbung").length, bt:"nib-r" },
      { id:"bewerbung",   ico:"◈", label:"Bewerbungsprozess" },
      { id:"stellenpool", ico:"◎", label:"Stellen-Pool" },
      { id:"dokumente",   ico:"◻", label:"Dokument-Review", badge: candidates.flatMap(c=>[...c.docs.frei,...c.docs.es]).filter(d=>d.status==="hochgeladen").length, bt:"nib-a" },
      { id:"monitoring",  ico:"◉", label:"Monitoring Feed", badge: candidates.flatMap(c=>c.docs.anf).filter(a=>a.status==="wartet").length, bt:"nib-r" },
      { id:"kommunikation",ico:"💬",label:"Kommunikation" },
    ],
    einsatzstelle: [
      { id:"bewerber",    ico:"◈", label:"Meine Bewerber" },
      { id:"es-dokumente",ico:"◻", label:"Dokumente" },
      { id:"kommunikation",ico:"💬",label:"Kommunikation" },
    ],
    freiwilliger: [
      { id:"meine-bewerbung",ico:"◈",label:"Meine Bewerbung" },
      { id:"kommunikation",  ico:"💬",label:"Kommunikation" },
    ],
  };

  function switchRole(r) {
    setRole(r);
    setSelId(null);
    setView(r === "koordinator" ? "dashboard" : r === "einsatzstelle" ? "bewerber" : "meine-bewerbung");
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
            <h1>Freunde<br/>Waldorf</h1>
            <div className="ver">FREIWILLIGENDIENST · VERWALTUNG</div>
          </div>
          <div className="sb-sect"><span>Navigation</span></div>
          {navItems.map(n => (
            <div key={n.id} className={`ni ${view===n.id?"on":""}`} onClick={()=>{setView(n.id);setSelId(null);}}>
              <span className="ico">{n.ico}</span>
              {n.label}
              {n.badge>0 && <span className={`nib ${n.bt}`}>{n.badge}</span>}
            </div>
          ))}
          <div className="sb-bottom">
            <div className="role-box">
              <label>ANSICHT ALS</label>
              <select value={role} onChange={e=>switchRole(e.target.value)}>
                <option value="koordinator">NGO Koordinator</option>
                <option value="einsatzstelle">Einsatzstelle (Accra)</option>
                <option value="freiwilliger">Freiwillige/r (Mia Stern)</option>
              </select>
            </div>
            <div className="ctx-box">
              <label>KONTEXT</label>
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
            {/* KOORDINATOR VIEWS */}
            {role==="koordinator" && view==="dashboard"      && <DashboardView candidates={candidates} feed={feed} setView={setView} setModal={setModal} />}
            {role==="koordinator" && view==="prozess"        && <ProzessView />}
            {role==="koordinator" && view==="freiwillige"    && <FreiwilligeView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
            {role==="koordinator" && view==="bewerbung"      && <BewerbungView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
            {role==="koordinator" && view==="stellenpool"    && <StellenPoolView />}
            {role==="koordinator" && view==="dokumente"      && <DokumentReviewView candidates={candidates} updateC={updateC} addFeed={addFeed} />}
            {role==="koordinator" && view==="monitoring"     && <MonitoringView candidates={candidates} feed={feed} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
            {role==="koordinator" && view==="kommunikation"  && <KommunikationView role={role} />}
            {/* EINSATZSTELLE VIEWS */}
            {role==="einsatzstelle" && view==="bewerber"     && <BewerberView candidates={candidates} sel={sel} selId={selId} setSelId={setSelId} updateC={updateC} addFeed={addFeed} setModal={setModal} />}
            {role==="einsatzstelle" && view==="es-dokumente" && <EsDokumenteView candidates={candidates} updateC={updateC} addFeed={addFeed} />}
            {role==="einsatzstelle" && view==="kommunikation"&& <KommunikationView role={role} />}
            {/* FREIWILLIGER VIEWS */}
            {role==="freiwilliger" && view==="meine-bewerbung"&& <MeineBewerbungView candidate={mia} updateC={updateC} addFeed={addFeed} />}
            {role==="freiwilliger" && view==="kommunikation" && <KommunikationView role={role} />}
          </div>
        </div>

        {/* MODALS */}
        {modal?.type==="kommentar"   && <KommentarModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(t,ty)=>{const k={von:role==="einsatzstelle"?"Einsatzstelle":"Verwaltung",text:t,zeit:"gerade",type:ty};updateC(modal.cid,c=>({...c,kommentare:[k,...c.kommentare],bewStatus:ty==="empfehlung"?"empfohlen":ty==="bedenken"?"bedenken":c.bewStatus}));addFeed({text:`${k.von}: ${ty} für ${candidates.find(x=>x.id===modal.cid)?.name}`,sub:`"${t.slice(0,55)}${t.length>55?"…":""}"`,time:"gerade",dot:"fd-p",aktor:k.von});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="anforderung" && <AnforderungModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(name,mode)=>{const a={id:`anf_${Date.now()}`,name,mode,status:mode==="direkt"?"angefordert":"wartet",am:"gerade"};updateC(modal.cid,c=>({...c,docs:{...c.docs,anf:[...c.docs.anf,a]}}));addFeed({text:`Einsatzstelle fordert "${name}" von ${candidates.find(x=>x.id===modal.cid)?.name}`,sub:mode==="direkt"?"Direkt · n8n sendet Mail":"Wartet auf Verwaltungsfreigabe",time:"gerade",dot:mode==="direkt"?"fd-o":"fd-p",aktor:"Einsatzstelle"});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="uploadEs"    && <UploadEsModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(name)=>{const d={id:`es_${Date.now()}`,name,status:"hochgeladen",up:"heute",esFreigabe:false};updateC(modal.cid,c=>({...c,docs:{...c.docs,es:[...c.docs.es,d]}}));addFeed({text:`Einsatzstelle lädt "${name}" hoch`,sub:`Für ${candidates.find(x=>x.id===modal.cid)?.name} · Verwaltungsfreigabe ausstehend`,time:"gerade",dot:"fd-b",aktor:"Einsatzstelle"});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="override"    && <OverrideModal c={candidates.find(x=>x.id===modal.cid)} onSubmit={(s)=>{updateC(modal.cid,c=>({...c,bewStatus:s}));addFeed({text:`Verwaltung überschreibt Status: ${candidates.find(x=>x.id===modal.cid)?.name} → "${s}"`,sub:"Manuelle Überschreibung",time:"gerade",dot:"fd-o",aktor:"Verwaltung"});setModal(null);}} onClose={()=>setModal(null)} />}
        {modal?.type==="freigabe"    && <FreigabeModal c={candidates.find(x=>x.id===modal.cid)} onFreigeben={(cid,anfId)=>{updateC(cid,c=>({...c,docs:{...c.docs,anf:c.docs.anf.map(a=>a.id===anfId?{...a,status:"angefordert"}:a)}}));addFeed({text:`Verwaltung gibt Anforderung frei`,sub:`${candidates.find(x=>x.id===cid)?.name}`,time:"gerade",dot:"fd-g",aktor:"Verwaltung"});setModal(null);}} onBlockieren={(cid,anfId)=>{updateC(cid,c=>({...c,docs:{...c.docs,anf:c.docs.anf.map(a=>a.id===anfId?{...a,status:"blockiert"}:a)}}));addFeed({text:`Verwaltung blockiert Anforderung`,sub:`${candidates.find(x=>x.id===cid)?.name}`,time:"gerade",dot:"fd-r",aktor:"Verwaltung"});setModal(null);}} onClose={()=>setModal(null)} candidates={candidates} />}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_TITLES = { dashboard:"Dashboard", prozess:"Prozessfluss", freiwillige:"Freiwillige", bewerbung:"Bewerbungsprozess", stellenpool:"Stellen-Pool", dokumente:"Dokument-Review", monitoring:"Monitoring Feed", kommunikation:"Kommunikation", bewerber:"Meine Bewerber", "es-dokumente":"Dokumente", "meine-bewerbung":"Meine Bewerbung" };

function Topbar({ view, role, sel, setModal }) {
  return (
    <div className="topbar">
      <div>
        <h2>{VIEW_TITLES[view] || view}</h2>
        <div className="tsub">{ROLES[role].ctx}</div>
      </div>
      <div className="topbar-r">
        {role==="einsatzstelle" && view==="bewerber" && sel && (<>
          <button className="btn btn-pp btn-sm" onClick={()=>setModal({type:"anforderung",cid:sel.id})}>+ Dok. anfordern</button>
          <button className="btn btn-pb btn-sm" onClick={()=>setModal({type:"uploadEs",cid:sel.id})}>↑ Dok. hochladen</button>
          <button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"kommentar",cid:sel.id})}>✎ Kommentar</button>
        </>)}
        {role==="koordinator" && ["bewerbung","freiwillige","bewerber"].includes(view) && sel && (
          <button className="btn btn-pa btn-sm" onClick={()=>setModal({type:"override",cid:sel.id})}>⚡ Status überschreiben</button>
        )}
        {role==="koordinator" && view==="monitoring" && (
          <button className="btn btn-pr btn-sm" onClick={()=>setModal({type:"freigabe"})}>⚡ Anforderungen prüfen</button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SBadge({ s }) {
  const m = { neu:"bb",qualifiziert:"bb",beworben:"ba",empfohlen:"bg",bedenken:"ba",angenommen:"bgs",platziert:"bgs",aktiv:"bgs",abgelehnt:"br",abgeschlossen:"bx",wartend:"bx" };
  return <span className={`bdg ${m[s]||"bx"}`}>{s}</span>;
}
function DocBadge({ s }) {
  const m = { hochgeladen:"ba",freigegeben:"bg",ausstehend:"bx",abgelehnt:"br",angefordert:"bo",wartet:"bp",blockiert:"br" };
  return <span className={`bdg ${m[s]||"bx"}`}>{s}</span>;
}

function CandidateList({ candidates, selId, setSelId, filter }) {
  const list = filter ? candidates.filter(filter) : candidates;
  const sc = (s) => s >= 85 ? "var(--g)" : s >= 65 ? "var(--a)" : "var(--r)";
  return (
    <div>
      {list.map(c => (
        <div key={c.id} className={`cc ${selId===c.id?"on":""}`} onClick={()=>setSelId(c.id)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><h4>{c.name}</h4><div className="csub">{c.email} · {c.alter} J.</div></div>
            {c.matchScore!=null && <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--mono)",fontSize:".85rem",fontWeight:600,color:sc(c.matchScore)}}>{c.matchScore}%</div><div style={{fontSize:".58rem",color:"var(--muted)",fontFamily:"var(--mono)"}}>Match</div></div>}
          </div>
          <div className="ctags" style={{marginBottom:7}}>
            {c.sprachen.map(s=><span key={s} className="ct ct-b">{s}</span>)}
            {c.interessen.map(i=><span key={i} className="ct ct-p">{i}</span>)}
            <span className="ct ct-a">{c.dauer}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <SBadge s={c.bewStatus} />
            {c.kommentare.length>0 && <span style={{fontSize:".63rem",color:"var(--muted)"}}>💬 {c.kommentare.length}</span>}
          </div>
        </div>
      ))}
      {list.length===0 && <div className="empty">Keine Einträge</div>}
    </div>
  );
}

function DocList({ docs, sourceLabel, iconMap, role, onApprove, onReject, onFreigabe }) {
  return docs.map(d => (
    <div key={d.id} className="di">
      <div className="dico">{iconMap?.[d.id] || "📄"}</div>
      <div className="dinfo">
        <h4>{d.name}</h4>
        <p>{d.status==="hochgeladen"?"Hochgeladen — Prüfung ausstehend":d.status==="freigegeben"?"Freigegeben ✓":d.status==="ausstehend"?"Noch nicht hochgeladen":d.status}</p>
        {d.up && <div className="dmeta">Hochgeladen {d.up}</div>}
      </div>
      <div className="dact">
        {role==="koordinator" && d.status==="hochgeladen" && onApprove && (<>
          <button className="btn btn-pg btn-xs" onClick={()=>onApprove(d.id)}>✓ Freigeben</button>
          <button className="btn btn-pr btn-xs" onClick={()=>onReject(d.id)}>✕</button>
        </>)}
        {role==="koordinator" && d.esFreigabe===false && onFreigabe && (
          <button className="btn btn-pg btn-xs" onClick={()=>onFreigabe(d.id)}>Freigeben</button>
        )}
        {(!onApprove && !onFreigabe) || (d.status!=="hochgeladen" && d.esFreigabe!==false) ? <DocBadge s={d.status} /> : null}
      </div>
    </div>
  ));
}

function CandidateDetail({ c, role, updateC, addFeed, setModal }) {
  const [tab, setTab] = useState("profil");

  function approveDoc(docId, docKey) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, [docKey]: x.docs[docKey].map(d => d.id===docId?{...d,status:"freigegeben"}:d) } }));
    addFeed({ text:`Verwaltung gibt Dokument frei`, sub:`${c.name}`, time:"gerade", dot:"fd-g", aktor:"Verwaltung" });
  }
  function rejectDoc(docId, docKey) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, [docKey]: x.docs[docKey].map(d => d.id===docId?{...d,status:"abgelehnt"}:d) } }));
    addFeed({ text:`Dokument abgelehnt — Upload-Anfrage an ${c.name}`, sub:"n8n sendet Mail", time:"gerade", dot:"fd-r", aktor:"Verwaltung" });
  }
  function freigabeEsDok(docId) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, es: x.docs.es.map(d => d.id===docId?{...d,esFreigabe:true}:d) } }));
    addFeed({ text:`Einsatzstellen-Dokument freigegeben`, sub:`Für ${c.name}`, time:"gerade", dot:"fd-g", aktor:"Verwaltung" });
  }
  function freigabeAnf(anfId) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, anf: x.docs.anf.map(a => a.id===anfId?{...a,status:"angefordert"}:a) } }));
    addFeed({ text:`Anforderung freigegeben`, sub:`${c.name}`, time:"gerade", dot:"fd-g", aktor:"Verwaltung" });
  }
  function blockAnf(anfId) {
    updateC(c.id, x => ({ ...x, docs: { ...x.docs, anf: x.docs.anf.map(a => a.id===anfId?{...a,status:"blockiert"}:a) } }));
    addFeed({ text:`Anforderung blockiert`, sub:`${c.name}`, time:"gerade", dot:"fd-r", aktor:"Verwaltung" });
  }

  const tabs = ["profil","dokumente","kommentare"];
  const pendingAnf = c.docs.anf.filter(a=>a.status==="wartet");

  return (
    <div className="card fi3">
      <div className="card-h">
        <div><h3>{c.name}</h3><div className="sub">{c.stelle||"Noch nicht platziert"}</div></div>
        <SBadge s={c.bewStatus} />
      </div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border)",padding:"0 16px"}}>
        {tabs.map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:"9px 11px",fontSize:".73rem",cursor:"pointer",borderBottom:tab===t?"2px solid var(--b)":"2px solid transparent",color:tab===t?"var(--b)":"var(--muted)",marginBottom:-1,textTransform:"capitalize",fontWeight:tab===t?500:400,transition:"all .15s"}}>
            {t}
            {t==="kommentare"&&c.kommentare.length>0 && <span style={{marginLeft:4,fontFamily:"var(--mono)",fontSize:".57rem",background:"rgba(167,139,250,.15)",color:"var(--p)",padding:"1px 5px",borderRadius:8}}>{c.kommentare.length}</span>}
            {t==="dokumente" && <span style={{marginLeft:4,fontFamily:"var(--mono)",fontSize:".57rem",background:"rgba(56,189,248,.12)",color:"var(--b)",padding:"1px 5px",borderRadius:8}}>{c.docs.frei.length+c.docs.es.length}</span>}
          </div>
        ))}
      </div>
      <div className="card-b">
        {tab==="profil" && (
          <div>
            {role==="koordinator" && <div className="override-bar"><span>⚡</span><span style={{flex:1,fontSize:".72rem"}}>Verwaltung kann Status direkt überschreiben</span><button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"override",cid:c.id})}>Überschreiben</button></div>}
            {role==="einsatzstelle" && <div className="al al-b"><i>ℹ</i><span>Sie können Kommentare und Empfehlungen hinterlassen. Die finale Entscheidung liegt bei der NGO-Zentrale.</span></div>}
            <div className="slbl">KRITERIEN</div>
            {[["Sprachen",c.sprachen.join(", ")],["Interessen",c.interessen.join(", ")],["Verfügbar",c.verfügbar],["Dauer",c.dauer]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(42,47,66,.4)",fontSize:".77rem"}}>
                <span style={{color:"var(--muted)"}}>{k}</span><span style={{fontWeight:500}}>{v}</span>
              </div>
            ))}
            {c.matchScore!=null && <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:".77rem"}}><span style={{color:"var(--muted)"}}>Match-Score</span><span style={{fontWeight:600,color:c.matchScore>=85?"var(--g)":c.matchScore>=65?"var(--a)":"var(--r)"}}>{c.matchScore}%</span></div>}
            <div className="slbl" style={{marginTop:14}}>PROZESS TIMELINE</div>
            <div className="tl">
              {[["Grundbewerbung eingereicht","done"],["Freigegeben / Qualifiziert",["pool","dokumente","platziert","aktiv"].includes(c.phase)?"done":"pen"],["Stellenbewerbung",["dokumente","platziert","aktiv"].includes(c.phase)?"done":"pen"],["Dokumente hochgeladen",["platziert","aktiv"].includes(c.phase)?"done":c.phase==="dokumente"?"act":"pen"],["Platziert",c.phase==="platziert"||c.phase==="aktiv"?"done":"pen"]].map(([label,state],i,arr)=>(
                <div key={i} className="tl-item">
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div className={`tl-dot ${state==="done"?"tl-g":state==="act"?"tl-b":"tl-x"}`}/>
                    {i<arr.length-1 && <div className={`tl-conn ${state==="done"?"tl-conn-g":"tl-conn-x"}`} style={{height:18}}/>}
                  </div>
                  <div className="tl-body"><h4 style={{color:state==="done"?"var(--g)":state==="act"?"var(--b)":"var(--muted)",fontSize:".75rem"}}>{label}</h4></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="dokumente" && (
          <div>
            {pendingAnf.length>0 && role==="koordinator" && (
              <>
                <div className="slbl">⚡ ANFORDERUNGEN WARTEN AUF FREIGABE</div>
                {c.docs.anf.filter(a=>a.status==="wartet").map(a=>(
                  <div key={a.id} className="al al-o">
                    <i>📋</i>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:".77rem",marginBottom:2}}>„{a.name}" angefordert von Einsatzstelle</div>
                      <div style={{fontSize:".7rem",color:"var(--muted2)"}}>Via Verwaltung — Freigabe erforderlich</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-pg btn-xs" onClick={()=>freigabeAnf(a.id)}>Freigeben</button>
                      <button className="btn btn-pr btn-xs" onClick={()=>blockAnf(a.id)}>Blockieren</button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {c.docs.anf.length>0 && (
              <>
                <div className="slbl">ANFORDERUNGEN AN FREIWILLIGE/N</div>
                {c.docs.anf.map(a=>(
                  <div key={a.id} className="di">
                    <div className="dico">📋</div>
                    <div className="dinfo"><h4>{a.name}</h4><p>{a.mode==="direkt"?"Direkt angefordert":"Via Verwaltung"}</p><div className="dmeta">Einsatzstelle · {a.am}</div></div>
                    <DocBadge s={a.status} />
                  </div>
                ))}
              </>
            )}
            <div className="slbl">DOKUMENTE VOM/VON FREIWILLIGE/N</div>
            <DocList docs={c.docs.frei} iconMap={{cv:"📄",ml:"✉️"}} role={role} onApprove={role==="koordinator"?id=>approveDoc(id,"frei"):null} onReject={role==="koordinator"?id=>rejectDoc(id,"frei"):null} />
            <div className="slbl">DOKUMENTE VON EINSATZSTELLE</div>
            {c.docs.es.length===0 ? <div style={{fontSize:".74rem",color:"var(--muted)",padding:"8px 0"}}>Noch keine Dokumente hochgeladen</div>
            : <DocList docs={c.docs.es} iconMap={{}} role={role} onFreigabe={role==="koordinator"?id=>freigabeEsDok(id):null} />}
          </div>
        )}
        {tab==="kommentare" && (
          <div>
            {c.kommentare.length===0 ? <div style={{fontSize:".74rem",color:"var(--muted)",padding:"8px 0"}}>Noch keine Kommentare</div>
            : c.kommentare.map((k,i)=>(
              <div key={i} className="cmt">
                <div className="cf"><span>{k.von}</span><span className={`bdg ${k.type==="empfehlung"?"bg":k.type==="bedenken"?"ba":"bb"}`}>{k.type}</span></div>
                <div className="ct2">{k.text}</div>
                <div className="ctime">{k.zeit}</div>
              </div>
            ))}
            {role==="koordinator" && c.kommentare.length>0 && <div className="al al-b" style={{marginTop:10}}><i>ℹ</i><span>Finale Entscheidung liegt bei der Verwaltung.</span></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KOORDINATOR VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView({ candidates, feed, setView, setModal }) {
  const active = candidates.filter(c=>c.phase==="aktiv").length;
  const placed = candidates.filter(c=>["platziert","aktiv"].includes(c.phase)).length;
  const pending = candidates.filter(c=>c.phase==="bewerbung").length;
  const pendingDocs = candidates.flatMap(c=>[...c.docs.frei,...c.docs.es]).filter(d=>d.status==="hochgeladen").length;
  const pendingAnf = candidates.flatMap(c=>c.docs.anf).filter(a=>a.status==="wartet").length;

  return (
    <div className="fi3">
      <div className="g4" style={{marginBottom:20}}>
        <div className="sc"><div className="sl">AKTIVE FREIWILLIGE</div><div className="sv" style={{color:"var(--g)"}}>{active}</div><div className="sd">Im Einsatz</div></div>
        <div className="sc"><div className="sl">PLATZIERT</div><div className="sv">{placed}</div><div className="sd">Gesamt bestätigt</div></div>
        <div className="sc"><div className="sl">NEUE BEWERBUNGEN</div><div className="sv" style={{color:"var(--a)"}}>{pending}</div><div className="sd">→ Prüfung nötig</div></div>
        <div className="sc"><div className="sl">OFFENE DOCS</div><div className="sv" style={{color:"var(--r)"}}>{pendingDocs}</div><div className="sd">Warten auf Review</div></div>
      </div>

      {(pending>0||pendingDocs>0||pendingAnf>0) && (
        <div style={{marginBottom:20}}>
          {pending>0 && <div className="al al-a"><i>⚠</i><span><strong>{pending} neue Bewerbung{pending>1?"en":""}</strong> wartet{pending===1?"":"en"} auf Prüfung</span><button className="btn btn-pg btn-sm" style={{marginLeft:"auto"}} onClick={()=>setView("bewerbung")}>Prüfen →</button></div>}
          {pendingDocs>0 && <div className="al al-r"><i>📎</i><span><strong>{pendingDocs} Dokument{pendingDocs>1?"e":""}</strong> wartet{pendingDocs===1?"":"en"} auf Freigabe</span><button className="btn btn-pg btn-sm" style={{marginLeft:"auto"}} onClick={()=>setView("dokumente")}>Review →</button></div>}
          {pendingAnf>0 && <div className="al al-o"><i>📋</i><span><strong>{pendingAnf} Anforderung{pendingAnf>1?"en":""}</strong> warte{pendingAnf===1?"t":"n"} auf Freigabe (Einsatzstelle)</span><button className="btn btn-pa btn-sm" style={{marginLeft:"auto"}} onClick={()=>setModal({type:"freigabe"})}>Freigeben →</button></div>}
        </div>
      )}

      <div className="g2">
        <div className="card">
          <div className="card-h"><h3>Alle Freiwilligen</h3></div>
          <table><thead><tr><th>NAME</th><th>PHASE</th><th>STELLE</th></tr></thead><tbody>
            {candidates.map(c=>(
              <tr key={c.id} className="cl">
                <td><div style={{fontWeight:500}}>{c.name}</div><div style={{fontSize:".68rem",color:"var(--muted)"}}>{c.email}</div></td>
                <td><SBadge s={c.bewStatus} /></td>
                <td style={{fontSize:".74rem",color:"var(--muted)"}}>{c.stelle||"—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div className="card">
          <div className="card-h"><h3>Aktivitäts-Feed</h3></div>
          <div className="card-b">
            <div className="feed">
              {feed.slice(0,6).map(f=>(
                <div key={f.id} className="fi2">
                  <div className={`fdot ${f.dot}`}/>
                  <div className="fb">
                    <div className="ft">{f.text}<span className="atag" style={{background:f.aktor==="Verwaltung"?"var(--ol)":f.aktor==="Einsatzstelle"?"var(--bl)":"var(--al)",color:f.aktor==="Verwaltung"?"var(--o)":f.aktor==="Einsatzstelle"?"var(--b)":"var(--a)"}}>{f.aktor}</span></div>
                    {f.sub && <div className="fs">{f.sub}</div>}
                    <div className="fm">{f.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProzessView() {
  const steps = [
    {n:"1",title:"Grundbewerbung",desc:"Freiwilliger füllt Anmeldeformular aus (Kriterien: Sprache, Verfügbarkeit, Interessen)",tools:["Formbricks","n8n","NocoDB"],state:"done"},
    {n:"2",title:"Prüfung & Freigabe",desc:"Koordinator prüft Unterlagen, gibt Freiwillige/n für Stellen-Pool frei",tools:["NocoDB","Mailpit"],state:"done"},
    {n:"3",title:"Stellenwahl",desc:"Freiwilliger sieht gefilterten Pool, bewirbt sich auf bis zu 2 Stellen",tools:["NocoDB","n8n"],state:"done"},
    {n:"4",title:"Einsatzstelle prüft",desc:"Einsatzstelle sieht Bewerber, hinterlässt Kommentar/Empfehlung",tools:["NocoDB","Rocket.Chat"],state:"act"},
    {n:"5",title:"Dokumente",desc:"Freiwilliger lädt Docs hoch, Einsatzstelle kann weitere anfordern (direkt oder via Verwaltung)",tools:["Formbricks","NocoDB","Mailpit"],state:"pen"},
    {n:"6",title:"Placement",desc:"Verwaltung gibt alles frei, Placement wird bestätigt, alle Parteien erhalten Bestätigung",tools:["NocoDB","n8n","Mailpit","Rocket.Chat"],state:"pen"},
    {n:"7",title:"Einsatz aktiv",desc:"Monatliche Check-ins, Kommunikation über Rocket.Chat, Einsatzstellen-Feedback",tools:["Rocket.Chat","Formbricks","n8n"],state:"pen"},
    {n:"8",title:"Abschluss",desc:"Abschlussberichte, Archivierung, Alumni-Status",tools:["NocoDB","Formbricks"],state:"pen"},
  ];
  const tc = {Formbricks:"ba",n8n:"br","NocoDB":"bb","Rocket.Chat":"bg","Mailpit":"bx"};
  return (
    <div className="fi3" style={{maxWidth:620}}>
      <p style={{fontSize:".8rem",color:"var(--muted)",marginBottom:20}}>Vollständiger Prozessfluss über alle drei Parteien — Freiwillige/r, Einsatzstelle und NGO-Verwaltung.</p>
      {steps.map((s,i)=>(
        <div key={i} className="flow-item">
          <div className="fl-left">
            <div className={`fl-dot ${s.state}`}>{s.n}</div>
            {i<steps.length-1 && <div className={`fl-line ${s.state==="done"?"done":"pen"}`} style={{height:30}}/>}
          </div>
          <div className="fl-body">
            <h4>{s.title}</h4><p>{s.desc}</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
              {s.tools.map(t=><span key={t} className={`bdg ${tc[t]||"bx"}`} style={{fontSize:".56rem"}}>{t}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FreiwilligeView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  return (
    <div className="split-l fi3">
      <CandidateList candidates={candidates} selId={selId} setSelId={setSelId} />
      <div>{sel ? <CandidateDetail c={sel} role="koordinator" updateC={updateC} addFeed={addFeed} setModal={setModal} /> : <div className="card"><div className="empty">Freiwillige/n auswählen</div></div>}</div>
    </div>
  );
}

function BewerbungView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  return (
    <div className="split-l fi3">
      <div>
        <div className="slbl">NACH PHASE</div>
        {["bewerbung","pool","dokumente","platziert","aktiv"].map(ph=>{
          const list = candidates.filter(c=>c.phase===ph);
          if (!list.length) return null;
          const phLabel = {bewerbung:"Grundbewerbung",pool:"Stellen-Pool",dokumente:"Dokumente",platziert:"Platziert",aktiv:"Aktiv"};
          return (
            <div key={ph} style={{marginBottom:12}}>
              <div style={{fontFamily:"var(--mono)",fontSize:".57rem",color:"var(--muted)",letterSpacing:".08em",marginBottom:6,padding:"4px 8px",background:"var(--s2)",borderRadius:4,display:"inline-block"}}>{phLabel[ph]} ({list.length})</div>
              <CandidateList candidates={list} selId={selId} setSelId={setSelId} />
            </div>
          );
        })}
      </div>
      <div>
        {sel ? (
          <div>
            <CandidateDetail c={sel} role="koordinator" updateC={updateC} addFeed={addFeed} setModal={setModal} />
            {sel.phase==="bewerbung" && (
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button className="btn btn-pg" style={{flex:1}} onClick={()=>{updateC(sel.id,c=>({...c,phase:"pool",bewStatus:"qualifiziert"}));addFeed({text:`${sel.name} für Stellen-Pool freigegeben`,sub:"",time:"gerade",dot:"fd-g",aktor:"Verwaltung"});}}>✓ Für Pool freigeben</button>
                <button className="btn btn-pr" onClick={()=>{updateC(sel.id,c=>({...c,bewStatus:"abgelehnt"}));addFeed({text:`Bewerbung abgelehnt: ${sel.name}`,sub:"",time:"gerade",dot:"fd-r",aktor:"Verwaltung"});}}>Ablehnen</button>
              </div>
            )}
          </div>
        ) : <div className="card"><div className="empty">Bewerber auswählen</div></div>}
      </div>
    </div>
  );
}

function StellenPoolView() {
  const [fSpr, setFSpr] = useState(null);
  const [fFok, setFFok] = useState(null);
  const sprs = [...new Set(STELLE_POOL.flatMap(s=>s.spr))];
  const foks = [...new Set(STELLE_POOL.flatMap(s=>s.fok))];
  const list = STELLE_POOL.filter(s=>(!fSpr||s.spr.includes(fSpr))&&(!fFok||s.fok.includes(fFok)));
  const sc = (s) => s>=85?"var(--g)":s>=65?"var(--a)":"var(--r)";
  return (
    <div className="fi3">
      <div style={{marginBottom:16}}>
        <div className="slbl">FILTER SPRACHE</div>
        <div style={{marginBottom:10}}><span className={`tag ${!fSpr?"on":""}`} onClick={()=>setFSpr(null)}>Alle</span>{sprs.map(s=><span key={s} className={`tag ${fSpr===s?"on":""}`} onClick={()=>setFSpr(fSpr===s?null:s)}>{s}</span>)}</div>
        <div className="slbl">FILTER FOKUS</div>
        <div><span className={`tag ${!fFok?"on":""}`} onClick={()=>setFFok(null)}>Alle</span>{foks.map(f=><span key={f} className={`tag ${fFok===f?"on":""}`} onClick={()=>setFFok(fFok===f?null:f)}>{f}</span>)}</div>
      </div>
      <div className="g2" style={{gap:12}}>
        {list.map(s=>(
          <div key={s.id} className={`pc ${s.frei===0?"dis":""}`}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><h4>{s.name}</h4><span style={{fontSize:".72rem"}}>{s.land}</span></div>
            <div className="psub">{s.prog}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
              {s.spr.map(l=><span key={l} className="ptag ptag-b">{l}</span>)}
              {s.fok.map(f=><span key={f} className="ptag ptag-p">{f}</span>)}
              <span className="ptag ptag-a">{s.dur}</span>
            </div>
            <div style={{fontSize:".7rem",color:s.frei===0?"var(--r)":"var(--g)",fontFamily:"var(--mono)"}}>{s.frei===0?"ausgebucht":`${s.frei} Platz${s.frei!==1?"ä":""}${s.frei!==1?"tze":""} frei`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DokumentReviewView({ candidates, updateC, addFeed }) {
  const [actDoc, setActDoc] = useState(null);
  const allDocs = candidates.flatMap(c=>[
    ...c.docs.frei.map(d=>({...d,cid:c.id,cname:c.name,key:"frei",src:"Freiwillige/r",ico:d.id==="cv"?"📄":"✉️"})),
    ...c.docs.es.map(d=>({...d,cid:c.id,cname:c.name,key:"es",src:"Einsatzstelle",ico:"🏢"})),
  ]).filter(d=>d.status==="hochgeladen"||(d.esFreigabe===false&&d.status!=="hochgeladen"?false:d.status==="hochgeladen"));

  function approve(d) {
    updateC(d.cid,c=>({...c,docs:{...c.docs,[d.key]:c.docs[d.key].map(x=>x.id===d.id?{...x,status:"freigegeben",esFreigabe:true}:x)}}));
    setActDoc(x=>x?{...x,status:"freigegeben"}:x);
    addFeed({text:`Dokument freigegeben: ${d.name}`,sub:d.cname,time:"gerade",dot:"fd-g",aktor:"Verwaltung"});
  }
  function reject(d) {
    updateC(d.cid,c=>({...c,docs:{...c.docs,[d.key]:c.docs[d.key].map(x=>x.id===d.id?{...x,status:"abgelehnt"}:x)}}));
    setActDoc(x=>x?{...x,status:"abgelehnt"}:x);
    addFeed({text:`Dokument abgelehnt — Upload-Anfrage an ${d.cname}`,sub:"n8n sendet Mail",time:"gerade",dot:"fd-r",aktor:"Verwaltung"});
  }

  return (
    <div className="split-r fi3">
      <div>
        <div className="slbl">OFFENE PRÜFUNGEN ({allDocs.length})</div>
        {allDocs.length===0 && <div className="empty">Alle geprüft ✓</div>}
        {allDocs.map((d,i)=>(
          <div key={i} className={`di cl ${actDoc?.id===d.id&&actDoc?.cid===d.cid?"on":""}`} onClick={()=>setActDoc(d)}>
            <div className="dico">{d.ico}</div>
            <div className="dinfo"><h4>{d.name}</h4><p>{d.cname} · {d.src}</p>{d.up&&<div className="dmeta">Hochgeladen {d.up}</div>}</div>
            <DocBadge s={d.status} />
          </div>
        ))}
      </div>
      <div>
        {actDoc ? (
          <div className="card fi3">
            <div className="card-h"><div><h3>{actDoc.name}</h3><div className="sub">{actDoc.cname} · {actDoc.src}</div></div><DocBadge s={actDoc.status} /></div>
            <div className="card-b">
              {actDoc.content ? <div className="pr"><strong>{actDoc.name}</strong>{actDoc.content}</div> : <div className="pr" style={{display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Kein Inhalt verfügbar</div>}
              {actDoc.status==="hochgeladen" && actDoc.content && (
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="btn btn-pg" style={{flex:1}} onClick={()=>approve(actDoc)}>✓ Freigeben</button>
                  <button className="btn btn-pr" onClick={()=>reject(actDoc)}>✕ Ablehnen</button>
                </div>
              )}
              {actDoc.status==="freigegeben" && <div className="al al-g" style={{margin:0}}><i>✓</i><span>Freigegeben — n8n benachrichtigt alle Parteien</span></div>}
              {actDoc.status==="abgelehnt" && <div className="al al-r" style={{margin:0}}><i>✕</i><span>Abgelehnt — Upload-Aufforderung gesendet</span></div>}
            </div>
          </div>
        ) : <div className="card"><div className="empty">Dokument auswählen</div></div>}
      </div>
    </div>
  );
}

function MonitoringView({ candidates, feed, updateC, addFeed, setModal }) {
  const pendingAnf = candidates.flatMap(c=>c.docs.anf.filter(a=>a.status==="wartet").map(a=>({...a,cid:c.id,cname:c.name})));
  return (
    <div className="g2 fi3">
      <div>
        {pendingAnf.length>0 && (
          <>
            <div className="slbl">⚡ AKTIONEN ERFORDERLICH ({pendingAnf.length})</div>
            {pendingAnf.map(a=>(
              <div key={a.id} className="al al-o" style={{marginBottom:10}}>
                <i>📋</i>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:".77rem",marginBottom:2}}>Anforderung: „{a.name}"</div><div style={{fontSize:".7rem",color:"var(--muted2)"}}>Von {a.cname} angefordert via Einsatzstelle</div></div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn btn-pg btn-xs" onClick={()=>{updateC(a.cid,c=>({...c,docs:{...c.docs,anf:c.docs.anf.map(x=>x.id===a.id?{...x,status:"angefordert"}:x)}}));addFeed({text:`Anforderung freigegeben: „${a.name}"`,sub:a.cname,time:"gerade",dot:"fd-g",aktor:"Verwaltung"});}}>Freigeben</button>
                  <button className="btn btn-pr btn-xs" onClick={()=>{updateC(a.cid,c=>({...c,docs:{...c.docs,anf:c.docs.anf.map(x=>x.id===a.id?{...x,status:"blockiert"}:x)}}));addFeed({text:`Anforderung blockiert: „${a.name}"`,sub:a.cname,time:"gerade",dot:"fd-r",aktor:"Verwaltung"});}}>Blockieren</button>
                </div>
              </div>
            ))}
            <hr/>
          </>
        )}
        <div className="slbl">AKTIVITÄTS-FEED</div>
        <div className="card"><div className="card-b"><div className="feed">
          {feed.map(f=>(
            <div key={f.id} className="fi2">
              <div className={`fdot ${f.dot}`}/>
              <div className="fb">
                <div className="ft">{f.text}<span className="atag" style={{background:f.aktor==="Verwaltung"?"var(--ol)":f.aktor==="Einsatzstelle"?"var(--bl)":"var(--al)",color:f.aktor==="Verwaltung"?"var(--o)":f.aktor==="Einsatzstelle"?"var(--b)":"var(--a)"}}>{f.aktor}</span></div>
                {f.sub&&<div className="fs">{f.sub}</div>}
                <div className="fm">{f.time}</div>
              </div>
            </div>
          ))}
        </div></div></div>
      </div>
      <div>
        <div className="slbl">KANDIDATEN-STATUS</div>
        <div className="g2" style={{gap:10,marginBottom:16}}>
          <div className="sc"><div className="sl">GESAMT</div><div className="sv">{candidates.length}</div></div>
          <div className="sc"><div className="sl">EMPFOHLEN</div><div className="sv" style={{color:"var(--g)"}}>{candidates.filter(c=>c.bewStatus==="empfohlen").length}</div></div>
          <div className="sc"><div className="sl">AKTIONEN</div><div className="sv" style={{color:"var(--r)"}}>{pendingAnf.length}</div></div>
          <div className="sc"><div className="sl">FEED</div><div className="sv">{feed.length}</div></div>
        </div>
        <div className="card"><table>
          <thead><tr><th>NAME</th><th>STATUS</th><th>DOCS</th></tr></thead>
          <tbody>{candidates.map(c=>(
            <tr key={c.id}><td style={{fontWeight:500,fontSize:".77rem"}}>{c.name}</td><td><SBadge s={c.bewStatus}/></td>
            <td><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{c.docs.frei.map(d=><span key={d.id} className={`bdg ${d.status==="freigegeben"?"bg":d.status==="hochgeladen"?"ba":"bx"}`} style={{fontSize:".54rem"}}>{d.name.split(" ")[0]}</span>)}</div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

function KommunikationView({ role }) {
  const msgs = [
    {sender:"Carlos Ruiz (Oaxaca)",text:"Anna macht super Arbeit, sehr engagiert bei den Pflanzaktionen",time:"heute 09:12",ch:"#umwelt-mx-2026"},
    {sender:"Anna Müller",text:"Frage zu meinem Rückflugdatum — wurde das schon gebucht?",time:"heute 08:45",ch:"#anna-mueller"},
    {sender:"Kwame Asante (Accra)",text:"Brauchen dringend einen weiteren Freiwilligen für September",time:"gestern 16:30",ch:"#bildung-gh-2026"},
    {sender:"System (n8n)",text:"Neue Bewerbung eingegangen: Max Klein → Naturschutz Oaxaca",time:"gestern 14:05",ch:"#koordinatoren"},
  ];
  const mails = [
    {from:"Bewerbungseingang",text:"Mia Stern → Schule Accra Nord — Bestätigung gesendet",time:"heute 10:05",c:"var(--a)"},
    {from:"Placement Bestätigung",text:"Tom Becker → Schule Accra Nord — Mail an alle Parteien",time:"15.05.2026",c:"var(--g)"},
    {from:"Dok. abgelehnt",text:"Upload-Aufforderung an Freiwillige/n gesendet",time:"12.05.2026",c:"var(--r)"},
  ];
  const visible = role==="freiwilliger" ? msgs.filter(m=>m.ch.includes("anna")||m.ch.includes("koordinatoren")) : msgs;
  return (
    <div className="g2 fi3">
      <div className="card">
        <div className="card-h"><h3>💬 Rocket.Chat</h3></div>
        <div className="card-b">
          {visible.map((m,i)=>(
            <div key={i} style={{padding:"9px 0",borderBottom:"1px solid rgba(42,47,66,.4)"}}>
              <div style={{fontSize:".71rem",fontWeight:600,color:"var(--b)"}}>{m.sender}</div>
              <div style={{fontSize:".74rem",color:"var(--muted2)",marginTop:2,lineHeight:1.4}}>{m.text}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:".57rem",color:"var(--muted)",marginTop:3}}>{m.time} · {m.ch}</div>
            </div>
          ))}
        </div>
      </div>
      {role==="koordinator" && (
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-h"><h3>✉️ System-Mails (Mailpit)</h3></div>
            <div className="card-b">
              {mails.map((m,i)=>(
                <div key={i} style={{padding:"9px 0",borderBottom:"1px solid rgba(42,47,66,.4)"}}>
                  <div style={{fontSize:".71rem",fontWeight:600,color:m.c}}>{m.from}</div>
                  <div style={{fontSize:".74rem",color:"var(--muted2)",marginTop:2}}>{m.text}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:".57rem",color:"var(--muted)",marginTop:3}}>{m.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>⚙️ n8n Automation Status</h3></div>
            <div className="card-b">
              {[["✓","Formbricks → NocoDB","aktiv","var(--g)"],["✓","Placement → Mail","aktiv","var(--g)"],["✓","Dok. abgelehnt → Upload-Anfrage","aktiv","var(--g)"],["⚠","Check-in Cron (monatlich)","konfigurieren","var(--a)"],["○","Anforderung → Freiwilliger","ausstehend","var(--muted)"]].map(([ico,label,status,c],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(42,47,66,.35)",fontSize:".74rem"}}>
                  <span style={{color:c,fontFamily:"var(--mono)",width:14}}>{ico}</span>
                  <span style={{flex:1}}>{label}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:".6rem",color:c}}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EINSATZSTELLE VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function BewerberView({ candidates, sel, selId, setSelId, updateC, addFeed, setModal }) {
  const myC = candidates.filter(c=>c.stelle==="Schule Accra Nord"||c.phase==="aktiv"&&c.land==="Ghana");
  return (
    <div className="split-l fi3">
      <div>
        <div className="al al-b"><i>ℹ</i><span>Sie können Kommentare und Empfehlungen hinterlassen. Dokumente anfordern oder hochladen. Finale Entscheidung liegt bei der NGO-Zentrale.</span></div>
        <CandidateList candidates={myC} selId={selId} setSelId={setSelId} />
      </div>
      <div>
        {sel ? (
          <div>
            <CandidateDetail c={sel} role="einsatzstelle" updateC={updateC} addFeed={addFeed} setModal={setModal} />
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button className="btn btn-pp btn-sm" onClick={()=>setModal({type:"anforderung",cid:sel.id})}>+ Dokument anfordern</button>
              <button className="btn btn-pb btn-sm" onClick={()=>setModal({type:"uploadEs",cid:sel.id})}>↑ Dok. hochladen</button>
              <button className="btn btn-gh btn-sm" onClick={()=>setModal({type:"kommentar",cid:sel.id})}>✎ Kommentar</button>
            </div>
          </div>
        ) : <div className="card"><div className="empty">Bewerber auswählen</div></div>}
      </div>
    </div>
  );
}

function EsDokumenteView({ candidates, updateC, addFeed }) {
  const myC = candidates.filter(c=>c.stelle==="Schule Accra Nord");
  return (
    <div className="fi3">
      <div className="al al-b"><i>ℹ</i><span>Hier sehen Sie alle von Ihnen hochgeladenen Dokumente und Anforderungen. Dokumente der Verwaltung zur Freigabe eingereicht.</span></div>
      {myC.map(c=>(
        <div key={c.id} className="card" style={{marginBottom:14}}>
          <div className="card-h"><h3>{c.name}</h3><SBadge s={c.bewStatus}/></div>
          <div className="card-b">
            <div className="slbl">IHRE ANFORDERUNGEN</div>
            {c.docs.anf.length===0 ? <div style={{fontSize:".73rem",color:"var(--muted)",marginBottom:10}}>Keine Anforderungen gestellt</div>
            : c.docs.anf.map(a=>(
              <div key={a.id} className="di">
                <div className="dico">📋</div>
                <div className="dinfo"><h4>{a.name}</h4><p>{a.mode==="direkt"?"Direkt an Freiwillige/n":"Via Verwaltungsfreigabe"}</p></div>
                <DocBadge s={a.status}/>
              </div>
            ))}
            <div className="slbl">IHRE DOKUMENTE</div>
            {c.docs.es.length===0 ? <div style={{fontSize:".73rem",color:"var(--muted)"}}>Keine Dokumente hochgeladen</div>
            : c.docs.es.map(d=>(
              <div key={d.id} className="di">
                <div className="dico">🏢</div>
                <div className="dinfo"><h4>{d.name}</h4><p>{d.esFreigabe?"Freigegeben durch Verwaltung":"Wartet auf Verwaltungsfreigabe"}</p><div className="dmeta">Hochgeladen {d.up}</div></div>
                <span className={`bdg ${d.esFreigabe?"bg":"ba"}`}>{d.esFreigabe?"freigegeben":"ausstehend"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FREIWILLIGER VIEW
// ─────────────────────────────────────────────────────────────────────────────

function MeineBewerbungView({ candidate: c, updateC, addFeed }) {
  const [sel1, setSel1] = useState(c?.stelle||null);
  const [sel2, setSel2] = useState(null);
  const [docs, setDocs] = useState(c?.docs?.frei || []);
  const phase = c?.phase || "bewerbung";
  const stepLabels = ["Grundbewerbung","Stellenwahl","Dokumente","Platziert"];
  const phaseIdx = {bewerbung:0,pool:1,dokumente:2,platziert:3,aktiv:3}[phase] ?? 0;
  const scores = STELLE_POOL.map(s=>({...s,score:matchScore(c||{sprachen:[],interessen:[],dauer:""},s)})).sort((a,b)=>b.score-a.score);

  function upload(docId) {
    const newDocs = docs.map(d=>d.id===docId?{...d,status:"hochgeladen",up:"heute"}:d);
    setDocs(newDocs);
    updateC(c.id,x=>({...x,docs:{...x.docs,frei:newDocs}}));
    addFeed({text:`${c.name} lädt ${docId==="cv"?"Lebenslauf":"Motivationsschreiben"} hoch`,sub:"Prüfung durch Verwaltung ausstehend",time:"gerade",dot:"fd-a",aktor:"Freiwillige/r"});
  }

  function bewerbeAufStellen() {
    const stellen = [sel1,sel2].filter(Boolean);
    updateC(c.id,x=>({...x,phase:"dokumente",bewStatus:"beworben",stelle:sel1}));
    addFeed({text:`${c.name} bewirbt sich auf Stelle(n)`,sub:stellen.join(", "),time:"gerade",dot:"fd-b",aktor:"Freiwillige/r"});
  }

  return (
    <div className="fi3" style={{maxWidth:700}}>
      <div className="stepper">
        {stepLabels.map((label,i)=>(
          <div key={i} className="step" style={{flex:i<stepLabels.length-1?1:0}}>
            <div className={`sdot ${i<phaseIdx?"sdot-done":i===phaseIdx?"sdot-act":"sdot-pen"}`}>{i<phaseIdx?"✓":i+1}</div>
            <div className={`slabel ${i<phaseIdx?"slabel-done":i===phaseIdx?"slabel-act":"slabel-pen"}`}>{label}</div>
            {i<stepLabels.length-1 && <div className={`sline ${i<phaseIdx?"sline-done":""}`}/>}
          </div>
        ))}
      </div>

      {phase==="bewerbung" && (
        <div className="card fi3">
          <div className="card-h"><h3>Grundbewerbung</h3></div>
          <div className="card-b">
            <div className="g2">
              <div className="ff"><label>Vorname & Nachname</label><div className="fi">Mia Stern</div></div>
              <div className="ff"><label>Alter</label><div className="fi">24</div></div>
            </div>
            <div className="ff"><label>Sprachkenntnisse</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["Englisch B2","Spanisch A2","Deutsch Muttersprache"].map(s=><span key={s} className={`tag ${s==="Englisch B2"?"on":""}`}>{s}</span>)}</div></div>
            <div className="ff"><label>Interessen</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["Bildung","Umwelt","Gesundheit","Soziales"].map(s=><span key={s} className={`tag ${s==="Bildung"?"on":""}`}>{s}</span>)}</div></div>
            <div className="g2"><div className="ff"><label>Verfügbar ab</label><div className="fi">Juli 2026</div></div><div className="ff"><label>Einsatzdauer</label><select className="fsel"><option>12 Monate</option><option>6 Monate</option></select></div></div>
            <button className="btn btn-pg btn-block" style={{marginTop:8}} onClick={()=>updateC(c.id,x=>({...x,phase:"pool",bewStatus:"qualifiziert"}))}>Bewerbung einreichen →</button>
          </div>
        </div>
      )}

      {phase==="pool" && (
        <div className="fi3">
          <div className="al al-g"><i>✓</i><span>Freigegeben! Wähle bis zu <strong>2 Einsatzstellen</strong> aus.</span></div>
          {(sel1||sel2) && (
            <div style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",marginBottom:14,fontSize:".77rem",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{color:"var(--muted)"}}>Auswahl:</span>
              {sel1&&<span style={{color:"var(--b)"}}>① {sel1}</span>}
              {sel2&&<span style={{color:"var(--p)"}}>② {sel2}</span>}
              <button className="btn btn-pg btn-sm" style={{marginLeft:"auto"}} onClick={bewerbeAufStellen}>Bewerbung absenden →</button>
            </div>
          )}
          <div className="g2" style={{gap:12}}>
            {scores.map(s=>{
              const iS1=sel1===s.name, iS2=sel2===s.name, max=sel1&&sel2&&!iS1&&!iS2;
              const sc=s.score>=80?"var(--g)":s.score>=50?"var(--a)":"var(--r)";
              return (
                <div key={s.id} className={`pc ${iS1?"sel1":iS2?"sel2":s.frei===0||max?"dis":""}`}
                  onClick={()=>{if(s.frei===0||max)return;if(iS1){setSel1(sel2);setSel2(null);}else if(iS2)setSel2(null);else if(!sel1)setSel1(s.name);else if(!sel2)setSel2(s.name);}}>
                  {(iS1||iS2)&&<div style={{position:"absolute",top:10,right:10}}><span className={`bdg ${iS1?"bb":"bp"}`}>{iS1?"① Wahl":"② Wahl"}</span></div>}
                  <h4>{s.name}</h4><div className="psub">{s.land} · {s.prog}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                    {s.spr.map(l=><span key={l} className="ptag ptag-b">{l}</span>)}
                    {s.fok.map(f=><span key={f} className="ptag ptag-p">{f}</span>)}
                    <span className="ptag ptag-a">{s.dur}</span>
                  </div>
                  <div style={{marginBottom:4,display:"flex",justifyContent:"space-between",fontSize:".68rem"}}>
                    <span style={{color:"var(--muted)"}}>Passgenauigkeit</span>
                    <span style={{fontFamily:"var(--mono)",color:sc}}>{s.score}%</span>
                  </div>
                  <div className="mbar-bg"><div className="mbar-fill" style={{width:`${s.score}%`,background:sc}}/></div>
                  <div style={{fontSize:".68rem",color:s.frei===0?"var(--r)":"var(--muted)",fontFamily:"var(--mono)",marginTop:6}}>{s.frei===0?"ausgebucht":`${s.frei} Platz${s.frei!==1?"ä":""}${s.frei!==1?"tze":""} frei`}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase==="dokumente" && (
        <div className="fi3">
          <div className="al al-a"><i>📎</i><span>Du wurdest vorläufig vorgemerkt. Bitte lade jetzt deine Unterlagen hoch.</span></div>
          {docs.map(d=>(
            <div key={d.id} className="di">
              <div className="dico">{d.id==="cv"?"📄":"✉️"}</div>
              <div className="dinfo">
                <h4>{d.name}</h4>
                <p>{d.status==="ausstehend"?"Bitte hochladen — PDF, max 5 MB":d.status==="hochgeladen"?"Hochgeladen — wird geprüft":d.status==="freigegeben"?"✓ Freigegeben":"✕ Abgelehnt — neu hochladen"}</p>
              </div>
              <div className="dact">
                {(d.status==="ausstehend"||d.status==="abgelehnt")
                  ? <button className="btn btn-pb btn-sm" onClick={()=>upload(d.id)}>↑ Hochladen</button>
                  : <DocBadge s={d.status}/>}
              </div>
            </div>
          ))}
          {docs.every(d=>["hochgeladen","freigegeben"].includes(d.status)) && (
            <div className="al al-g"><i>✓</i><span>Alle Dokumente hochgeladen — Verwaltung prüft deine Unterlagen</span></div>
          )}
        </div>
      )}

      {(phase==="platziert"||phase==="aktiv") && (
        <div className="fi3">
          <div className="al al-g" style={{padding:"16px 18px"}}><i style={{fontSize:"1.4rem"}}>🎉</i><div><div style={{fontWeight:600,marginBottom:2}}>Herzlichen Glückwunsch — du wurdest platziert!</div><div style={{fontSize:".73rem",color:"var(--muted)"}}>Alle Dokumente freigegeben. Deine Koordination meldet sich mit weiteren Infos.</div></div></div>
          <div className="card"><div className="card-b">
            {[["Einsatzstelle",c.stelle||"—"],["Programm",c.programm||"—"],["Einsatzbeginn",c.seit||"—"],["Nächster Schritt","Vorgespräch mit Koordination"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(42,47,66,.4)",fontSize:".77rem"}}><span style={{color:"var(--muted)"}}>{k}</span><span style={{fontWeight:500,color:k==="Nächster Schritt"?"var(--b)":undefined}}>{v}</span></div>
            ))}
          </div></div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────

function KommentarModal({ c, onSubmit, onClose }) {
  const [text, setText] = useState(""); const [type, setType] = useState("empfehlung");
  return (
    <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mh"><h3>Kommentar zu {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div>
      <div className="mb">
        <div className="ff"><label>Typ</label><select className="fsel" value={type} onChange={e=>setType(e.target.value)}><option value="empfehlung">Empfehlung</option><option value="bedenken">Bedenken</option><option value="info">Info</option></select></div>
        <div className="ff"><label>Kommentar</label><textarea className="fta" placeholder="Ihre Einschätzung..." value={text} onChange={e=>setText(e.target.value)}/></div>
        <div className="al al-b"><i>ℹ</i><span>Sichtbar für NGO-Verwaltung. Finale Entscheidung liegt bei der Zentrale.</span></div>
      </div>
      <div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-pg" disabled={!text.trim()} onClick={()=>onSubmit(text,type)}>Senden</button></div>
    </div></div>
  );
}

function AnforderungModal({ c, onSubmit, onClose }) {
  const [typ, setTyp] = useState("Erweitertes Führungszeugnis"); const [mode, setMode] = useState("direkt"); const [custom, setCustom] = useState("");
  const opts = ["Erweitertes Führungszeugnis","Impfnachweis","Visa-Kopie","Sprachzertifikat","Versicherungsnachweis","Sonstiges"];
  return (
    <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mh"><h3>Dokument anfordern von {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div>
      <div className="mb">
        <div className="ff"><label>Dokument-Typ</label><select className="fsel" value={typ} onChange={e=>setTyp(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
        {typ==="Sonstiges" && <div className="ff"><label>Bezeichnung</label><input className="fi" placeholder="z.B. Referenzschreiben" value={custom} onChange={e=>setCustom(e.target.value)}/></div>}
        <div className="ff"><label>Modus</label><select className="fsel" value={mode} onChange={e=>setMode(e.target.value)}><option value="direkt">Direkt — n8n sendet sofort Mail</option><option value="via_verwaltung">Via Verwaltung — Freigabe nötig</option></select></div>
        <div className={`al ${mode==="direkt"?"al-o":"al-b"}`}><i>{mode==="direkt"?"⚡":"🔒"}</i><span>{mode==="direkt"?"Freiwillige/r wird direkt per Mail benachrichtigt.":"Anforderung wird zuerst der Verwaltung vorgelegt."}</span></div>
      </div>
      <div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-pg" onClick={()=>onSubmit(typ==="Sonstiges"?custom:typ,mode)}>Anfordern</button></div>
    </div></div>
  );
}

function UploadEsModal({ c, onSubmit, onClose }) {
  const [typ, setTyp] = useState("Einsatzbeschreibung");
  const opts = ["Einsatzbeschreibung","Hausordnung","Notfallprotokoll","Orientierungsplan","Sonstiges"];
  return (
    <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mh"><h3>Dokument hochladen für {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div>
      <div className="mb">
        <div className="ff"><label>Typ</label><select className="fsel" value={typ} onChange={e=>setTyp(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
        <div className="uz"><div className="uico">📎</div><p>PDF, DOCX oder JPG</p><span>Klicken oder Datei ziehen (simuliert)</span></div>
        <div className="al al-a"><i>ℹ</i><span>Dokumente werden durch die Verwaltung geprüft bevor sie für Freiwillige sichtbar sind.</span></div>
      </div>
      <div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-pg" onClick={()=>onSubmit(typ)}>Hochladen (simuliert)</button></div>
    </div></div>
  );
}

function OverrideModal({ c, onSubmit, onClose }) {
  const [status, setStatus] = useState("empfohlen");
  return (
    <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mh"><h3>Status überschreiben: {c?.name}</h3><button className="mc" onClick={onClose}>✕</button></div>
      <div className="mb">
        <div className="override-bar"><span>⚡</span><span>Verwaltungs-Override — überschreibt alle Kommentare</span></div>
        <div className="ff"><label>Neuer Status</label><select className="fsel" value={status} onChange={e=>setStatus(e.target.value)}><option value="neu">Neu</option><option value="qualifiziert">Qualifiziert</option><option value="empfohlen">Empfohlen</option><option value="bedenken">Bedenken</option><option value="angenommen">Angenommen</option><option value="abgelehnt">Abgelehnt</option><option value="wartend">Wartend</option></select></div>
      </div>
      <div className="mf"><button className="btn btn-gh" onClick={onClose}>Abbrechen</button><button className="btn btn-pa" onClick={()=>onSubmit(status)}>Status setzen</button></div>
    </div></div>
  );
}

function FreigabeModal({ candidates, onFreigeben, onBlockieren, onClose }) {
  const pendingAnf = candidates.flatMap(c=>c.docs.anf.filter(a=>a.status==="wartet").map(a=>({...a,cid:c.id,cname:c.name})));
  return (
    <div className="mbg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="mh"><h3>Anforderungen prüfen ({pendingAnf.length})</h3><button className="mc" onClick={onClose}>✕</button></div>
      <div className="mb">
        {pendingAnf.length===0 ? <div className="al al-g"><i>✓</i><span>Keine offenen Anforderungen</span></div>
        : pendingAnf.map(a=>(
          <div key={a.id} className="al al-o" style={{marginBottom:10}}>
            <i>📋</i>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:".77rem",marginBottom:2}}>„{a.name}"</div><div style={{fontSize:".7rem",color:"var(--muted2)"}}>{a.cname}</div></div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn btn-pg btn-xs" onClick={()=>onFreigeben(a.cid,a.id)}>Freigeben</button>
              <button className="btn btn-pr btn-xs" onClick={()=>onBlockieren(a.cid,a.id)}>Blockieren</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mf"><button className="btn btn-gh" onClick={onClose}>Schließen</button></div>
    </div></div>
  );
}
