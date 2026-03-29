"use client";
import { useState, useEffect, useRef } from "react";

const FONT_TITLE = `"Silkscreen", monospace`;
const FONT_BODY = `"Press Start 2P", monospace`;

// ─── CLASSES ─────────────────────────────────────────────────────────────────
const CLASSES = [
  {
    id: "warrior", name: "WARRIOR", icon: "⚔️", sprite: "🧔",
    color: "#e74c3c", glow: "#e74c3c60",
    desc: "BRUTE FORCE APPROACH TO LIFE",
    perks: ["+20% XP FROM FITNESS", "+15 BASE HP", "CRIT DAMAGE ×2"],
    stats: { hp: 115 },
    lore: "You don't negotiate with laziness. You bench press it.",
  },
  {
    id: "mage", name: "MAGE", icon: "🔮", sprite: "🧙",
    color: "#9b59b6", glow: "#9b59b660",
    desc: "MIND OVER MATTRESS",
    perks: ["+20% XP FROM PRODUCTIVITY", "+30% LOOT RATE", "XP SCROLL ×2"],
    stats: { hp: 90 },
    lore: "Your weapon is discipline. Your spell book is a Notion doc.",
  },
  {
    id: "ranger", name: "RANGER", icon: "🏹", sprite: "🧝",
    color: "#2ecc71", glow: "#2ecc7160",
    desc: "BALANCED & RELENTLESS",
    perks: ["+20% XP FROM HEALTH", "+25% STREAK BONUS", "15% DODGE"],
    stats: { hp: 100 },
    lore: "Consistency is your superpower. One day at a time, every day.",
  },
  {
    id: "rogue", name: "ROGUE", icon: "🗡️", sprite: "🥷",
    color: "#f39c12", glow: "#f39c1260",
    desc: "CHAOS WITH A PLAN",
    perks: ["+20% XP FROM BUCKET LIST", "+50% GOLD", "FLEE ALWAYS WORKS"],
    stats: { hp: 95 },
    lore: "Side projects at 2am. Random skills. You thrive in chaos.",
  },
];

// ─── STORAGE (localStorage + URL-based party sharing) ────────────────────────
const SAVE_KEY = "questirl-save";

const generateId = () => "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const generatePartyCode = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join("");
};

const db = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  save(d) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) { console.error(e); }
  },
  // Party members are stored locally for now.
  // For real multiplayer, you'd swap this with Firebase/Supabase.
  // Each player syncs their own summary under their party code.
  getPartyKey(code) { return `questirl-party-${code}`; },
  joinParty(code, summary) {
    try {
      const key = this.getPartyKey(code);
      const raw = localStorage.getItem(key);
      const members = raw ? JSON.parse(raw) : [];
      const idx = members.findIndex(m => m.id === summary.id);
      const entry = { ...summary, seen: Date.now() };
      if (idx >= 0) members[idx] = entry;
      else members.push(entry);
      localStorage.setItem(key, JSON.stringify(members));
    } catch (e) { console.error(e); }
  },
  partyMembers(code) {
    try {
      const raw = localStorage.getItem(this.getPartyKey(code));
      if (!raw) return [];
      return JSON.parse(raw).sort((a, b) => (b.level || 1) - (a.level || 1));
    } catch { return []; }
  },
};

// ─── STARFIELD ───────────────────────────────────────────────────────────────
const StarField = () => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let w = cv.width = window.innerWidth, h = cv.height = window.innerHeight;
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      s: Math.random() * 2 + 0.5, sp: Math.random() * 0.2 + 0.03,
      b: Math.random(), ts: Math.random() * 0.015 + 0.004,
    }));
    let af;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.b += s.ts;
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.abs(Math.sin(s.b)) * 0.8})`;
        ctx.fillRect(~~s.x, ~~s.y, Math.ceil(s.s), Math.ceil(s.s));
        s.y += s.sp; if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      }
      af = requestAnimationFrame(draw);
    };
    draw();
    const rs = () => { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; };
    window.addEventListener("resize", rs);
    return () => { cancelAnimationFrame(af); window.removeEventListener("resize", rs); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
};

// ─── BUTTON ──────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, color = "#e74c3c", disabled, big, style = {} }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        fontFamily: FONT_BODY, fontSize: big ? 10 : 8,
        padding: big ? "14px 28px" : "10px 16px",
        background: disabled ? "#1a1a2e" : color,
        color: disabled ? "#444" : "#fff",
        border: `2px solid ${disabled ? "#2a2a3e" : "rgba(255,255,255,0.25)"}`,
        boxShadow: disabled ? "none" : `0 4px 0 ${color}88, 0 0 24px ${color}25`,
        cursor: disabled ? "not-allowed" : "pointer",
        textTransform: "uppercase", letterSpacing: 1,
        position: "relative", zIndex: 2,
        transform: pressed ? "translateY(2px)" : "",
        transition: "all 0.1s ease",
        ...style,
      }}
    >{children}</button>
  );
};

// ─── TITLE SCREEN ────────────────────────────────────────────────────────────
const TitleScreen = ({ onNew, onContinue, hasSave }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", zIndex: 1, padding: "40px 24px",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 250, zIndex: 1,
        background: "linear-gradient(0deg, #e74c3c06 0%, transparent 100%)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ height: 56, position: "relative", marginBottom: -4 }}>
          <span style={{
            position: "absolute", left: "50%", fontSize: 44,
            transform: `translateX(-80%) rotate(-25deg) scale(${phase >= 2 ? 1 : 0})`,
            transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            filter: "drop-shadow(0 0 12px rgba(231,76,60,0.4))",
          }}>⚔️</span>
          <span style={{
            position: "absolute", left: "50%", fontSize: 44,
            transform: `translateX(-20%) rotate(25deg) scaleX(-1) scale(${phase >= 2 ? 1 : 0})`,
            transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s",
            filter: "drop-shadow(0 0 12px rgba(231,76,60,0.4))",
          }}>⚔️</span>
        </div>

        <div style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.8s ease" }}>
          <h1 style={{
            fontFamily: FONT_TITLE, fontSize: "clamp(42px, 12vw, 58px)", fontWeight: 700,
            color: "#fff", margin: 0, letterSpacing: 8, lineHeight: 1,
            textShadow: phase >= 3
              ? "0 0 40px #e74c3c, 0 0 80px #e74c3c55, 0 2px 0 #c0392b, 0 4px 0 #96281b"
              : "0 2px 0 #222",
            transition: "text-shadow 0.8s ease",
          }}>QUEST</h1>
          <h1 style={{
            fontFamily: FONT_TITLE, fontSize: "clamp(42px, 12vw, 58px)", fontWeight: 700,
            color: "#f1c40f", margin: 0, letterSpacing: 8, lineHeight: 1,
            textShadow: phase >= 3
              ? "0 0 40px #f39c12, 0 0 80px #f39c1255, 0 2px 0 #e67e22, 0 4px 0 #d35400"
              : "0 2px 0 #222",
            transition: "text-shadow 0.8s ease",
          }}>IRL</h1>
        </div>

        <p style={{
          fontFamily: FONT_BODY, fontSize: "clamp(5px, 1.8vw, 7px)",
          color: "#666", letterSpacing: 4, margin: "14px 0 0",
          opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
        }}>REAL LIFE. QUEST MODE.</p>

        <div style={{
          width: 140, height: 2, margin: "24px auto",
          background: "linear-gradient(90deg, transparent, #e74c3c, #f1c40f, #e74c3c, transparent)",
          opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.6s ease 0.3s",
        }} />

        <div style={{
          display: "flex", flexDirection: "column", gap: 14, alignItems: "center",
          marginTop: 20,
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s ease",
        }}>
          {hasSave && (
            <Btn big color="#2ecc71" onClick={onContinue} style={{ width: "100%", maxWidth: 260 }}>
              CONTINUE QUEST
            </Btn>
          )}
          <Btn big color={hasSave ? "#444" : "#e74c3c"} onClick={onNew} style={{ width: "100%", maxWidth: 260 }}>
            {hasSave ? "NEW GAME" : "BEGIN YOUR QUEST"}
          </Btn>
        </div>

        <div style={{ marginTop: 48, opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.8s ease 0.5s" }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#333", lineHeight: 2.4 }}>
            COMPLETE QUESTS • SLAY YOUR DEMONS<br />
            LEVEL UP • BECOME LEGENDARY
          </p>
          <p style={{
            fontFamily: FONT_BODY, fontSize: 6, color: "#2a2a3e", marginTop: 18,
            animation: "blink 1.2s step-end infinite",
          }}>▼ PRESS START ▼</p>
        </div>
      </div>
    </div>
  );
};

// ─── CHARACTER CREATION ──────────────────────────────────────────────────────
const CharCreate = ({ onDone }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [cls, setCls] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [party, setParty] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { if (step === 1) nameRef.current?.focus(); }, [step]);

  const next1 = () => {
    if (name.trim().length < 2) { setError("TOO SHORT"); return; }
    setError(""); setStep(2);
  };
  const next2 = () => { if (cls) { setError(""); setStep(3); } };

  const finish = () => {
    setBusy(true);
    const id = generateId();
    let code = null;
    if (party === "create") code = generatePartyCode();
    else if (party === "join") {
      if (joinCode.trim().length < 4) { setError("INVALID CODE"); setBusy(false); return; }
      code = joinCode.trim().toUpperCase();
    }

    const classData = CLASSES.find(c => c.id === cls);
    const player = {
      id, name: name.trim(), classId: cls,
      className: classData.name, sprite: classData.sprite,
      partyCode: code, level: 1, xp: 0, gold: 30,
      hp: classData.stats.hp, maxHp: classData.stats.hp,
      weaponIndex: 0, inventory: [], completedToday: [],
      streak: 0, lastPlayDate: new Date().toDateString(),
      totalTasksDone: 0, enemiesDefeated: 0, bossesDefeated: 0,
      customTasks: {}, createdAt: Date.now(),
    };

    db.save(player);
    if (code) {
      db.joinParty(code, {
        id, name: player.name, classId: cls,
        className: classData.name, sprite: classData.sprite,
        level: 1, streak: 0,
      });
    }
    onDone(player, party === "create" ? code : null);
  };

  const classData = cls ? CLASSES.find(c => c.id === cls) : null;

  return (
    <div style={{
      minHeight: "100dvh", position: "relative", zIndex: 1,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "28px 20px 0" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 36 : 20, height: 4,
              background: s <= step ? (s === 1 ? "#e74c3c" : s === 2 ? "#f1c40f" : "#2ecc71") : "#1a1a2e",
              transition: "all 0.4s ease",
              boxShadow: s === step ? `0 0 10px ${s === 1 ? "#e74c3c" : s === 2 ? "#f1c40f" : "#2ecc71"}60` : "none",
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: 6, color: "#444", textAlign: "center",
          margin: "10px 0 6px", letterSpacing: 3,
        }}>
          {step === 1 ? "I — IDENTITY" : step === 2 ? "II — CLASS" : "III — PARTY"}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 20px 32px" }}>

          {step === 1 && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
              <div style={{ fontSize: 44, marginBottom: 20 }}>👤</div>
              <h2 style={{
                fontFamily: FONT_TITLE, fontSize: "clamp(18px, 5vw, 26px)", color: "#e74c3c",
                margin: "0 0 8px", textShadow: "0 0 24px #e74c3c30",
              }}>NAME YOUR HERO</h2>
              <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#555", margin: "0 0 32px" }}>
                THIS IS WHO YOU BECOME
              </p>
              <div style={{ maxWidth: 300, margin: "0 auto" }}>
                <input
                  ref={nameRef} value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && next1()}
                  maxLength={16} placeholder="ENTER NAME..."
                  style={{
                    fontFamily: FONT_BODY, fontSize: "clamp(12px, 3.5vw, 16px)",
                    background: "#08081a", border: "2px solid #e74c3c30",
                    borderBottom: "4px solid #e74c3c", color: "#fff",
                    padding: "14px 18px", textAlign: "center", width: "100%",
                    outline: "none",
                    boxShadow: "0 0 40px rgba(231,76,60,0.08), inset 0 0 24px rgba(0,0,0,0.6)",
                  }}
                />
                <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#333", textAlign: "right", marginTop: 6 }}>
                  {name.length}/16
                </div>
              </div>
              {error && <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#e74c3c", marginTop: 10 }}>⚠ {error}</p>}
              <div style={{ marginTop: 24 }}>
                <Btn big color="#e74c3c" onClick={next1} disabled={!name.trim()}>NEXT →</Btn>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeUp 0.5s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h2 style={{
                  fontFamily: FONT_TITLE, fontSize: "clamp(18px, 5vw, 24px)", color: "#f1c40f",
                  margin: "0 0 6px", textShadow: "0 0 20px #f1c40f30",
                }}>CHOOSE YOUR CLASS</h2>
                <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#555", margin: 0 }}>
                  EACH PATH HAS UNIQUE POWER
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CLASSES.map((c, i) => {
                  const sel = cls === c.id;
                  const exp = expanded === c.id;
                  return (
                    <div key={c.id}
                      onClick={() => { setCls(c.id); setExpanded(exp ? null : c.id); }}
                      style={{
                        background: sel ? `${c.color}10` : "#0a0a16",
                        border: `2px solid ${sel ? c.color : "#1a1a2e"}`,
                        padding: "12px 14px", cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: sel ? `0 0 24px ${c.glow}` : "none",
                        animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          fontSize: 28, width: 46, height: 46,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#08081a", border: `2px solid ${sel ? c.color + "60" : "#151520"}`,
                          transition: "all 0.3s",
                          boxShadow: sel ? `inset 0 0 12px ${c.color}20` : "none",
                        }}>{c.sprite}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{
                              fontFamily: FONT_BODY, fontSize: 9,
                              color: sel ? c.color : "#888", transition: "color 0.3s",
                            }}>{c.icon} {c.name}</span>
                            {sel && <span style={{
                              fontFamily: FONT_BODY, fontSize: 5, color: c.color,
                              border: `1px solid ${c.color}60`, padding: "2px 6px",
                            }}>✓</span>}
                          </div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 3 }}>
                            {c.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        maxHeight: exp ? 180 : 0, overflow: "hidden",
                        transition: "max-height 0.4s ease, opacity 0.3s", opacity: exp ? 1 : 0,
                      }}>
                        <div style={{ borderTop: `1px solid ${c.color}20`, marginTop: 10, paddingTop: 10 }}>
                          {c.perks.map((p, j) => (
                            <div key={j} style={{
                              fontFamily: FONT_BODY, fontSize: 7, color: c.color,
                              marginBottom: 3, paddingLeft: 6,
                            }}>► {p}</div>
                          ))}
                          <div style={{
                            fontFamily: FONT_BODY, fontSize: 6, color: "#3a3a4a",
                            marginTop: 8, lineHeight: 1.8,
                          }}>&quot;{c.lore}&quot;</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
                <Btn color="#333" onClick={() => setStep(1)}>← BACK</Btn>
                <Btn big color="#f1c40f" onClick={next2} disabled={!cls}>NEXT →</Btn>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
              <h2 style={{
                fontFamily: FONT_TITLE, fontSize: "clamp(18px, 5vw, 24px)", color: "#2ecc71",
                margin: "0 0 6px", textShadow: "0 0 20px #2ecc7130",
              }}>PARTY UP</h2>
              <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#555", margin: "0 0 24px", lineHeight: 2 }}>
                COMPETE WITH FRIENDS.<br />SEE EACH OTHER&apos;S PROGRESS.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320, margin: "0 auto" }}>
                {[
                  { k: "create", icon: "🏰", label: "CREATE A PARTY", sub: "GET A CODE TO SHARE", col: "#2ecc71" },
                  { k: "join", icon: "🤝", label: "JOIN A PARTY", sub: "ENTER A FRIEND'S CODE", col: "#3498db" },
                  { k: "solo", icon: "🐺", label: "GO SOLO", sub: "LONE WOLF. JOIN LATER.", col: "#f39c12" },
                ].map(opt => (
                  <div key={opt.k}
                    onClick={() => { setParty(opt.k); setError(""); }}
                    style={{
                      background: party === opt.k ? `${opt.col}10` : "#0a0a16",
                      border: `2px solid ${party === opt.k ? opt.col : "#1a1a2e"}`,
                      padding: 16, cursor: "pointer", transition: "all 0.3s",
                      boxShadow: party === opt.k ? `0 0 20px ${opt.col}25` : "none",
                    }}
                  >
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: 9,
                      color: party === opt.k ? opt.col : "#888",
                    }}>{opt.icon} {opt.label}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 5 }}>
                      {opt.sub}
                    </div>

                    {opt.k === "join" && party === "join" && (
                      <div style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>
                        <input
                          value={joinCode}
                          onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                          onKeyDown={e => e.key === "Enter" && finish()}
                          maxLength={6} placeholder="— — — — — —"
                          autoFocus
                          style={{
                            fontFamily: FONT_BODY, fontSize: "clamp(14px, 4vw, 20px)",
                            background: "#08081a", border: "2px solid #3498db30",
                            borderBottom: "4px solid #3498db",
                            color: "#3498db", padding: "10px 14px",
                            textAlign: "center", width: "100%",
                            outline: "none", letterSpacing: 10,
                            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#e74c3c", marginTop: 12 }}>⚠ {error}</p>}

              {classData && (
                <div style={{
                  margin: "24px auto 0", padding: 14, maxWidth: 280,
                  border: `1px solid ${classData.color}25`, background: `${classData.color}06`,
                }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 5, color: "#444", marginBottom: 6, letterSpacing: 2 }}>
                    YOUR HERO
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{classData.sprite}</span>
                    <div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: "#fff" }}>{name}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 7, color: classData.color }}>{classData.icon} {classData.name}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
                <Btn color="#333" onClick={() => setStep(2)}>← BACK</Btn>
                <Btn big color="#2ecc71" onClick={finish}
                  disabled={!party || busy || (party === "join" && joinCode.length < 4)}>
                  {busy ? "CREATING..." : "⚔️ START"}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PARTY CODE REVEAL ───────────────────────────────────────────────────────
const PartyReveal = ({ code, onGo }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", zIndex: 1, padding: 24,
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 18 }}>🏰</div>
        <h2 style={{
          fontFamily: FONT_TITLE, fontSize: "clamp(18px, 5vw, 24px)", color: "#2ecc71",
          margin: "0 0 8px", textShadow: "0 0 24px #2ecc7130",
        }}>PARTY CREATED!</h2>
        <p style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#666", margin: "0 0 30px", lineHeight: 2 }}>
          SHARE THIS CODE WITH YOUR FRIENDS
        </p>

        <div onClick={copy} style={{
          fontFamily: FONT_BODY, fontSize: "clamp(22px, 7vw, 32px)",
          color: "#2ecc71", letterSpacing: 14, padding: "18px 28px",
          border: "3px solid #2ecc71", background: "#08081a",
          cursor: "pointer", userSelect: "all",
          boxShadow: "0 0 50px #2ecc7120, inset 0 0 24px #2ecc7108",
        }}>{code}</div>
        <p style={{
          fontFamily: FONT_BODY, fontSize: 7, marginTop: 10,
          color: copied ? "#2ecc71" : "#444", transition: "color 0.3s",
        }}>{copied ? "✓ COPIED!" : "TAP TO COPY"}</p>

        <div style={{ marginTop: 36 }}>
          <Btn big color="#2ecc71" onClick={onGo}>ENTER THE WORLD →</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── GAME DATA ───────────────────────────────────────────────────────────────
const TASK_CATEGORIES = {
  fitness: {
    icon: "⚔️", label: "FITNESS", color: "#e74c3c",
    tasks: [
      { name: "Go for a run", xp: 40, gold: 15 },
      { name: "Hit the gym", xp: 50, gold: 20 },
      { name: "Yoga session", xp: 30, gold: 10 },
      { name: "10K steps", xp: 35, gold: 12 },
      { name: "Play a sport", xp: 45, gold: 18 },
    ]
  },
  adulting: {
    icon: "🛡️", label: "ADULTING", color: "#3498db",
    tasks: [
      { name: "Do laundry", xp: 20, gold: 10 },
      { name: "Cook a meal", xp: 30, gold: 15 },
      { name: "Clean the house", xp: 25, gold: 12 },
      { name: "Pay bills", xp: 15, gold: 8 },
      { name: "Grocery shopping", xp: 20, gold: 10 },
    ]
  },
  productivity: {
    icon: "📜", label: "PRODUCTIVE", color: "#f39c12",
    tasks: [
      { name: "2hr deep work", xp: 60, gold: 25 },
      { name: "Read 30 mins", xp: 30, gold: 12 },
      { name: "No phone 1hr", xp: 25, gold: 10 },
      { name: "Journal entry", xp: 20, gold: 8 },
      { name: "Learn something new", xp: 40, gold: 15 },
    ]
  },
  health: {
    icon: "❤️", label: "HEALTH", color: "#2ecc71",
    tasks: [
      { name: "Sleep 8 hours", xp: 25, gold: 10 },
      { name: "Drink 3L water", xp: 15, gold: 8 },
      { name: "Meditate 15 mins", xp: 30, gold: 12 },
      { name: "No junk food today", xp: 20, gold: 10 },
      { name: "Stretch routine", xp: 15, gold: 8 },
    ]
  },
  quests: {
    icon: "🌟", label: "BUCKET LIST", color: "#9b59b6",
    tasks: [
      { name: "Start that side project", xp: 80, gold: 40 },
      { name: "Sign up for a class", xp: 60, gold: 30 },
      { name: "Call an old friend", xp: 25, gold: 15 },
      { name: "Try a new hobby", xp: 50, gold: 25 },
      { name: "Write that blog post", xp: 45, gold: 20 },
    ]
  },
  resolutions: {
    icon: "🏆", label: "RESOLUTIONS", color: "#e67e22",
    tasks: [
      { name: "Wake up before 7am", xp: 30, gold: 12 },
      { name: "No social media 1 day", xp: 40, gold: 18 },
      { name: "Save money today", xp: 20, gold: 10 },
      { name: "Practice gratitude", xp: 15, gold: 8 },
      { name: "Do something scary", xp: 70, gold: 35 },
    ]
  },
};

const ENEMIES = [
  { name: "Lazy Slime", hp: 30, sprite: "🟢", xpReward: 20, goldReward: 15, minLevel: 1 },
  { name: "Procrastination Imp", hp: 50, sprite: "👿", xpReward: 35, goldReward: 25, minLevel: 2 },
  { name: "Distraction Bat", hp: 40, sprite: "🦇", xpReward: 30, goldReward: 20, minLevel: 1 },
  { name: "Doom Scroller", hp: 70, sprite: "📱", xpReward: 50, goldReward: 35, minLevel: 3 },
  { name: "Excuseosaur", hp: 90, sprite: "🦖", xpReward: 60, goldReward: 40, minLevel: 4 },
  { name: "Snooze Demon", hp: 60, sprite: "😴", xpReward: 40, goldReward: 30, minLevel: 2 },
  { name: "Junk Food Dragon", hp: 110, sprite: "🐉", xpReward: 75, goldReward: 50, minLevel: 5 },
];

const BOSSES = [
  { name: "THE COUCH POTATO", hp: 200, sprite: "🥔", xpReward: 150, goldReward: 100, requiredLevel: 3 },
  { name: "LORD OF LAZINESS", hp: 350, sprite: "👑", xpReward: 250, goldReward: 180, requiredLevel: 5 },
  { name: "BURNOUT BEAST", hp: 500, sprite: "🔥", xpReward: 400, goldReward: 300, requiredLevel: 8 },
  { name: "FINAL FORM: OLD YOU", hp: 750, sprite: "👤", xpReward: 600, goldReward: 500, requiredLevel: 12 },
];

const WEAPONS = [
  { name: "Wooden Sword", damage: 5, cost: 0, icon: "🗡️", minLevel: 1 },
  { name: "Iron Blade", damage: 10, cost: 50, icon: "⚔️", minLevel: 2 },
  { name: "Discipline Dagger", damage: 15, cost: 120, icon: "🔪", minLevel: 3 },
  { name: "Willpower Wand", damage: 20, cost: 200, icon: "🪄", minLevel: 4 },
  { name: "Habit Hammer", damage: 30, cost: 350, icon: "🔨", minLevel: 6 },
  { name: "Focus Flame", damage: 40, cost: 500, icon: "🔥", minLevel: 8 },
  { name: "Legendary Resolve", damage: 60, cost: 800, icon: "⭐", minLevel: 10 },
];

const LOOT_TABLE = [
  { name: "Health Potion", icon: "🧪", effect: "heal", value: 20, rarity: "common" },
  { name: "XP Scroll", icon: "📜", effect: "xp", value: 30, rarity: "common" },
  { name: "Gold Sack", icon: "💰", effect: "gold", value: 25, rarity: "common" },
  { name: "Streak Shield", icon: "🛡️", effect: "shield", value: 1, rarity: "rare" },
  { name: "Critical Hit Gem", icon: "💎", effect: "crit", value: 2, rarity: "rare" },
  { name: "Phoenix Feather", icon: "🪶", effect: "revive", value: 1, rarity: "epic" },
];

const XP_PER_LEVEL = (lvl) => 80 + lvl * 40;

// ─── SHARED UI ───────────────────────────────────────────────────────────────
const HPBar = ({ current, max, color = "#e74c3c", height = 14, label }) => (
  <div style={{ width: "100%" }}>
    {label && <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#555", marginBottom: 3 }}>{label}</div>}
    <div style={{
      background: "#0a0a16", border: "2px solid #1a1a2e", height, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: `${Math.max(0, (current / max) * 100)}%`, height: "100%",
        background: `linear-gradient(180deg, ${color}, ${color}88)`,
        transition: "width 0.5s ease", boxShadow: `0 0 8px ${color}40`,
      }} />
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT_BODY, fontSize: 6, color: "#fff", textShadow: "1px 1px 0 #000",
      }}>{current}/{max}</div>
    </div>
  </div>
);

// ─── BOTTOM TABS ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "quests", icon: "📜", label: "QUESTS" },
  { id: "battle", icon: "⚔️", label: "BATTLE" },
  { id: "shop", icon: "🏪", label: "SHOP" },
  { id: "bag", icon: "🎒", label: "BAG" },
];

const BottomTabs = ({ active, onTab, battleActive }) => (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 900,
    background: "#0a0a16", borderTop: "2px solid #1a1a2e",
    display: "flex", justifyContent: "space-around",
    padding: "6px 0 env(safe-area-inset-bottom, 8px)",
  }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onTab(t.id)} style={{
        flex: 1, background: "none", border: "none", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        padding: "6px 0", position: "relative",
      }}>
        <span style={{
          fontSize: 18,
          filter: active === t.id ? "none" : "grayscale(1) brightness(0.5)",
          transition: "filter 0.2s",
        }}>{t.icon}</span>
        <span style={{
          fontFamily: FONT_BODY, fontSize: 5,
          color: active === t.id ? "#f1c40f" : "#333",
          transition: "color 0.2s",
        }}>{t.label}</span>
        {t.id === "battle" && battleActive && (
          <div style={{
            position: "absolute", top: 2, right: "25%",
            width: 6, height: 6, borderRadius: 3, background: "#e74c3c",
            animation: "blink 1s step-end infinite",
          }} />
        )}
      </button>
    ))}
  </div>
);

// ─── TAB: QUESTS ─────────────────────────────────────────────────────────────
const QuestsTab = ({ player, onComplete, onAddTask }) => {
  const [activeCat, setActiveCat] = useState("fitness");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newXP, setNewXP] = useState(25);
  const cls = CLASSES.find(x => x.id === player.classId);
  const todayCount = player.completedToday?.length || 0;

  const getAllTasks = (catKey) => {
    const base = TASK_CATEGORIES[catKey]?.tasks || [];
    const custom = player.customTasks?.[catKey] || [];
    return [...base, ...custom];
  };

  const addTask = () => {
    if (!newName.trim()) return;
    onAddTask(activeCat, { name: newName.trim(), xp: newXP, gold: Math.floor(newXP * 0.5) });
    setNewName(""); setNewXP(25); setAdding(false);
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 12, fontSize: 7, fontFamily: FONT_BODY, color: "#555",
        justifyContent: "center",
      }}>
        <span>✅ {todayCount} TODAY</span>
        <span style={{ color: "#333" }}>•</span>
        <span>⚔️ {player.enemiesDefeated} KILLS</span>
        <span style={{ color: "#333" }}>•</span>
        <span>👑 {player.bossesDefeated} BOSSES</span>
      </div>

      {/* Category tabs */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0, marginBottom: 12,
        borderBottom: "2px solid #1a1a2e",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}>
        {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => setActiveCat(key)} style={{
            fontFamily: FONT_BODY, fontSize: 6, padding: "8px 10px",
            background: "none", border: "none", cursor: "pointer",
            color: activeCat === key ? cat.color : "#333",
            borderBottom: activeCat === key ? `2px solid ${cat.color}` : "2px solid transparent",
            whiteSpace: "nowrap", transition: "all 0.2s",
            flexShrink: 0,
          }}>
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Category label */}
      <div style={{
        fontFamily: FONT_BODY, fontSize: 8,
        color: TASK_CATEGORIES[activeCat].color, marginBottom: 10,
      }}>
        {TASK_CATEGORIES[activeCat].icon} {TASK_CATEGORIES[activeCat].label}
      </div>

      {/* Tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {getAllTasks(activeCat).map((task, i) => {
          const key = `${activeCat}:${task.name}`;
          const done = player.completedToday?.includes(key);
          // Class bonus indicator
          const bonusCat = cls?.id === "warrior" ? "fitness" : cls?.id === "mage" ? "productivity" : cls?.id === "ranger" ? "health" : "quests";
          const hasBonus = activeCat === bonusCat;
          const displayXP = hasBonus ? Math.floor(task.xp * 1.2) : task.xp;
          const displayGold = cls?.id === "rogue" ? Math.floor(task.gold * 1.5) : task.gold;

          return (
            <div key={i} onClick={() => !done && onComplete(task, activeCat, displayXP, displayGold)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
                background: done ? "#0d1a0d" : "#0a0a16",
                border: `2px solid ${done ? "#2ecc7140" : "#1a1a2e"}`,
                cursor: done ? "default" : "pointer",
                opacity: done ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{done ? "✅" : "⬜"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: 7,
                  color: done ? "#2ecc71" : "#ccc",
                  textDecoration: done ? "line-through" : "none",
                }}>{task.name}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 3 }}>
                  +{displayXP} XP  +{displayGold} G
                  {hasBonus && <span style={{ color: TASK_CATEGORIES[activeCat].color }}> ★</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add custom task */}
        {adding ? (
          <div style={{
            padding: 14, background: "#0a0a16", border: "2px solid #1a1a2e",
          }}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="TASK NAME..." maxLength={30} autoFocus
              style={{
                fontFamily: FONT_BODY, fontSize: 8, background: "#08081a",
                border: "1px solid #1a1a2e", color: "#fff", padding: 8,
                width: "100%", outline: "none", marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#555" }}>XP:</span>
              {[15, 25, 40, 60].map(v => (
                <button key={v} onClick={() => setNewXP(v)} style={{
                  fontFamily: FONT_BODY, fontSize: 6, padding: "4px 8px",
                  background: newXP === v ? "#3498db" : "#0a0a16",
                  color: newXP === v ? "#fff" : "#555",
                  border: `1px solid ${newXP === v ? "#3498db" : "#1a1a2e"}`,
                  cursor: "pointer",
                }}>{v}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small color="#2ecc71" onClick={addTask}>ADD</Btn>
              <Btn small color="#333" onClick={() => { setAdding(false); setNewName(""); }}>CANCEL</Btn>
            </div>
          </div>
        ) : (
          <div onClick={() => setAdding(true)} style={{
            padding: "12px 14px", border: "2px dashed #1a1a2e",
            textAlign: "center", fontFamily: FONT_BODY, fontSize: 7,
            color: "#333", cursor: "pointer",
          }}>+ ADD CUSTOM TASK</div>
        )}
      </div>
    </div>
  );
};

// ─── TAB: BATTLE ─────────────────────────────────────────────────────────────
const BattleTab = ({ player, onUpdate }) => {
  const [enemy, setEnemy] = useState(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [isBoss, setIsBoss] = useState(false);
  const [log, setLog] = useState([]);
  const [lootDrop, setLootDrop] = useState(null);
  const [shake, setShake] = useState(false);
  const cls = CLASSES.find(x => x.id === player.classId);
  const weapon = WEAPONS[player.weaponIndex || 0];

  const startFight = (boss) => {
    let e;
    if (boss) {
      const available = BOSSES.filter(b => b.requiredLevel <= player.level);
      e = available[available.length - 1];
      if (!e) return;
    } else {
      const available = ENEMIES.filter(en => en.minLevel <= player.level);
      e = available[Math.floor(Math.random() * available.length)];
    }
    setEnemy(e); setEnemyHp(e.hp); setIsBoss(!!boss);
    setLog([{ text: `A wild ${e.name} appeared!`, color: "#e74c3c" }]);
    setLootDrop(null);
  };

  const attack = () => {
    if (!enemy) return;
    const crit = Math.random() < 0.15;
    const critMult = crit ? (cls?.id === "warrior" ? 2.0 : 1.5) : 1;
    const dmg = Math.floor((weapon.damage + player.level * 2) * critMult * (0.8 + Math.random() * 0.4));
    const newEHp = Math.max(0, enemyHp - dmg);

    setShake(true); setTimeout(() => setShake(false), 300);

    const newLog = [...log, {
      text: `You deal ${dmg} DMG!${crit ? " CRIT!" : ""}`,
      color: crit ? "#f1c40f" : "#2ecc71"
    }];

    if (newEHp <= 0) {
      newLog.push({ text: `${enemy.name} defeated!`, color: "#f1c40f" });
      newLog.push({ text: `+${enemy.xpReward} XP  +${enemy.goldReward} G`, color: "#f1c40f" });

      let newXP = player.xp + enemy.xpReward;
      let newGold = player.gold + enemy.goldReward;
      let newLevel = player.level;
      let newMaxHp = player.maxHp;
      let newHp = player.hp;

      while (newXP >= XP_PER_LEVEL(newLevel)) {
        newXP -= XP_PER_LEVEL(newLevel);
        newLevel++; newMaxHp += 15; newHp = newMaxHp;
      }

      onUpdate({
        xp: newXP, gold: newGold, level: newLevel, maxHp: newMaxHp, hp: newHp,
        enemiesDefeated: player.enemiesDefeated + 1,
        bossesDefeated: player.bossesDefeated + (isBoss ? 1 : 0),
      });

      // Loot check
      const lootChance = cls?.id === "mage" ? 0.6 : 0.4;
      if (Math.random() < lootChance) {
        const pool = LOOT_TABLE.filter(l =>
          l.rarity === "common" ? true : l.rarity === "rare" ? Math.random() < 0.3 : Math.random() < 0.1
        );
        setLootDrop(pool[Math.floor(Math.random() * pool.length)]);
      }

      setLog(newLog); setEnemyHp(0);
      setTimeout(() => { setEnemy(null); setEnemyHp(0); }, 2000);
      return;
    }

    // Enemy attacks back
    const eDmg = Math.floor((5 + enemy.hp * 0.08) * (0.7 + Math.random() * 0.6));
    const dodge = cls?.id === "ranger" && Math.random() < 0.15;
    if (dodge) {
      newLog.push({ text: "You dodged the attack!", color: "#2ecc71" });
    } else {
      const shields = (player.inventory || []).filter(i => i.effect === "shield").length;
      const reduction = Math.min(shields * 0.1, 0.3);
      const actual = Math.floor(eDmg * (1 - reduction));
      const newPHp = Math.max(0, player.hp - actual);
      newLog.push({ text: `${enemy.name} hits for ${actual}!`, color: "#e74c3c" });

      if (newPHp <= 0) {
        const revive = (player.inventory || []).find(i => i.effect === "revive");
        if (revive) {
          onUpdate({
            hp: Math.floor(player.maxHp * 0.5),
            inventory: player.inventory.filter(i => i !== revive),
          });
          newLog.push({ text: "Phoenix Feather saved you!", color: "#9b59b6" });
        } else {
          newLog.push({ text: "You were defeated...", color: "#e74c3c" });
          onUpdate({ hp: player.maxHp, gold: Math.max(0, player.gold - 20) });
          setTimeout(() => { setEnemy(null); }, 1500);
        }
      } else {
        onUpdate({ hp: newPHp });
      }
    }

    setEnemyHp(newEHp); setLog(newLog);
  };

  const flee = () => {
    const autoFlee = cls?.id === "rogue";
    if (autoFlee || Math.random() < 0.6) {
      setEnemy(null); setLog([]);
    } else {
      const dmg = Math.floor((5 + enemy.hp * 0.05) * (0.5 + Math.random() * 0.5));
      onUpdate({ hp: Math.max(0, player.hp - dmg) });
      setLog(prev => [...prev, { text: `Failed to flee! -${dmg} HP`, color: "#e74c3c" }]);
    }
  };

  const collectLoot = () => {
    if (!lootDrop) return;
    if (lootDrop.effect === "xp") onUpdate({ xp: player.xp + lootDrop.value });
    else if (lootDrop.effect === "gold") onUpdate({ gold: player.gold + lootDrop.value });
    else onUpdate({ inventory: [...(player.inventory || []), lootDrop] });
    setLootDrop(null);
  };

  const usePotion = () => {
    const pot = (player.inventory || []).find(i => i.effect === "heal");
    if (!pot) return;
    const healed = Math.min(player.maxHp, player.hp + pot.value);
    const idx = player.inventory.indexOf(pot);
    onUpdate({
      hp: healed,
      inventory: [...player.inventory.slice(0, idx), ...player.inventory.slice(idx + 1)],
    });
    setLog(prev => [...prev, { text: `Healed +${pot.value} HP!`, color: "#2ecc71" }]);
  };

  const potions = (player.inventory || []).filter(i => i.effect === "heal");
  const nextBoss = BOSSES.find(b => b.requiredLevel <= player.level);

  // Loot modal
  if (lootDrop && !enemy) {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 8, color: "#9b59b6", marginBottom: 12 }}>
          LOOT DROPPED!
        </div>
        <div style={{ fontSize: 56, margin: "16px 0" }}>{lootDrop.icon}</div>
        <div style={{
          fontFamily: FONT_BODY, fontSize: 10,
          color: lootDrop.rarity === "epic" ? "#9b59b6" : lootDrop.rarity === "rare" ? "#3498db" : "#aaa",
        }}>{lootDrop.name}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 4 }}>
          {lootDrop.rarity.toUpperCase()}
        </div>
        <div style={{ marginTop: 24 }}>
          <Btn big color="#9b59b6" onClick={collectLoot}>COLLECT</Btn>
        </div>
      </div>
    );
  }

  // No active fight
  if (!enemy) {
    return (
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚔️</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: "#fff", marginBottom: 6 }}>BATTLE ARENA</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#444", marginBottom: 24, lineHeight: 2 }}>
          FIGHT ENEMIES FOR XP, GOLD &amp; LOOT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <Btn big color="#e74c3c" onClick={() => startFight(false)}>🗡️ HUNT ENEMY</Btn>
          {nextBoss && (
            <Btn big color="#9b59b6" onClick={() => startFight(true)}>
              👹 BOSS: {nextBoss.name}
            </Btn>
          )}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#333", marginTop: 24, lineHeight: 2 }}>
          EQUIPPED: {weapon.icon} {weapon.name} ({weapon.damage} DMG)
        </div>
      </div>
    );
  }

  // Active fight
  return (
    <div style={{ textAlign: "center" }}>
      {isBoss && (
        <div style={{
          fontFamily: FONT_BODY, fontSize: 7, color: "#e74c3c",
          animation: "blink 1s step-end infinite", marginBottom: 8,
          textShadow: "0 0 10px #e74c3c",
        }}>⚠️ BOSS FIGHT ⚠️</div>
      )}
      <div style={{
        fontSize: isBoss ? 64 : 52, margin: "8px 0",
        transform: shake ? "translateX(6px)" : "", transition: "transform 0.1s",
      }}>{enemy.sprite}</div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: isBoss ? 10 : 9,
        color: isBoss ? "#e74c3c" : "#fff", marginBottom: 8,
      }}>{enemy.name}</div>
      <div style={{ maxWidth: 260, margin: "0 auto 14px" }}>
        <HPBar current={enemyHp} max={enemy.hp} color="#e74c3c" label="ENEMY HP" />
      </div>

      <div style={{
        background: "#08081a", border: "2px solid #1a1a2e", padding: 10,
        margin: "0 auto 14px", maxWidth: 300, minHeight: 50, maxHeight: 70,
        overflowY: "auto", textAlign: "left",
      }}>
        {log.slice(-4).map((l, i) => (
          <div key={i} style={{ fontFamily: FONT_BODY, fontSize: 6, color: l.color, marginBottom: 2 }}>
            {l.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn color="#e74c3c" onClick={attack}>
          {weapon.icon} ATK ({weapon.damage})
        </Btn>
        {potions.length > 0 && (
          <Btn color="#2ecc71" onClick={usePotion}>🧪 ({potions.length})</Btn>
        )}
        {!isBoss && <Btn color="#555" onClick={flee}>🏃 FLEE</Btn>}
      </div>
    </div>
  );
};

// ─── TAB: SHOP ───────────────────────────────────────────────────────────────
const ShopTab = ({ player, onUpdate }) => (
  <div>
    <div style={{ fontFamily: FONT_BODY, fontSize: 8, color: "#f1c40f", marginBottom: 14, textAlign: "center" }}>
      💰 {player.gold} GOLD
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {WEAPONS.map((w, i) => {
        const owned = (player.weaponIndex || 0) >= i;
        const equipped = (player.weaponIndex || 0) === i;
        const canBuy = player.gold >= w.cost && player.level >= w.minLevel && !owned;
        const locked = player.level < w.minLevel;
        return (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 14px",
            background: equipped ? `#f1c40f08` : "#0a0a16",
            border: `2px solid ${equipped ? "#f1c40f40" : "#1a1a2e"}`,
          }}>
            <div>
              <div style={{
                fontFamily: FONT_BODY, fontSize: 8,
                color: equipped ? "#f1c40f" : locked ? "#333" : "#ccc",
              }}>{w.icon} {w.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 3 }}>
                DMG: {w.damage} {locked ? `• LVL ${w.minLevel}` : ""}
              </div>
            </div>
            <div>
              {equipped ? (
                <span style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#f1c40f" }}>EQUIPPED</span>
              ) : owned ? (
                <Btn color="#3498db" onClick={() => onUpdate({ weaponIndex: i })}>EQUIP</Btn>
              ) : (
                <Btn color="#2ecc71" disabled={!canBuy}
                  onClick={() => onUpdate({ gold: player.gold - w.cost, weaponIndex: i })}>
                  {w.cost} G
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── TAB: INVENTORY ──────────────────────────────────────────────────────────
const BagTab = ({ player, onUpdate }) => {
  const items = (player.inventory || []).reduce((acc, item) => {
    acc[item.name] = acc[item.name] || { ...item, count: 0 };
    acc[item.name].count++;
    return acc;
  }, {});

  const useItem = (item) => {
    if (item.effect === "heal") {
      const healed = Math.min(player.maxHp, player.hp + item.value);
      const idx = player.inventory.indexOf(player.inventory.find(i => i.name === item.name));
      onUpdate({
        hp: healed,
        inventory: [...player.inventory.slice(0, idx), ...player.inventory.slice(idx + 1)],
      });
    }
  };

  const entries = Object.entries(items);

  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 8, color: "#9b59b6", marginBottom: 14, textAlign: "center" }}>
        🎒 INVENTORY ({(player.inventory || []).length} ITEMS)
      </div>
      {entries.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 40,
          fontFamily: FONT_BODY, fontSize: 7, color: "#333", lineHeight: 2,
        }}>
          EMPTY BAG...<br />DEFEAT ENEMIES TO FIND LOOT!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map(([name, item]) => (
            <div key={name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px", background: "#0a0a16", border: "2px solid #1a1a2e",
            }}>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 8, color: "#ccc" }}>
                  {item.icon} {name} <span style={{ color: "#555" }}>×{item.count}</span>
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 3 }}>
                  {item.effect === "heal" ? `Restores ${item.value} HP` :
                   item.effect === "shield" ? "Reduces damage taken" :
                   item.effect === "crit" ? "Increases crit chance" :
                   item.effect === "revive" ? "Auto-revive on death" : ""}
                </div>
              </div>
              {item.effect === "heal" && (
                <Btn color="#2ecc71" onClick={() => useItem(item)}>USE</Btn>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ player: initialPlayer }) => {
  const [player, setPlayer] = useState(initialPlayer);
  const [tab, setTab] = useState("quests");
  const [toast, setToast] = useState(null);
  const [levelUpShow, setLevelUpShow] = useState(false);

  const cls = CLASSES.find(x => x.id === player.classId);
  const xpNeeded = XP_PER_LEVEL(player.level);
  const weapon = WEAPONS[player.weaponIndex || 0];

  // Reset daily tasks if new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (player.lastPlayDate !== today) {
      const last = player.lastPlayDate ? new Date(player.lastPlayDate) : null;
      const now = new Date();
      let streak = player.streak || 0;
      if (last) {
        const diff = Math.floor((now - last) / 86400000);
        if (diff === 1) streak += 1;
        else if (diff > 1) streak = 0;
      }
      updatePlayer({ completedToday: [], streak, lastPlayDate: today });
    }
  }, []);

  const showToast = (msg, color = "#f1c40f") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const updatePlayer = (updates) => {
    setPlayer(prev => {
      const next = { ...prev, ...updates };
      db.save(next);
      // Update party if in one
      if (next.partyCode) {
        db.joinParty(next.partyCode, {
          id: next.id, name: next.name, classId: next.classId,
          className: next.className, sprite: next.sprite || cls?.sprite,
          level: next.level, streak: next.streak || 0,
        });
      }
      return next;
    });
  };

  const completeTask = (task, catKey, xp, gold) => {
    const key = `${catKey}:${task.name}`;
    if (player.completedToday?.includes(key)) return;

    let newXP = player.xp + xp;
    let newGold = player.gold + gold;
    let newLevel = player.level;
    let newMaxHp = player.maxHp;
    let newHp = player.hp;
    let didLevel = false;

    while (newXP >= XP_PER_LEVEL(newLevel)) {
      newXP -= XP_PER_LEVEL(newLevel);
      newLevel++; newMaxHp += 15; newHp = newMaxHp; didLevel = true;
    }

    updatePlayer({
      xp: newXP, gold: newGold, level: newLevel, maxHp: newMaxHp, hp: newHp,
      completedToday: [...(player.completedToday || []), key],
      totalTasksDone: (player.totalTasksDone || 0) + 1,
    });

    showToast(`+${xp} XP  +${gold} G`, "#f1c40f");
    if (didLevel) {
      setTimeout(() => setLevelUpShow(true), 600);
      setTimeout(() => setLevelUpShow(false), 3000);
    }
  };

  const addCustomTask = (catKey, task) => {
    const customs = { ...(player.customTasks || {}) };
    if (!customs[catKey]) customs[catKey] = [];
    customs[catKey] = [...customs[catKey], task];
    updatePlayer({ customTasks: customs });
  };

  return (
    <div style={{
      minHeight: "100dvh", position: "relative", zIndex: 1,
      paddingBottom: 70, // space for bottom tabs
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "#0a0a16", border: `2px solid ${toast.color}`, padding: "8px 18px",
          fontFamily: FONT_BODY, fontSize: 8, color: toast.color, zIndex: 1000,
          boxShadow: `0 0 20px ${toast.color}30`, animation: "fadeUp 0.3s ease",
        }}>{toast.msg}</div>
      )}

      {/* Level Up overlay */}
      {levelUpShow && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 1001, gap: 10, animation: "fadeUp 0.3s ease",
        }}>
          <div style={{ fontSize: 48 }}>⬆️</div>
          <div style={{ fontFamily: FONT_TITLE, fontSize: 20, color: "#f1c40f", textShadow: "0 0 20px #f1c40f" }}>
            LEVEL UP!
          </div>
          <div style={{ fontFamily: FONT_TITLE, fontSize: 28, color: "#fff" }}>LVL {player.level}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#888" }}>HP RESTORED • +15 MAX HP</div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2, padding: "14px 14px 0" }}>
        {/* Hero header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
        }}>
          <div style={{
            fontSize: 28, width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0a0a16", border: `2px solid ${cls?.color || "#333"}40`,
          }}>{cls?.sprite}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: "#fff" }}>{player.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#f1c40f" }}>💰 {player.gold}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: cls?.color }}>
                LVL {player.level} {cls?.name}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#e67e22" }}>
                🔥 {player.streak || 0}
              </div>
            </div>
          </div>
        </div>

        {/* HP + XP bars */}
        <div style={{ marginBottom: 6 }}>
          <HPBar current={player.hp} max={player.maxHp} color="#e74c3c" label={`HP • ${weapon.icon} ${weapon.name}`} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <HPBar current={player.xp} max={xpNeeded} color="#f1c40f" height={10} label="EXP" />
        </div>

        {/* Tab content */}
        {tab === "quests" && (
          <QuestsTab player={player} onComplete={completeTask} onAddTask={addCustomTask} />
        )}
        {tab === "battle" && (
          <BattleTab player={player} onUpdate={updatePlayer} />
        )}
        {tab === "shop" && (
          <ShopTab player={player} onUpdate={updatePlayer} />
        )}
        {tab === "bag" && (
          <BagTab player={player} onUpdate={updatePlayer} />
        )}
      </div>

      <BottomTabs active={tab} onTab={setTab} />
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function QuestIRL() {
  const [screen, setScreen] = useState("loading");
  const [player, setPlayer] = useState(null);
  const [revealCode, setRevealCode] = useState(null);

  useEffect(() => {
    const saved = db.load();
    if (saved) { setPlayer(saved); setScreen("dashboard"); }
    else setScreen("title");
  }, []);

  const handleDone = (p, createdCode) => {
    setPlayer(p);
    if (createdCode) { setRevealCode(createdCode); setScreen("reveal"); }
    else setScreen("dashboard");
  };

  return (
    <div style={{ background: "#08081a", minHeight: "100dvh", overflow: "hidden" }}>
      <StarField />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
      }} />

      {screen === "loading" && (
        <div style={{
          minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", zIndex: 2,
        }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 8, color: "#e74c3c", animation: "blink 1s step-end infinite" }}>
            LOADING...
          </p>
        </div>
      )}

      {screen === "title" && <TitleScreen onNew={() => setScreen("create")} onContinue={() => setScreen("dashboard")} hasSave={!!player} />}
      {screen === "create" && <CharCreate onDone={handleDone} />}
      {screen === "reveal" && revealCode && <PartyReveal code={revealCode} onGo={() => setScreen("dashboard")} />}
      {screen === "dashboard" && player && <Dashboard player={player} />}
    </div>
  );
}
