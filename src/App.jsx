import { useState, useEffect } from "react";

const FIELDS = [
  { key: "name", label: "名前", placeholder: "例：田中 太郎", icon: "👤" },
  { key: "hometown", label: "出身地", placeholder: "例：北海道 札幌市", icon: "📍" },
  { key: "skill", label: "特技", placeholder: "例：利き手と逆の手でも字が書ける", icon: "✨" },
  { key: "secret", label: "意外な一面", placeholder: "例：実は元バンドのドラマー", icon: "🎭" },
  { key: "message", label: "一言", placeholder: "例：よろしくお願いします！", icon: "💬" },
];

const CARD_COLORS = [
  { bg: "#FFF8E7", accent: "#F4A942", border: "#F4A942" },
  { bg: "#EDF6FF", accent: "#4A90D9", border: "#4A90D9" },
  { bg: "#F0FFF4", accent: "#38A169", border: "#38A169" },
  { bg: "#FFF0F6", accent: "#D53F8C", border: "#D53F8C" },
  { bg: "#FAF5FF", accent: "#805AD5", border: "#805AD5" },
  { bg: "#FFFFF0", accent: "#D69E2E", border: "#D69E2E" },
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ========== 登録画面 ==========
function RegisterView({ onAdd, members }) {
  const [form, setForm] = useState({ name: "", hometown: "", skill: "", secret: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("名前は必須です！"); return; }
    if (!form.hometown.trim() || !form.skill.trim() || !form.secret.trim()) {
      setError("全項目を入力してください！"); return;
    }
    onAdd({ ...form, id: generateId() });
    setForm({ name: "", hometown: "", skill: "", secret: "", message: "" });
    setSubmitted(true);
    setError("");
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "32px 28px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        border: "2px solid #F0E6FF",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✏️</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2D1B69", fontFamily: "'Noto Sans JP', sans-serif" }}>
            自己紹介を登録しよう
          </h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 13 }}>
            正直に書くほど盛り上がる 🎉
          </p>
        </div>

        {FIELDS.map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 6 }}>
              {f.icon} {f.label}
              {["hometown", "skill", "secret"].includes(f.key) && (
                <span style={{ color: "#E53E3E", marginLeft: 4 }}>*</span>
              )}
            </label>
            <input
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #E2D9F3",
                fontSize: 14,
                fontFamily: "'Noto Sans JP', sans-serif",
                outline: "none",
                boxSizing: "border-box",
                background: "#FAFAFA",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#9B72E6"}
              onBlur={e => e.target.style.borderColor = "#E2D9F3"}
            />
          </div>
        ))}

        {error && (
          <div style={{ color: "#E53E3E", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#FFF5F5", borderRadius: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: submitted ? "#38A169" : "linear-gradient(135deg, #9B72E6, #6B46C1)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
            transition: "all 0.3s",
            transform: submitted ? "scale(1.02)" : "scale(1)",
          }}
        >
          {submitted ? "✅ 登録完了！" : "登録する"}
        </button>

        {members.length > 0 && (
          <div style={{ marginTop: 20, padding: "12px 16px", background: "#F8F4FF", borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6B46C1", fontWeight: 700 }}>
              🟣 登録済み: {members.length}人
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {members.map(m => (
                <span key={m.id} style={{
                  background: "white",
                  border: "1px solid #D6BCFA",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 12,
                  color: "#553C9A",
                }}>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== クイズ画面 ==========
function QuizView({ members }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const q = shuffle(members);
    setQueue(q);
    if (q.length > 0) setCurrent(q[0]);
  }, [members]);

  const colorStyle = CARD_COLORS[colorIdx % CARD_COLORS.length];

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    const remaining = queue.slice(1);
    if (remaining.length === 0) {
      setDone(true);
    } else {
      setQueue(remaining);
      setCurrent(remaining[0]);
      setRevealed(false);
      setColorIdx(c => c + 1);
      setAnimKey(k => k + 1);
    }
  };

  const handleRestart = () => {
    const q = shuffle(members);
    setQueue(q);
    setCurrent(q[0]);
    setRevealed(false);
    setDone(false);
    setColorIdx(0);
    setAnimKey(0);
  };

  if (members.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
        <p style={{ color: "#888", fontSize: 16, fontFamily: "'Noto Sans JP', sans-serif" }}>
          クイズには2人以上の登録が必要です
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎊</div>
        <h2 style={{ fontFamily: "'Noto Sans JP', sans-serif", color: "#2D1B69", fontSize: 24, margin: "0 0 12px" }}>
          全員分おわり！
        </h2>
        <p style={{ color: "#666", marginBottom: 28, fontFamily: "'Noto Sans JP', sans-serif" }}>
          みんなのこと、少し知れたかな？
        </p>
        <button
          onClick={handleRestart}
          style={{
            padding: "12px 32px",
            background: "linear-gradient(135deg, #9B72E6, #6B46C1)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          もう一周する 🔄
        </button>
      </div>
    );
  }

  if (!current) return null;

  const total = members.length;
  const remaining = queue.length;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      {/* 進捗 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#888", fontFamily: "'Noto Sans JP', sans-serif" }}>
          {total - remaining + 1} / {total}問目
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {members.map((_, i) => (
            <div key={i} style={{
              width: 24,
              height: 6,
              borderRadius: 3,
              background: i < (total - remaining) ? "#9B72E6" : "#E2D9F3",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* クイズカード */}
      <div
        key={animKey}
        style={{
          background: colorStyle.bg,
          borderRadius: 24,
          border: `2.5px solid ${colorStyle.border}`,
          padding: "28px 24px",
          boxShadow: `0 8px 32px ${colorStyle.accent}22`,
          animation: "slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-block",
            background: colorStyle.accent,
            color: "white",
            borderRadius: 20,
            padding: "4px 16px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Noto Sans JP', sans-serif",
            marginBottom: 12,
          }}>
            この人、だ～れだ？
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#888", fontFamily: "'Noto Sans JP', sans-serif" }}>
            名前は隠されています 🙈
          </p>
        </div>

        {[
          { icon: "📍", label: "出身地", value: current.hometown },
          { icon: "✨", label: "特技", value: current.skill },
          { icon: "🎭", label: "意外な一面", value: current.secret },
          ...(current.message ? [{ icon: "💬", label: "一言", value: current.message }] : [])
        ].map((item, i) => (
          <div key={i} style={{
            background: "white",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 10,
            border: `1px solid ${colorStyle.accent}33`,
          }}>
            <div style={{ fontSize: 12, color: colorStyle.accent, fontWeight: 700, marginBottom: 4 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 15, color: "#2D1B69", fontWeight: 600, fontFamily: "'Noto Sans JP', sans-serif" }}>
              {item.value}
            </div>
          </div>
        ))}

        {/* 正解エリア */}
        {!revealed ? (
          <button
            onClick={handleReveal}
            style={{
              width: "100%",
              padding: "14px",
              background: colorStyle.accent,
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              marginTop: 8,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            正解を見る 👀
          </button>
        ) : (
          <div style={{
            marginTop: 8,
            padding: "20px",
            background: colorStyle.accent,
            borderRadius: 12,
            textAlign: "center",
            animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4, fontFamily: "'Noto Sans JP', sans-serif" }}>
              正解は...
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", fontFamily: "'Noto Sans JP', sans-serif" }}>
              {current.name} さん！
            </div>
            <button
              onClick={handleNext}
              style={{
                marginTop: 14,
                padding: "10px 28px",
                background: "white",
                color: colorStyle.accent,
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              次の問題へ →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ========== メインアプリ ==========
export default function App() {
  const [tab, setTab] = useState("register");
  const [members, setMembers] = useState([]);

  const handleAdd = (member) => {
    setMembers(prev => [...prev, member]);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #F8F4FF 0%, #EEF2FF 50%, #FFF0FB 100%)",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* ヘッダー */}
      <div style={{ textAlign: "center", padding: "36px 20px 24px" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, color: "#9B72E6", fontWeight: 700, marginBottom: 8 }}>
          NAITEI QUIZ
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#2D1B69", lineHeight: 1.2 }}>
          この人、だ～れだ？🎯
        </h1>
        <p style={{ margin: "8px 0 0", color: "#888", fontSize: 13 }}>
          内定者みんなの自己紹介クイズ
        </p>
      </div>

      {/* タブ */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28, padding: "0 16px" }}>
        <div style={{
          display: "flex",
          background: "white",
          borderRadius: 14,
          padding: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          gap: 4,
        }}>
          {[
            { key: "register", label: "✏️ 登録" },
            { key: "quiz", label: `🎯 クイズ${members.length > 0 ? ` (${members.length}人)` : ""}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Noto Sans JP', sans-serif",
                background: tab === t.key ? "linear-gradient(135deg, #9B72E6, #6B46C1)" : "transparent",
                color: tab === t.key ? "white" : "#888",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ paddingBottom: 48 }}>
        {tab === "register" ? (
          <RegisterView onAdd={handleAdd} members={members} />
        ) : (
          <QuizView members={members} />
        )}
      </div>
    </div>
  );
}
