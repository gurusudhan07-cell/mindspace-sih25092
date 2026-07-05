import { useState, useEffect, useRef } from "react";

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:  "#1B2B4B", sky:  "#5B8DEF", lav: "#9B8FE8",
  white: "#F7F9FF", card: "#FFFFFF", muted: "#8A96B0",
  green: "#4CAF7D", red:  "#E53935", yellow: "#FFB347", text: "#1B2B4B",
};

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function lsClear() {
  try {
    localStorage.removeItem("ms_user");
    localStorage.removeItem("ms_mood");
    localStorage.removeItem("ms_chat");
  } catch {}
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const TIPS = [
  "Take a 5-minute break every hour while studying. Your brain needs rest.",
  "Drink enough water today. Dehydration directly affects your mood.",
  "Reach out to a friend today. Social connection is great for mental health.",
  "Sleep 7–8 hours tonight. Sleep is when your brain heals.",
  "Step outside for 10 minutes. Fresh air can instantly lift your mood.",
  "Practice box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
];
const AFFIRMATIONS = {
  1: "It's okay to have hard days. You are not alone — we are here for you. 💙",
  2: "Tomorrow can be better. Take it one step at a time. You've got this.",
  3: "You're doing okay. Keep going, one day at a time. 🌱",
  4: "Great to see you feeling better! Keep taking care of yourself. 😊",
  5: "Amazing! Your positive energy matters. Have a wonderful day! 🌟",
};
const MOOD_EMOJIS  = ["😢","😕","😐","🙂","😄"];
const MOOD_LABELS  = ["Very Bad","Bad","Neutral","Good","Very Good"];
const CRISIS_WORDS = ["suicide","kill myself","end my life","want to die","self harm","hurt myself","no reason to live","give up on life","die"];
const COUNSELORS   = [
  { id:1, name:"Dr. Priya Sharma", spec:"Anxiety & Depression",      days:"Mon, Wed, Fri", emoji:"👩‍⚕️" },
  { id:2, name:"Mr. Arjun Nair",   spec:"Academic Stress",           days:"Tue, Thu",      emoji:"👨‍⚕️" },
  { id:3, name:"Dr. Meena Iyer",   spec:"Relationships & Loneliness",days:"Mon, Thu, Sat", emoji:"👩‍⚕️" },
];
const RESOURCES = [
  { id:1,  cat:"Anxiety",    type:"Article",  title:"Understanding Anxiety: A Student Guide",    desc:"Learn to identify anxiety triggers and manage them effectively." },
  { id:2,  cat:"Stress",     type:"Exercise", title:"5-Minute Box Breathing Exercise",           desc:"A guided breathing technique to calm your nervous system instantly." },
  { id:3,  cat:"Depression", type:"Article",  title:"Recognising Signs of Depression",          desc:"Early signs of depression and when to seek professional help." },
  { id:4,  cat:"Sleep",      type:"Audio",    title:"Body Scan Meditation for Sleep",            desc:"A 10-minute guided meditation to help you fall asleep peacefully." },
  { id:5,  cat:"Stress",     type:"Article",  title:"How to Deal with Exam Stress",             desc:"Practical tips and strategies for managing academic pressure." },
  { id:6,  cat:"Anxiety",    type:"Exercise", title:"Progressive Muscle Relaxation",            desc:"Release physical tension caused by anxiety in just 7 minutes." },
  { id:7,  cat:"Loneliness", type:"Article",  title:"Coping with Loneliness in College",        desc:"Feeling alone is common. Here's how to build meaningful connections." },
  { id:8,  cat:"Crisis",     type:"Helpline", title:"iCall — 9152987821",                       desc:"Mon–Sat, 8am–10pm. Free professional counselling support." },
  { id:9,  cat:"Crisis",     type:"Helpline", title:"Vandrevala Foundation — 1860-2662-345",    desc:"Available 24 hours, 7 days a week. Always here for you." },
  { id:10, cat:"Crisis",     type:"Helpline", title:"SNEHI — 044-24640050",                     desc:"Mon–Sat, 8am–10pm. Trained counsellors ready to listen." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}
function moodColor(s) {
  return [C.red, C.yellow, C.muted, C.sky, C.green][s-1] || C.muted;
}
function todayStr() { return new Date().toDateString(); }

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.white};color:${C.text};}
  .app{min-height:100vh;display:flex;flex-direction:column;}
  .navbar{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(247,249,255,0.95);
    backdrop-filter:blur(12px);border-bottom:1px solid #E2E8F8;
    display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:60px;}
  .logo{font-size:20px;font-weight:800;color:${C.sky};letter-spacing:-0.5px;}
  .logo span{color:${C.lav};}
  .sos-btn{background:${C.red};color:#fff;border:none;border-radius:20px;
    padding:8px 20px;font-weight:700;font-size:14px;cursor:pointer;
    animation:pulse-ring 2s infinite;}
  @keyframes pulse-ring{
    0%{box-shadow:0 0 0 0 rgba(229,57,53,0.4);}
    70%{box-shadow:0 0 0 10px rgba(229,57,53,0);}
    100%{box-shadow:0 0 0 0 rgba(229,57,53,0);}
  }
  .bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;
    background:#fff;border-top:1px solid #E2E8F8;
    display:flex;justify-content:space-around;padding:8px 0 12px;}
  .nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;
    background:none;border:none;cursor:pointer;padding:4px 16px;
    font-size:10px;font-weight:600;color:${C.muted};transition:color 0.2s;font-family:inherit;}
  .nav-item.active{color:${C.sky};}
  .nav-icon{font-size:20px;}
  .main{padding:76px 20px 100px;max-width:480px;margin:0 auto;width:100%;}
  .card{background:${C.card};border-radius:16px;padding:20px;
    box-shadow:0 2px 12px rgba(27,43,75,0.07);margin-bottom:16px;}
  .card-title{font-size:13px;font-weight:700;color:${C.muted};
    text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;}
  .greeting-name{font-size:26px;font-weight:800;color:${C.navy};line-height:1.2;}
  .greeting-sub{font-size:14px;color:${C.muted};margin-top:4px;}
  .mood-row{display:flex;justify-content:space-between;margin:12px 0;}
  .mood-emoji{font-size:32px;cursor:pointer;border-radius:50%;width:52px;height:52px;
    display:flex;align-items:center;justify-content:center;
    transition:all 0.2s;border:2px solid transparent;}
  .mood-emoji:hover{background:${C.white};transform:scale(1.15);}
  .mood-emoji.selected{border-color:${C.sky};background:#EEF4FF;transform:scale(1.2);}
  .quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;}
  .quick-card{background:${C.card};border-radius:16px;padding:18px 14px;
    box-shadow:0 2px 12px rgba(27,43,75,0.07);cursor:pointer;
    border:1.5px solid transparent;transition:all 0.2s;
    display:flex;flex-direction:column;gap:8px;}
  .quick-card:hover{border-color:${C.sky};transform:translateY(-2px);
    box-shadow:0 6px 20px rgba(91,141,239,0.15);}
  .quick-card-icon{font-size:28px;}
  .quick-card-label{font-size:13px;font-weight:700;color:${C.navy};}
  .quick-card-sub{font-size:11px;color:${C.muted};}
  .tip-card{background:linear-gradient(135deg,${C.lav}22,${C.sky}22);
    border:1.5px solid ${C.lav}44;border-radius:16px;padding:18px;margin-bottom:16px;}
  .tip-label{font-size:11px;font-weight:700;color:${C.lav};text-transform:uppercase;
    letter-spacing:0.8px;margin-bottom:6px;}
  .tip-text{font-size:14px;color:${C.navy};line-height:1.6;font-weight:500;}
  .affirmation{background:linear-gradient(135deg,${C.green}15,${C.sky}15);
    border:1.5px solid ${C.green}44;border-radius:12px;padding:14px;
    font-size:14px;color:${C.navy};line-height:1.6;margin-top:12px;font-weight:500;}
  .journal-input{width:100%;border:1.5px solid #E2E8F8;border-radius:12px;
    padding:12px;font-size:14px;font-family:inherit;resize:none;
    color:${C.text};margin-top:12px;outline:none;transition:border 0.2s;background:${C.white};}
  .journal-input:focus{border-color:${C.sky};}
  .btn{background:${C.sky};color:#fff;border:none;border-radius:12px;
    padding:13px 24px;font-weight:700;font-size:14px;cursor:pointer;
    width:100%;margin-top:12px;transition:all 0.2s;font-family:inherit;}
  .btn:hover{background:#4a7de0;transform:translateY(-1px);}
  .btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
  .btn.secondary{background:${C.white};color:${C.sky};border:1.5px solid ${C.sky};}
  .btn.secondary:hover{background:#EEF4FF;}
  .btn.danger{background:${C.red};}
  .btn.danger:hover{background:#c62828;}
  .chat-wrap{display:flex;flex-direction:column;gap:12px;}
  .chat-bubble{max-width:82%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.6;}
  .chat-bubble.user{background:${C.sky};color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
  .chat-bubble.bot{background:#fff;color:${C.text};align-self:flex-start;
    border:1.5px solid #E2E8F8;border-bottom-left-radius:4px;
    box-shadow:0 2px 8px rgba(27,43,75,0.06);}
  .chat-input-row{position:fixed;bottom:72px;left:0;right:0;background:${C.white};
    border-top:1px solid #E2E8F8;padding:12px 16px;
    display:flex;gap:8px;max-width:480px;margin:0 auto;}
  .chat-input{flex:1;border:1.5px solid #E2E8F8;border-radius:24px;
    padding:10px 16px;font-size:14px;font-family:inherit;outline:none;
    transition:border 0.2s;background:#fff;}
  .chat-input:focus{border-color:${C.sky};}
  .chat-send{background:${C.sky};color:#fff;border:none;border-radius:24px;
    padding:10px 18px;font-size:18px;cursor:pointer;transition:all 0.2s;}
  .chat-send:hover{background:#4a7de0;}
  .typing{display:flex;gap:4px;align-items:center;padding:4px 0;}
  .dot{width:7px;height:7px;border-radius:50%;background:${C.muted};animation:bounce 1.2s infinite;}
  .dot:nth-child(2){animation-delay:0.2s;}
  .dot:nth-child(3){animation-delay:0.4s;}
  @keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}
  .filter-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px;}
  .filter-tab{background:#fff;border:1.5px solid #E2E8F8;border-radius:20px;
    padding:6px 16px;font-size:12px;font-weight:600;cursor:pointer;
    white-space:nowrap;color:${C.muted};transition:all 0.2s;font-family:inherit;}
  .filter-tab.active{background:${C.sky};border-color:${C.sky};color:#fff;}
  .resource-card{background:#fff;border-radius:14px;padding:16px;
    border:1.5px solid #E2E8F8;margin-bottom:10px;cursor:pointer;transition:all 0.2s;}
  .resource-card:hover{border-color:${C.sky};transform:translateX(3px);}
  .resource-tag{display:inline-block;background:${C.sky}18;color:${C.sky};
    border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;margin-bottom:6px;}
  .resource-title{font-size:14px;font-weight:700;color:${C.navy};margin-bottom:4px;}
  .resource-desc{font-size:12px;color:${C.muted};line-height:1.5;}
  .history-bar-wrap{display:flex;gap:4px;align-items:flex-end;height:80px;margin:12px 0;}
  .history-bar{flex:1;border-radius:4px 4px 0 0;transition:all 0.3s;cursor:pointer;position:relative;}
  .history-bar:hover::after{content:attr(data-val);position:absolute;top:-22px;
    left:50%;transform:translateX(-50%);background:${C.navy};color:#fff;
    font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;}
  .counselor-card{background:#fff;border-radius:14px;padding:16px;
    border:1.5px solid #E2E8F8;margin-bottom:10px;display:flex;gap:14px;align-items:center;}
  .counselor-avatar{width:50px;height:50px;border-radius:50%;
    background:linear-gradient(135deg,${C.sky},${C.lav});
    display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
  .counselor-name{font-size:15px;font-weight:700;color:${C.navy};}
  .counselor-spec{font-size:12px;color:${C.muted};margin:2px 0;}
  .counselor-days{font-size:11px;color:${C.green};font-weight:600;}
  .book-btn{margin-left:auto;background:${C.sky};color:#fff;border:none;
    border-radius:10px;padding:8px 16px;font-size:12px;font-weight:700;
    cursor:pointer;font-family:inherit;flex-shrink:0;transition:all 0.2s;}
  .book-btn:hover{background:#4a7de0;}
  .sos-page{min-height:100vh;background:linear-gradient(160deg,#1565C0,#1B2B4B);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:40px 24px;text-align:center;}
  .sos-heading{font-size:26px;font-weight:800;color:#fff;margin:20px 0 8px;line-height:1.3;}
  .sos-sub{font-size:15px;color:rgba(255,255,255,0.75);margin-bottom:32px;}
  .helpline-card{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
    border-radius:16px;padding:20px;width:100%;max-width:340px;margin-bottom:12px;
    display:flex;align-items:center;justify-content:space-between;}
  .helpline-name{font-size:15px;font-weight:700;color:#fff;}
  .helpline-num{font-size:13px;color:rgba(255,255,255,0.7);margin-top:2px;}
  .helpline-avail{font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;}
  .call-btn{background:${C.green};color:#fff;border:none;border-radius:10px;
    padding:10px 18px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;}
  .safe-btn{background:rgba(255,255,255,0.15);color:#fff;border:1.5px solid rgba(255,255,255,0.3);
    border-radius:14px;padding:14px 40px;font-size:15px;font-weight:700;
    cursor:pointer;margin-top:24px;font-family:inherit;transition:all 0.2s;}
  .safe-btn:hover{background:rgba(255,255,255,0.25);}
  .auth-wrap{min-height:100vh;display:flex;flex-direction:column;
    align-items:center;justify-content:center;padding:32px 24px;
    background:linear-gradient(160deg,#EEF4FF 0%,${C.white} 60%);}
  .auth-logo{font-size:36px;font-weight:800;color:${C.sky};letter-spacing:-1px;margin-bottom:6px;}
  .auth-logo span{color:${C.lav};}
  .auth-tagline{font-size:14px;color:${C.muted};margin-bottom:32px;font-weight:500;}
  .auth-card{background:#fff;border-radius:20px;padding:28px 24px;
    width:100%;max-width:380px;box-shadow:0 4px 24px rgba(27,43,75,0.1);}
  .auth-label{font-size:12px;font-weight:700;color:${C.muted};
    text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;}
  .auth-input{width:100%;border:1.5px solid #E2E8F8;border-radius:10px;
    padding:12px 14px;font-size:14px;font-family:inherit;outline:none;
    color:${C.text};margin-bottom:16px;transition:border 0.2s;background:${C.white};}
  .auth-input:focus{border-color:${C.sky};}
  .auth-switch{text-align:center;margin-top:16px;font-size:13px;color:${C.muted};}
  .auth-link{color:${C.sky};font-weight:700;cursor:pointer;}
  .anon-link{display:block;text-align:center;margin-top:12px;
    font-size:13px;color:${C.lav};font-weight:600;cursor:pointer;}
  .profile-avatar-big{width:80px;height:80px;border-radius:50%;
    background:linear-gradient(135deg,${C.sky},${C.lav});
    display:flex;align-items:center;justify-content:center;
    font-size:36px;margin:0 auto 12px;}
  .profile-name{font-size:20px;font-weight:800;color:${C.navy};text-align:center;}
  .profile-email{font-size:13px;color:${C.muted};text-align:center;margin-top:4px;}
  .info-row{display:flex;justify-content:space-between;align-items:center;
    padding:12px 0;border-bottom:1px solid #F0F3FA;}
  .info-label{font-size:13px;color:${C.muted};font-weight:500;}
  .info-value{font-size:13px;font-weight:700;color:${C.navy};}
  .toast{position:fixed;top:72px;left:50%;transform:translateX(-50%);
    background:${C.navy};color:#fff;padding:10px 20px;border-radius:24px;
    font-size:13px;font-weight:600;z-index:999;animation:fadeInOut 2.5s forwards;}
  @keyframes fadeInOut{
    0%{opacity:0;transform:translateX(-50%) translateY(-10px);}
    15%{opacity:1;transform:translateX(-50%) translateY(0);}
    75%{opacity:1;}100%{opacity:0;}
  }
  .search-input{width:100%;border:1.5px solid #E2E8F8;border-radius:12px;
    padding:11px 16px;font-size:14px;font-family:inherit;outline:none;
    color:${C.text};margin-bottom:14px;transition:border 0.2s;background:#fff;}
  .search-input:focus{border-color:${C.sky};}
  .section-heading{font-size:20px;font-weight:800;color:${C.navy};margin-bottom:16px;}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
  .badge.green{background:${C.green}18;color:${C.green};}
  .badge.yellow{background:${C.yellow}25;color:#b06000;}
  .saved-notice{background:#EEF4FF;border:1.5px solid ${C.sky}33;border-radius:10px;
    padding:8px 14px;font-size:12px;color:${C.sky};font-weight:600;
    text-align:center;margin-bottom:12px;}
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}

// ─── SOS PAGE ─────────────────────────────────────────────────────────────────
function SOSPage({ onClose }) {
  return (
    <div className="sos-page">
      <div style={{ fontSize:56 }}>🆘</div>
      <h1 className="sos-heading">You are not alone.<br/>Help is available right now.</h1>
      <p className="sos-sub">Please reach out to one of these helplines.</p>
      {[
        { name:"iCall (TISS Mumbai)",     num:"9152987821",    avail:"Mon–Sat, 8am–10pm" },
        { name:"Vandrevala Foundation",   num:"1860-2662-345", avail:"24 hours, 7 days"  },
        { name:"SNEHI",                   num:"044-24640050",  avail:"Mon–Sat, 8am–10pm" },
      ].map(h => (
        <div className="helpline-card" key={h.num}>
          <div>
            <div className="helpline-name">{h.name}</div>
            <div className="helpline-num">{h.num}</div>
            <div className="helpline-avail">{h.avail}</div>
          </div>
          <button className="call-btn" onClick={() => window.open(`tel:${h.num.replace(/\D/g,"")}`)}>
            📞 Call
          </button>
        </div>
      ))}
      <button className="safe-btn" onClick={onClose}>✅ I am Safe — Go Back</button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, moodHistory, onNav, streak }) {
  const tip    = TIPS[new Date().getDay() % TIPS.length];
  const today  = moodHistory.find(e => e.date === todayStr());

  return (
    <div className="main">
      <div className="saved-notice">💾 Your progress is saved automatically</div>

      <div className="card">
        <p className="greeting-sub">{getGreeting()} 👋</p>
        <h1 className="greeting-name">{user.name}</h1>
        <p className="greeting-sub" style={{ marginTop:6 }}>How are you feeling today?</p>
      </div>

      {today ? (
        <div className="card">
          <div className="card-title">Today's Mood</div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:40 }}>{MOOD_EMOJIS[today.score-1]}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:moodColor(today.score) }}>
                {MOOD_LABELS[today.score-1]}
              </div>
              {today.journal && (
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  "{today.journal.slice(0,40)}{today.journal.length>40?"…":""}"
                </div>
              )}
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right" }}>
              <div style={{ fontSize:24, fontWeight:800, color:C.navy }}>🔥 {streak}</div>
              <div style={{ fontSize:11, color:C.muted }}>day streak</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ cursor:"pointer", border:`1.5px solid ${C.sky}` }}
             onClick={() => onNav("mood")}>
          <div className="card-title">Check In Today</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:C.muted }}>Tap to log your mood</span>
            <span style={{ fontSize:28 }}>➡️</span>
          </div>
          <div className="mood-row" style={{ pointerEvents:"none" }}>
            {MOOD_EMOJIS.map(e => <div key={e} className="mood-emoji">{e}</div>)}
          </div>
        </div>
      )}

      <div className="quick-grid">
        {[
          { icon:"💬", label:"MindBot Chat",   sub:"Talk to AI anytime",    page:"chat"       },
          { icon:"📚", label:"Resources",      sub:"Articles & exercises",  page:"resources"  },
          { icon:"📅", label:"Book Counselor", sub:"Schedule a session",    page:"counselors" },
          { icon:"📊", label:"Mood History",   sub:"View your journey",     page:"history"    },
        ].map(q => (
          <div key={q.page} className="quick-card" onClick={() => onNav(q.page)}>
            <div className="quick-card-icon">{q.icon}</div>
            <div className="quick-card-label">{q.label}</div>
            <div className="quick-card-sub">{q.sub}</div>
          </div>
        ))}
      </div>

      <div className="tip-card">
        <div className="tip-label">💡 Daily Tip</div>
        <div className="tip-text">{tip}</div>
      </div>
    </div>
  );
}

// ─── MOOD CHECKIN ─────────────────────────────────────────────────────────────
function MoodCheckin({ onSave, existing }) {
  const [selected, setSelected] = useState(existing?.score || 0);
  const [journal,  setJournal]  = useState(existing?.journal || "");
  const [saved,    setSaved]    = useState(false);

  function handleSave() {
    if (!selected) return;
    onSave({ score:selected, journal, date:todayStr() });
    setSaved(true);
  }

  return (
    <div className="main">
      <div className="section-heading">How are you feeling?</div>
      <div className="card">
        <div className="card-title">Select Your Mood</div>
        <div className="mood-row">
          {MOOD_EMOJIS.map((e,i) => (
            <div key={i}
              className={`mood-emoji ${selected===i+1?"selected":""}`}
              onClick={() => { setSelected(i+1); setSaved(false); }}
              title={MOOD_LABELS[i]}>{e}</div>
          ))}
        </div>
        {selected > 0 && (
          <div style={{ textAlign:"center", fontSize:13, fontWeight:700, color:moodColor(selected), marginTop:6 }}>
            {MOOD_LABELS[selected-1]}
          </div>
        )}
        <textarea className="journal-input" placeholder="Want to write about it? (optional)"
          rows={3} value={journal} onChange={e => setJournal(e.target.value)} />
        <button className="btn" onClick={handleSave} disabled={!selected}>
          {saved ? "✅ Saved!" : "Save Check-in"}
        </button>
        {saved && selected && (
          <div className="affirmation">{AFFIRMATIONS[selected]}</div>
        )}
      </div>
    </div>
  );
}

// ─── MOOD HISTORY ─────────────────────────────────────────────────────────────
function MoodHistory({ history }) {
  const last14 = history.slice(-14);
  const avg    = history.length
    ? MOOD_LABELS[Math.round(history.reduce((a,b)=>a+b.score,0)/history.length)-1]
    : "—";

  return (
    <div className="main">
      <div className="section-heading">Mood Journey 📊</div>

      {last14.length === 0 ? (
        <div className="card">
          <div style={{ textAlign:"center", color:C.muted, padding:"24px 0" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>📊</div>
            No entries yet. Start your daily check-in!
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">Last {last14.length} Days</div>
          <div className="history-bar-wrap">
            {last14.map((e,i) => (
              <div key={i} className="history-bar"
                style={{ height:`${(e.score/5)*100}%`, background:moodColor(e.score), opacity:0.85 }}
                data-val={MOOD_LABELS[e.score-1]}
                title={`${e.date}: ${MOOD_LABELS[e.score-1]}`} />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:4 }}>
            <span>Oldest</span><span>Today</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Stats</div>
        {[
          { label:"Total Entries",  value: history.length },
          { label:"Average Mood",   value: avg },
          { label:"Best Mood",      value: history.length ? MOOD_LABELS[Math.max(...history.map(e=>e.score))-1] : "—" },
        ].map(r => (
          <div key={r.label} className="info-row">
            <span className="info-label">{r.label}</span>
            <span className="info-value">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Recent Entries</div>
        {history.length === 0 && (
          <div style={{ color:C.muted, fontSize:13, padding:"8px 0" }}>No entries yet.</div>
        )}
        {history.slice().reverse().slice(0,10).map((e,i) => (
          <div key={i} className="info-row">
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{MOOD_EMOJIS[e.score-1]} {MOOD_LABELS[e.score-1]}</div>
              <div style={{ fontSize:11, color:C.muted }}>{e.date}</div>
            </div>
            {e.journal && (
              <div style={{ fontSize:12, color:C.muted, maxWidth:"50%", textAlign:"right" }}>
                "{e.journal.slice(0,28)}{e.journal.length>28?"…":""}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ savedMessages, onUpdateMessages, onSOS }) {
  const initMsgs = savedMessages.length
    ? savedMessages
    : [{ role:"bot", text:"Hi! I'm MindBot 💙 I'm here to listen and support you. How are you feeling today?" }];

  const [messages, setMessages] = useState(initMsgs);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    onUpdateMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (CRISIS_WORDS.some(w => text.toLowerCase().includes(w))) {
      const crisis = { role:"bot", text:"I'm very concerned. Please reach out to a crisis helpline right now — tap the SOS button. You matter and help is available. 💙" };
      setMessages(m => [...m, { role:"user", text }, crisis]);
      setTimeout(onSOS, 1500);
      return;
    }

    const newMsgs = [...messages, { role:"user", text }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:"You are MindBot, a compassionate and empathetic mental health support assistant for college students in India. Listen carefully, respond with kindness, use CBT-inspired techniques. Never diagnose. Keep responses to 2-3 sentences. Use one relevant emoji per message. Always respond in simple friendly English.",
          messages: newMsgs.map(m => ({ role: m.role==="bot"?"assistant":"user", content:m.text })),
        }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || "I'm here with you. Can you tell me more? 💙";
      setMessages(m => [...m, { role:"bot", text:reply }]);
    } catch {
      setMessages(m => [...m, { role:"bot", text:"I'm here with you. You can always reach the helplines via the SOS button if you need immediate support. 💙" }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ paddingTop:72, paddingBottom:140, maxWidth:480, margin:"0 auto" }}>
      <div style={{ padding:"0 20px 20px" }}>
        <div className="section-heading">MindBot Chat 💬</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16, background:"#EEF4FF", borderRadius:10, padding:"8px 12px" }}>
          💾 Your chat history is saved. It will be here when you come back.
        </div>
        <div className="chat-wrap">
          {messages.map((m,i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
          ))}
          {loading && (
            <div className="chat-bubble bot">
              <div className="typing">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()} />
        <button className="chat-send" onClick={send}>➤</button>
      </div>
    </div>
  );
}

// ─── RESOURCES ────────────────────────────────────────────────────────────────
function Resources() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const cats = ["All","Anxiety","Stress","Depression","Sleep","Loneliness","Crisis"];
  const filtered = RESOURCES.filter(r =>
    (filter==="All" || r.cat===filter) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
     r.desc.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="main">
      <div className="section-heading">Resource Library 📚</div>
      <input className="search-input" placeholder="🔍 Search resources…"
        value={search} onChange={e => setSearch(e.target.value)} />
      <div className="filter-tabs">
        {cats.map(c => (
          <button key={c} className={`filter-tab ${filter===c?"active":""}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      {filtered.length===0 && (
        <div style={{ textAlign:"center", color:C.muted, padding:"32px 0", fontSize:14 }}>
          No resources found. Try a different search.
        </div>
      )}
      {filtered.map(r => (
        <div key={r.id} className="resource-card">
          <div className="resource-tag">{r.type}</div>
          <div className="resource-title">{r.title}</div>
          <div className="resource-desc">{r.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ─── COUNSELORS ───────────────────────────────────────────────────────────────
function Counselors() {
  const [selected, setSelected] = useState(null);
  const [date,     setDate]     = useState("");
  const [time,     setTime]     = useState("");
  const [booked,   setBooked]   = useState(null);

  function confirmBook() {
    if (!date || !time) return;
    setBooked({ counselor:selected, date, time });
    setSelected(null); setDate(""); setTime("");
  }

  return (
    <div className="main">
      <div className="section-heading">Book a Counselor 📅</div>

      {booked && (
        <div className="card" style={{ border:`1.5px solid ${C.green}` }}>
          <div style={{ color:C.green, fontWeight:700, fontSize:15, marginBottom:6 }}>✅ Appointment Booked!</div>
          <div style={{ fontSize:13, color:C.muted }}>{booked.counselor.name} · {booked.date} · {booked.time}</div>
          <button className="btn secondary" style={{ marginTop:12 }} onClick={() => setBooked(null)}>Book Another</button>
        </div>
      )}

      {COUNSELORS.map(c => (
        <div key={c.id} className="counselor-card">
          <div className="counselor-avatar">{c.emoji}</div>
          <div>
            <div className="counselor-name">{c.name}</div>
            <div className="counselor-spec">{c.spec}</div>
            <div className="counselor-days">📅 {c.days}</div>
          </div>
          <button className="book-btn" onClick={() => setSelected(c)}>Book</button>
        </div>
      ))}

      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(27,43,75,0.5)",
          display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:200 }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:28, width:"100%", maxWidth:480 }}>
            <div style={{ fontWeight:800, fontSize:18, color:C.navy, marginBottom:4 }}>Book Appointment</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>with {selected.name}</div>
            <div className="auth-label">Preferred Date</div>
            <input type="date" className="auth-input" value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} />
            <div className="auth-label">Time Slot</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {["10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"].map(t => (
                <button key={t} onClick={() => setTime(t)}
                  style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid",
                    borderColor:time===t?C.sky:"#E2E8F8",
                    background:time===t?"#EEF4FF":"#fff",
                    color:time===t?C.sky:C.muted,
                    fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>{t}</button>
              ))}
            </div>
            <button className="btn" onClick={confirmBook} disabled={!date||!time}>Confirm Booking</button>
            <button className="btn secondary" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function Profile({ user, streak, moodHistory, onLogout, onClearChat }) {
  return (
    <div className="main">
      <div className="section-heading">My Profile</div>
      <div className="card" style={{ textAlign:"center", paddingTop:28, paddingBottom:28 }}>
        <div className="profile-avatar-big">🧑‍🎓</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        {user.anonymous && (
          <span className="badge yellow" style={{ marginTop:8 }}>Anonymous Mode</span>
        )}
      </div>

      <div className="card">
        <div className="card-title">Wellness Stats</div>
        {[
          { label:"Current Streak",  value:`🔥 ${streak} days` },
          { label:"Total Check-ins", value: moodHistory.length },
          { label:"Average Mood",    value: moodHistory.length
              ? MOOD_LABELS[Math.round(moodHistory.reduce((a,b)=>a+b.score,0)/moodHistory.length)-1]
              : "—" },
        ].map(r => (
          <div key={r.label} className="info-row">
            <span className="info-label">{r.label}</span>
            <span className="info-value">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Project Info</div>
        {[
          { label:"PS Number",    value:"SIH25092" },
          { label:"Project",      value:"MindSpace" },
          { label:"Organisation", value:"Govt. of J&K" },
        ].map(r => (
          <div key={r.label} className="info-row">
            <span className="info-label">{r.label}</span>
            <span className="info-value">{r.value}</span>
          </div>
        ))}
      </div>

      <button className="btn secondary" onClick={onClearChat} style={{ marginBottom:8 }}>
        🗑️ Clear Chat History
      </button>
      <button className="btn danger" onClick={onLogout}>Log Out</button>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [mode,  setMode]  = useState("login");
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");

  function submit() {
    setErr("");
    if (mode==="register") {
      if (!name.trim())           return setErr("Name is required.");
      if (!email.includes("@"))   return setErr("Enter a valid email.");
      if (pass.length < 6)        return setErr("Password must be at least 6 characters.");
      onLogin({ name:name.trim(), email, anonymous:false });
    } else {
      if (!email || !pass)        return setErr("Please fill all fields.");
      onLogin({ name:email.split("@")[0], email, anonymous:false });
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">Mind<span>Space</span></div>
      <div className="auth-tagline">Your safe space to breathe and heal 💙</div>
      <div className="auth-card">
        <div style={{ fontWeight:800, fontSize:18, color:C.navy, marginBottom:20 }}>
          {mode==="login" ? "Welcome Back" : "Create Account"}
        </div>
        {mode==="register" && (
          <>
            <div className="auth-label">Full Name</div>
            <input className="auth-input" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} />
          </>
        )}
        <div className="auth-label">College Email</div>
        <input className="auth-input" type="email" placeholder="you@college.ac.in"
          value={email} onChange={e => setEmail(e.target.value)} />
        <div className="auth-label">Password</div>
        <input className="auth-input" type="password" placeholder="••••••••"
          value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key==="Enter" && submit()} />
        {err && <div style={{ color:C.red, fontSize:12, marginBottom:8, fontWeight:600 }}>⚠️ {err}</div>}
        <button className="btn" onClick={submit}>
          {mode==="login" ? "Login" : "Create Account"}
        </button>
        <div className="auth-switch">
          {mode==="login" ? "Don't have an account? " : "Already have an account? "}
          <span className="auth-link"
            onClick={() => { setMode(m => m==="login"?"register":"login"); setErr(""); }}>
            {mode==="login" ? "Register" : "Login"}
          </span>
        </div>
        <span className="anon-link"
          onClick={() => onLogin({ name:"Anonymous User", email:"anon@mindspace.app", anonymous:true })}>
          Continue without account →
        </span>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── State with localStorage persistence ──
  const [user,        setUser]        = useState(() => lsGet("ms_user", null));
  const [moodHistory, setMoodHistory] = useState(() => lsGet("ms_mood", []));
  const [chatMsgs,    setChatMsgs]    = useState(() => lsGet("ms_chat", []));
  const [page,        setPage]        = useState("home");
  const [sos,         setSos]         = useState(false);
  const [toast,       setToast]       = useState("");
  const [toastKey,    setToastKey]    = useState(0);

  // Auto-save to localStorage on every change
  useEffect(() => { lsSet("ms_user", user); },        [user]);
  useEffect(() => { lsSet("ms_mood", moodHistory); }, [moodHistory]);
  useEffect(() => { lsSet("ms_chat", chatMsgs); },    [chatMsgs]);

  function showToast(msg) {
    setToast(msg); setToastKey(k => k+1);
    setTimeout(() => setToast(""), 2600);
  }

  function saveMood(entry) {
    setMoodHistory(h => {
      const without = h.filter(e => e.date !== todayStr());
      return [...without, entry];
    });
    showToast("Mood saved! 🌟");
  }

  function handleLogin(u) {
    setUser(u);
    showToast(`Welcome, ${u.name}! 💙`);
  }

  function handleLogout() {
    lsClear();
    setUser(null); setMoodHistory([]); setChatMsgs([]); setPage("home");
    showToast("Logged out. See you soon! 👋");
  }

  function handleClearChat() {
    setChatMsgs([]);
    showToast("Chat history cleared.");
  }

  // Streak calculation
  const streak = (() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      if (moodHistory.find(e => e.date === d.toDateString())) s++;
      else break;
    }
    return s;
  })();

  const todayMood = moodHistory.find(e => e.date === todayStr());

  // ── Render ──
  if (!user) return (
    <><style>{styles}</style>
      <Auth onLogin={handleLogin} />
      {toast && <Toast key={toastKey} msg={toast} />}
    </>
  );

  if (sos) return (
    <><style>{styles}</style>
      <SOSPage onClose={() => setSos(false)} />
    </>
  );

  const NAV = [
    { id:"home",      icon:"🏠", label:"Home"    },
    { id:"mood",      icon:"😊", label:"Mood"    },
    { id:"chat",      icon:"💬", label:"Chat"    },
    { id:"resources", icon:"📚", label:"Learn"   },
    { id:"profile",   icon:"👤", label:"Profile" },
  ];

  return (
    <><style>{styles}</style>
    <div className="app">
      <nav className="navbar">
        <div className="logo">Mind<span>Space</span></div>
        <button className="sos-btn" onClick={() => setSos(true)}>🆘 SOS</button>
      </nav>

      {toast && <Toast key={toastKey} msg={toast} />}

      {page==="home"       && <Dashboard user={user} moodHistory={moodHistory} onNav={setPage} streak={streak} />}
      {page==="mood"       && <MoodCheckin onSave={saveMood} existing={todayMood} />}
      {page==="history"    && <MoodHistory history={moodHistory} />}
      {page==="chat"       && <Chat savedMessages={chatMsgs} onUpdateMessages={setChatMsgs} onSOS={() => setSos(true)} />}
      {page==="resources"  && <Resources />}
      {page==="counselors" && <Counselors />}
      {page==="profile"    && (
        <Profile user={user} streak={streak} moodHistory={moodHistory}
          onLogout={handleLogout} onClearChat={handleClearChat} />
      )}

      <nav className="bottom-nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
    </>
  );
}
