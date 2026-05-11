import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc, collection, onSnapshot,
  setDoc, updateDoc, getDoc, serverTimestamp
} from "firebase/firestore";

// ===== ユーティリティ =====
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const CARD_COLORS = [
  { bg: "#FFF8E7", accent: "#F4A942", border: "#F4A942" },
  { bg: "#EDF6FF", accent: "#4A90D9", border: "#4A90D9" },
  { bg: "#F0FFF4", accent: "#38A169", border: "#38A169" },
  { bg: "#FFF0F6", accent: "#D53F8C", border: "#D53F8C" },
  { bg: "#FAF5FF", accent: "#805AD5", border: "#805AD5" },
  { bg: "#FFFFF0", accent: "#D69E2E", border: "#D69E2E" },
];

const isHost = new URLSearchParams(window.location.search).get("host") === "true";

// ===== 名前入力画面 =====
function NameEntryView({ onEnter }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) { setError("名前を入力してください"); return; }
    onEnter(name.trim());
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "0 16px" }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "2px solid #F0E6FF",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#2D1B69" }}>
          まず名前を入力してね
        </h2>
        <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>
          クイズに表示される名前です
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="例：田中 太郎"
          autoFocus
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10,
            border: "1.5px solid #E2D9F3", fontSize: 16,
            fontFamily: "'Noto Sans JP', sans-serif", outline: "none",
            boxSizing: "border-box", marginBottom: 16,
          }}
        />
        {error && <p style={{ color: "#E53E3E", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
        <button onClick={handleSubmit} style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(135deg, #9B72E6, #6B46C1)",
          color: "white", border: "none", borderRadius: 12,
          fontSize: 16, fontWeight: 800, cursor: "pointer",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          参加する 🎉
        </button>
      </div>
    </div>
  );
}

// ===== 自己紹介登録画面 =====
const FIELDS = [
  { key: "hometown", label: "出身地", placeholder: "例：北海道 札幌市", icon: "📍", required: true },
  { key: "skill", label: "特技", placeholder: "例：利き手と逆の手でも字が書ける", icon: "✨", required: true },
  { key: "secret", label: "意外な一面", placeholder: "例：実は元バンドのドラマー", icon: "🎭", required: true },
  { key: "message", label: "一言", placeholder: "例：よろしくお願いします！", icon: "💬", required: false },
];

function RegisterView({ userName, onSubmit }) {
  const [form, setForm] = useState({ hometown: "", skill: "", secret: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (FIELDS.filter(f => f.required).some(f => !form[f.key].trim())) {
      setError("出身地・特技・意外な一面は必須です！"); return;
    }
    setLoading(true);
    try { await onSubmit(form); }
    catch { setError("エラーが発生しました。再試行してください。"); setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "2px solid #F0E6FF",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✏️</div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2D1B69" }}>
            {userName}さんの自己紹介
          </h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 13 }}>
            正直に書くほど盛り上がる 🎉
          </p>
        </div>

        {FIELDS.map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 6 }}>
              {f.icon} {f.label}
              {f.required && <span style={{ color: "#E53E3E", marginLeft: 4 }}>*</span>}
            </label>
            <input
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "1.5px solid #E2D9F3", fontSize: 14,
                fontFamily: "'Noto Sans JP', sans-serif", outline: "none",
                boxSizing: "border-box", background: "#FAFAFA",
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

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "14px",
          background: loading ? "#ccc" : "linear-gradient(135deg, #9B72E6, #6B46C1)",
          color: "white", border: "none", borderRadius: 12,
          fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          {loading ? "登録中..." : "登録する"}
        </button>
      </div>
    </div>
  );
}

// ===== 待機室 =====
function WaitingView({ members, onStart }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "32px 28px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "2px solid #F0E6FF",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#2D1B69" }}>
          参加者を待っています
        </h2>
        <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>
          全員が登録したらクイズスタート！
        </p>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#6B46C1", marginBottom: 12 }}>
            登録済み: {members.length}人
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {members.map(m => (
              <span key={m.id} style={{
                background: "#F8F4FF", border: "1px solid #D6BCFA",
                borderRadius: 20, padding: "6px 14px", fontSize: 14,
                color: "#553C9A", fontWeight: 600,
              }}>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={onStart} disabled={members.length < 2} style={{
            width: "100%", padding: "16px",
            background: members.length >= 2 ? "linear-gradient(135deg, #F4A942, #E8820C)" : "#ccc",
            color: "white", border: "none", borderRadius: 12,
            fontSize: 18, fontWeight: 800,
            cursor: members.length >= 2 ? "pointer" : "not-allowed",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}>
            🎯 クイズスタート！
          </button>
        ) : (
          <p style={{ color: "#aaa", fontSize: 13 }}>
            司会者がクイズを開始するまでお待ちください
          </p>
        )}
      </div>
    </div>
  );
}

// ===== クイズ画面 =====
function QuizView({ session, members, userId, onAnswer, onReveal, onNext }) {
  const { currentQuestionIdx, questionOrder, revealed } = session;
  const currentMemberId = questionOrder[currentQuestionIdx];
  const currentMember = members.find(m => m.id === currentMemberId);
  const colorStyle = CARD_COLORS[currentQuestionIdx % CARD_COLORS.length];
  const total = questionOrder.length;

  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!currentMember) return;
    const others = members.filter(m => m.id !== currentMemberId);
    const picks = shuffle(others).slice(0, Math.min(3, others.length)).map(m => m.name);
    setOptions(shuffle([currentMember.name, ...picks]));
  }, [currentQuestionIdx, currentMemberId]);

  const answerKey = `quiz-answer-q${currentQuestionIdx}`;
  const [myAnswer, setMyAnswer] = useState(() => localStorage.getItem(answerKey));
  useEffect(() => {
    setMyAnswer(localStorage.getItem(answerKey));
  }, [currentQuestionIdx]);

  const handleAnswer = async (name) => {
    if (myAnswer || revealed) return;
    setMyAnswer(name);
    localStorage.setItem(answerKey, name);
    await onAnswer(name, name === currentMember.name);
  };

  if (!currentMember || options.length === 0) return null;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#888" }}>
          {currentQuestionIdx + 1} / {total}問目
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {questionOrder.map((_, i) => (
            <div key={i} style={{
              width: 24, height: 6, borderRadius: 3,
              background: i < currentQuestionIdx ? "#9B72E6" : i === currentQuestionIdx ? colorStyle.accent : "#E2D9F3",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      <div style={{
        background: colorStyle.bg, borderRadius: 24,
        border: `2.5px solid ${colorStyle.border}`, padding: "28px 24px",
        boxShadow: `0 8px 32px ${colorStyle.accent}22`,
        animation: "slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-block", background: colorStyle.accent,
            color: "white", borderRadius: 20, padding: "4px 16px",
            fontSize: 13, fontWeight: 700, marginBottom: 8,
          }}>
            この人、だ～れだ？
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>名前は隠されています 🙈</p>
        </div>

        {[
          { icon: "📍", label: "出身地", value: currentMember.hometown },
          { icon: "✨", label: "特技", value: currentMember.skill },
          { icon: "🎭", label: "意外な一面", value: currentMember.secret },
          ...(currentMember.message ? [{ icon: "💬", label: "一言", value: currentMember.message }] : [])
        ].map((item, i) => (
          <div key={i} style={{
            background: "white", borderRadius: 12, padding: "12px 16px",
            marginBottom: 10, border: `1px solid ${colorStyle.accent}33`,
          }}>
            <div style={{ fontSize: 12, color: colorStyle.accent, fontWeight: 700, marginBottom: 2 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 15, color: "#2D1B69", fontWeight: 600 }}>
              {item.value}
            </div>
          </div>
        ))}

        {!revealed ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              {options.map((name, i) => (
                <button key={i} onClick={() => handleAnswer(name)} disabled={!!myAnswer} style={{
                  padding: "14px 10px", borderRadius: 12,
                  border: myAnswer === name ? `2.5px solid ${colorStyle.accent}` : "2px solid #E2D9F3",
                  background: myAnswer === name ? colorStyle.bg : "white",
                  fontSize: 15, fontWeight: 700,
                  cursor: myAnswer ? "default" : "pointer",
                  color: "#2D1B69", fontFamily: "'Noto Sans JP', sans-serif",
                  transition: "all 0.15s",
                  opacity: myAnswer && myAnswer !== name ? 0.5 : 1,
                }}>
                  {name}
                </button>
              ))}
            </div>
            <p style={{
              textAlign: "center", fontSize: 13, marginTop: 12, fontWeight: 700,
              color: myAnswer ? "#9B72E6" : "#aaa",
            }}>
              {myAnswer ? "✅ 回答済み！司会者の発表を待ってね" : "誰だか思う人を選んでね"}
            </p>
          </>
        ) : (
          <div style={{
            marginTop: 16, padding: "20px", background: colorStyle.accent,
            borderRadius: 12, textAlign: "center",
            animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>正解は...</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", fontFamily: "'Noto Sans JP', sans-serif" }}>
              {currentMember.name} さん！
            </div>
            {myAnswer && (
              <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700,
                color: myAnswer === currentMember.name ? "#FFFDE7" : "#FFD0D0" }}>
                {myAnswer === currentMember.name ? "✅ 正解！ +10pt" : `❌ あなたの回答: ${myAnswer}`}
              </div>
            )}
          </div>
        )}

        {isHost && !revealed && (
          <button onClick={onReveal} style={{
            width: "100%", marginTop: 12, padding: "12px",
            background: "#2D1B69", color: "white", border: "none",
            borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}>
            正解を発表する 🎉
          </button>
        )}
        {isHost && revealed && (
          <button onClick={onNext} style={{
            width: "100%", marginTop: 12, padding: "12px",
            background: "linear-gradient(135deg, #9B72E6, #6B46C1)",
            color: "white", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}>
            {currentQuestionIdx + 1 < total ? "次の問題へ →" : "結果を見る 🏆"}
          </button>
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

// ===== ランキング =====
function LeaderboardView({ members, myUserId }) {
  const sorted = [...members].sort((a, b) => (b.score || 0) - (a.score || 0));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 56 }}>🏆</div>
        <h2 style={{ color: "#2D1B69", fontSize: 24, margin: "8px 0 4px", fontWeight: 900 }}>最終結果！</h2>
        <p style={{ color: "#888", fontSize: 13 }}>みんなのこと、少し知れたかな？</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((m, i) => (
          <div key={m.id} style={{
            background: "white", borderRadius: 16, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: m.userId === myUserId
              ? "0 0 0 2px #9B72E6, 0 4px 20px rgba(155,114,230,0.2)"
              : "0 2px 12px rgba(0,0,0,0.06)",
            border: m.userId === myUserId ? "2px solid #9B72E6" : "2px solid transparent",
          }}>
            <div style={{ fontSize: 28, width: 40, textAlign: "center" }}>
              {medals[i] ?? `${i + 1}`}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#2D1B69" }}>
                {m.name}{m.userId === myUserId ? " （あなた）" : ""}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#9B72E6" }}>
              {m.score || 0}pt
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== メインアプリ =====
export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("naitei-quiz-user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "session", "main"), snap => {
      setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleNameEnter = (name) => {
    const newUser = { userId: generateId(), userName: name };
    setUser(newUser);
    localStorage.setItem("naitei-quiz-user", JSON.stringify(newUser));
  };

  const handleRegister = async (form) => {
    const memberId = generateId();
    await setDoc(doc(db, "members", memberId), {
      userId: user.userId,
      name: user.userName,
      score: 0,
      ...form,
    });
    await setDoc(doc(db, "session", "main"), {
      status: "registration",
      currentQuestionIdx: 0,
      questionOrder: [],
      revealed: false,
    }, { merge: true });
    const newUser = { ...user, memberId };
    setUser(newUser);
    localStorage.setItem("naitei-quiz-user", JSON.stringify(newUser));
  };

  const handleStart = async () => {
    const order = shuffle(members.map(m => m.id));
    await setDoc(doc(db, "session", "main"), {
      status: "quiz",
      currentQuestionIdx: 0,
      questionOrder: order,
      revealed: false,
    });
  };

  const handleAnswer = async (answerName, correct) => {
    if (!user) return;
    const docId = `q${session.currentQuestionIdx}_${user.userId}`;
    const existing = await getDoc(doc(db, "answers", docId));
    if (existing.exists()) return;

    await setDoc(doc(db, "answers", docId), {
      userId: user.userId,
      answerName,
      correct,
      timestamp: serverTimestamp(),
    });

    if (correct && user.memberId) {
      const memberRef = doc(db, "members", user.memberId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        await updateDoc(memberRef, { score: (memberSnap.data().score || 0) + 10 });
      }
    }
  };

  const handleReveal = async () => {
    await updateDoc(doc(db, "session", "main"), { revealed: true });
  };

  const handleNext = async () => {
    const nextIdx = session.currentQuestionIdx + 1;
    if (nextIdx >= session.questionOrder.length) {
      await updateDoc(doc(db, "session", "main"), { status: "finished" });
    } else {
      await updateDoc(doc(db, "session", "main"), {
        currentQuestionIdx: nextIdx,
        revealed: false,
      });
    }
  };

  const isRegistered = user?.memberId && members.some(m => m.id === user.memberId);

  let content;
  if (loading) {
    content = <div style={{ textAlign: "center", padding: 60, color: "#888" }}>読み込み中...</div>;
  } else if (session?.status === "finished") {
    content = <LeaderboardView members={members} myUserId={user?.userId} />;
  } else if (session?.status === "quiz") {
    content = (
      <QuizView
        session={session}
        members={members}
        userId={user?.userId}
        onAnswer={handleAnswer}
        onReveal={handleReveal}
        onNext={handleNext}
      />
    );
  } else if (!user) {
    content = <NameEntryView onEnter={handleNameEnter} />;
  } else if (!isRegistered) {
    content = <RegisterView userName={user.userName} onSubmit={handleRegister} />;
  } else {
    content = <WaitingView members={members} onStart={handleStart} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #F8F4FF 0%, #EEF2FF 50%, #FFF0FB 100%)",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", padding: "28px 20px 20px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#9B72E6", fontWeight: 700, marginBottom: 6 }}>
          NAITEI QUIZ
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#2D1B69" }}>
          この人、だ～れだ？🎯
        </h1>
        {isHost && (
          <span style={{
            display: "inline-block", marginTop: 6,
            background: "#F4A942", color: "white",
            borderRadius: 12, padding: "2px 12px", fontSize: 12, fontWeight: 700,
          }}>
            👑 司会者モード
          </span>
        )}
      </div>

      <div style={{ paddingBottom: 48 }}>{content}</div>
    </div>
  );
}
