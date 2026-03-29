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

// ─── DASHBOARD (placeholder) ─────────────────────────────────────────────────
const Dashboard = ({ player }) => {
  const c = CLASSES.find(x => x.id === player.classId);
  return (
    <div style={{ minHeight: "100dvh", position: "relative", zIndex: 1, padding: 20 }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: 16,
          border: `2px solid ${c?.color || "#333"}`, background: `${c?.color || "#333"}08`,
        }}>
          <div style={{ fontSize: 38 }}>{c?.sprite}</div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: "#fff" }}>{player.name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 7, color: c?.color }}>LVL {player.level} {c?.name}</div>
            {player.partyCode && (
              <div style={{ fontFamily: FONT_BODY, fontSize: 6, color: "#444", marginTop: 3 }}>
                PARTY: {player.partyCode}
              </div>
            )}
          </div>
        </div>

        <div style={{
          textAlign: "center", padding: "48px 20px",
          border: "2px dashed #1a1a2e", marginTop: 20,
        }}>
          <div style={{ fontSize: 36, marginBottom: 18 }}>🏗️</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: "#f1c40f", marginBottom: 10 }}>
            QUEST LOG — NEXT
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 7, color: "#444", lineHeight: 2.2 }}>
            YOUR HERO IS READY.<br />
            NEXT: DAILY QUESTS, BATTLES,<br />
            PARTY LEADERBOARD &amp; LOOT.
          </div>
        </div>
      </div>
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
