import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare, Eye, ArrowLeft, Send, BookOpen,
  ThumbsUp, Heart, PartyPopper, HeartHandshake, Lightbulb,
  CornerDownRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../../components/Avatar";

const API = import.meta.env.VITE_API_URL || "";

const CATEGORY_COLORS = {
  ensa: "#7c3aed", ensias: "#7c3aed", emi: "#7c3aed", inpt: "#7c3aed", ehtp: "#7c3aed",
  medecine: "#ef4444", pharmacie: "#ef4444",
  encg: "#f59e0b", iscae: "#f59e0b",
  cpge: "#3b82f6",
  orientation: "#10b981", vie_etudiante: "#10b981",
  bourses: "#06b6d4", temoignages: "#a78bfa",
};

const REACTIONS = [
  { type: "like",       Icon: ThumbsUp,      label: "J'aime",     color: "#7c3aed" },
  { type: "love",       Icon: Heart,         label: "J'adore",    color: "#ef4444" },
  { type: "celebrate",  Icon: PartyPopper,   label: "Bravo",      color: "#f59e0b" },
  { type: "support",    Icon: HeartHandshake,label: "Soutien",    color: "#ec4899" },
  { type: "insightful", Icon: Lightbulb,     label: "Instructif", color: "#10b981" },
];

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" });
}


export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [post, setPost]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);
  const [replyErr, setReplyErr] = useState("");

  // Reactions
  const [userReaction, setUserReaction]         = useState(null);
  const [reactions, setReactions]               = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionTimerRef = useRef(null);

  // Nested replies
  const [replyingTo, setReplyingTo]     = useState(null);
  const [nestedReply, setNestedReply]   = useState("");
  const [sendingNested, setSendingNested] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("najahi_token");
    fetch(`${API}/api/forum/posts/${postId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        setPost(d);
        setReactions(d.reactions || {});
        setUserReaction(d.user_reaction || (d.liked ? "like" : null));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  const handleReact = async (reactionType) => {
    if (!user) { navigate("/login"); return; }
    const token = localStorage.getItem("najahi_token");
    try {
      const res = await fetch(`${API}/api/forum/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reaction_type: reactionType }),
      });
      if (res.ok) {
        const d = await res.json();
        setUserReaction(d.reaction_type);
        setReactions(d.reactions || {});
      }
    } catch {}
    setShowReactionPicker(false);
  };

  const handleReactOnReply = async (replyId, reactionType) => {
    if (!user) { navigate("/login"); return; }
    const token = localStorage.getItem("najahi_token");
    try {
      const res = await fetch(`${API}/api/forum/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reaction_type: reactionType, reply_id: replyId }),
      });
      if (res.ok) {
        const d = await res.json();
        setPost(p => ({
          ...p,
          replies: (p.replies || []).map(r =>
            r.id === replyId
              ? { ...r, reactions: d.reactions || {}, user_reaction: d.reaction_type }
              : r
          ),
        }));
      }
    } catch {}
  };

  const handleReply = async () => {
    if (!user) { navigate("/login"); return; }
    if (!reply.trim()) return;
    setSending(true); setReplyErr("");
    try {
      const token = localStorage.getItem("najahi_token");
      const res = await fetch(`${API}/api/forum/posts/${postId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setPost(p => ({ ...p, replies: [...(p.replies || []), data] }));
      setReply("");
    } catch (e) {
      setReplyErr(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleNestedReply = async (parentReplyId) => {
    if (!user || !nestedReply.trim()) return;
    setSendingNested(true);
    try {
      const token = localStorage.getItem("najahi_token");
      const res = await fetch(`${API}/api/forum/posts/${postId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: nestedReply.trim(), parent_reply_id: parentReplyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setPost(p => ({ ...p, replies: [...(p.replies || []), { ...data, parent_reply_id: parentReplyId }] }));
      setNestedReply("");
      setReplyingTo(null);
    } catch {}
    finally { setSendingNested(false); }
  };

  // Theme tokens
  const bg      = dark ? "linear-gradient(135deg,#0f0a1e 0%,#160d2e 50%,#0d1a2e 100%)" : "linear-gradient(135deg,#f8f7ff 0%,#f0eeff 50%,#f5f3ff 100%)";
  const navBg   = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const navBdr  = dark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)";
  const tc      = dark ? "#fff" : "#1a1625";
  const sc      = dark ? "rgba(255,255,255,0.45)" : "rgba(26,22,37,0.5)";
  const cardBg  = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)";
  const cardBdr = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(124,58,237,0.1)";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "#fafaf9";
  const inputBdr = dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid #e8e4de";
  const catColor = post ? (CATEGORY_COLORS[post.category] || "#7c3aed") : "#7c3aed";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!post || post.error) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: sc, fontFamily: "'DM Sans',sans-serif" }}>
      <p style={{ fontSize: 18 }}>Discussion introuvable</p>
      <button onClick={() => navigate("/app/forum")} style={{ padding: "10px 20px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
        Retour au forum
      </button>
    </div>
  );

  const topLevelReplies = (post.replies || []).filter(r => !r.parent_reply_id);
  const getChildren = (replyId) => (post.replies || []).filter(r => r.parent_reply_id === replyId);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", transition: "background 0.5s" }}>

        {/* Navbar */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", gap: 12, padding: isMobile ? "0 16px" : "14px 28px", height: isMobile ? 56 : "auto", background: navBg, backdropFilter: "blur(18px)", borderBottom: `1px solid ${navBdr}` }}>
          <button onClick={() => navigate("/app/forum")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", background: dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.07)", border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(124,58,237,0.15)", borderRadius: 10, color: "#7c3aed", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(124,58,237,0.07)"}
          >
            <ArrowLeft size={14} /> Forum
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/app/dashboard")}>
            <BookOpen size={18} color="#7c3aed" />
            <span style={{ fontSize: 16, fontWeight: 700, color: tc, fontFamily: "'Fraunces',serif" }}>Najahi</span>
          </div>
        </nav>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "20px 12px 48px" : "32px 24px 64px", animation: "fadeUp 0.45s ease both" }}>

          {/* Post */}
          <div style={{ background: cardBg, border: cardBdr, borderRadius: 20, padding: isMobile ? "22px 18px" : "32px 36px", marginBottom: 24, backdropFilter: "blur(16px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: catColor, background: catColor + "18", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.3px" }}>
                {post.category?.toUpperCase()}
              </span>
              {post.school && (
                <span style={{ fontSize: 11, fontWeight: 600, color: sc, background: dark ? "rgba(255,255,255,0.07)" : "rgba(26,22,37,0.06)", padding: "3px 10px", borderRadius: 99 }}>
                  {post.school}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: isMobile ? 20 : 26, fontWeight: 700, color: tc, lineHeight: 1.3, marginBottom: 20, letterSpacing: "-0.3px" }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, paddingBottom: 20, borderBottom: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(124,58,237,0.08)" }}>
              <Avatar src={post.author?.avatar_url} name={[post.author?.prenom, post.author?.nom].filter(Boolean).join(" ")} size={40} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: tc, margin: 0 }}>
                  {post.author?.prenom} {post.author?.nom}
                </p>
                <p style={{ fontSize: 12, color: sc, margin: 0, marginTop: 2 }}>{fmtDate(post.created_at)}</p>
              </div>
            </div>

            <p style={{ fontSize: 15, color: tc, lineHeight: 1.75, whiteSpace: "pre-wrap", marginBottom: 24 }}>
              {post.content}
            </p>

            {/* Stats + reaction button */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {/* Reaction button with picker */}
              <div style={{ position: "relative" }}
                onMouseEnter={() => {
                  clearTimeout(reactionTimerRef.current);
                  reactionTimerRef.current = setTimeout(() => setShowReactionPicker(true), 300);
                }}
                onMouseLeave={() => {
                  clearTimeout(reactionTimerRef.current);
                  reactionTimerRef.current = setTimeout(() => setShowReactionPicker(false), 200);
                }}
              >
                <button onClick={() => handleReact(userReaction || "like")} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                  background: userReaction ? "rgba(124,58,237,0.12)" : dark ? "rgba(255,255,255,0.07)" : "rgba(26,22,37,0.06)",
                  border: userReaction ? "1px solid rgba(124,58,237,0.3)" : dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(26,22,37,0.1)",
                  borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                  color: userReaction ? (REACTIONS.find(r => r.type === userReaction)?.color || "#7c3aed") : sc,
                }}>
                  {(() => {
                    const r = REACTIONS.find(x => x.type === userReaction);
                    if (r) return <r.Icon size={14} />;
                    return <ThumbsUp size={14} />;
                  })()}
                  {totalReactions > 0 ? totalReactions : "Réagir"}
                </button>

                {showReactionPicker && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: 0,
                    display: "flex", gap: 2, padding: "8px 10px",
                    background: dark ? "#1a0f3a" : "#fff",
                    border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(124,58,237,0.2)",
                    borderRadius: 99, boxShadow: "0 8px 28px rgba(0,0,0,0.25)", zIndex: 50,
                  }}>
                    {REACTIONS.map(({ type, Icon, label, color }) => (
                      <div key={type} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <button onClick={() => handleReact(type)} title={label} style={{
                          width: 36, height: 36, borderRadius: "50%", border: "none",
                          background: type === userReaction ? `${color}20` : "transparent",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "transform 0.15s", color,
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                          <Icon size={20} />
                        </button>
                        <span style={{ fontSize: 9, color: sc, whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: sc }}>
                <MessageSquare size={14} /> {post.replies?.length || 0} réponse{post.replies?.length !== 1 ? "s" : ""}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: sc }}>
                <Eye size={14} /> {post.views} vue{post.views !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Reaction counts breakdown */}
            {totalReactions > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {REACTIONS.filter(r => (reactions[r.type] || 0) > 0).map(({ type, Icon, color }) => (
                  <span key={type} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: sc }}>
                    <Icon size={13} color={color} /> {reactions[type]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Replies */}
          {topLevelReplies.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: sc, marginBottom: 14, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                {post.replies.length} réponse{post.replies.length !== 1 ? "s" : ""}
              </p>
              {topLevelReplies.map((r, i) => (
                <div key={r.id || i}>
                  <ReplyCard
                    r={r} i={i} dark={dark} tc={tc} sc={sc} cardBg={cardBg} cardBdr={cardBdr}
                    inputBg={inputBg} inputBdr={inputBdr} isMobile={isMobile}
                    replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                    nestedReply={nestedReply} setNestedReply={setNestedReply}
                    sendingNested={sendingNested}
                    handleNestedReply={handleNestedReply}
                    handleReactOnReply={handleReactOnReply}
                    user={user} navigate={navigate}
                  />

                  {/* Nested (child) replies */}
                  {getChildren(r.id).map((child, ci) => (
                    <div key={child.id || ci} style={{ marginLeft: 24, borderLeft: "2px solid rgba(124,58,237,0.2)", paddingLeft: 12, marginBottom: 8 }}>
                      <ReplyCard
                        r={child} i={ci} dark={dark} tc={tc} sc={sc} cardBg={cardBg} cardBdr={cardBdr}
                        inputBg={inputBg} inputBdr={inputBdr} isMobile={isMobile}
                        replyingTo={null} setReplyingTo={() => {}}
                        nestedReply="" setNestedReply={() => {}}
                        sendingNested={false}
                        handleNestedReply={() => {}}
                        handleReactOnReply={handleReactOnReply}
                        user={user} navigate={navigate}
                        isNested
                      />
                    </div>
                  ))}

                  {/* Inline reply input */}
                  {replyingTo === r.id && (
                    <div style={{ marginLeft: 24, borderLeft: "2px solid rgba(124,58,237,0.2)", paddingLeft: 12, marginBottom: 12 }}>
                      <textarea
                        value={nestedReply}
                        onChange={e => setNestedReply(e.target.value)}
                        placeholder="Ta réponse…"
                        rows={2}
                        autoFocus
                        style={{ width: "100%", padding: "8px 10px", background: inputBg, border: inputBdr, borderRadius: 10, fontSize: 13, color: tc, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "none", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                        onBlur={e => { e.target.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#e8e4de"; e.target.style.boxShadow = "none"; }}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNestedReply(r.id); } }}
                      />
                      <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => { setReplyingTo(null); setNestedReply(""); }}
                          style={{ padding: "5px 12px", background: "none", border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(26,22,37,0.15)", borderRadius: 8, fontSize: 12, color: sc, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                          Annuler
                        </button>
                        <button onClick={() => handleNestedReply(r.id)} disabled={sendingNested || !nestedReply.trim()}
                          style={{ padding: "5px 12px", background: (!nestedReply.trim() || sendingNested) ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: (!nestedReply.trim() || sendingNested) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                          <Send size={11} /> {sendingNested ? "…" : "Répondre"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reply box */}
          <div style={{ background: cardBg, border: cardBdr, borderRadius: 20, padding: isMobile ? "20px 16px" : "24px 28px", backdropFilter: "blur(16px)" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: tc, marginBottom: 14 }}>
              {user ? "Ajouter une réponse" : "Connecte-toi pour répondre"}
            </p>
            {replyErr && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{replyErr}</div>}
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={user ? "Ta réponse… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)" : "Connecte-toi pour participer à la discussion"}
              disabled={!user}
              rows={4}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && user) { e.preventDefault(); handleReply(); } }}
              style={{ width: "100%", padding: "12px 14px", background: inputBg, border: inputBdr, borderRadius: 12, fontSize: 14, color: tc, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical", lineHeight: 1.65, boxSizing: "border-box", opacity: user ? 1 : 0.5 }}
              onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#e8e4de"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              {user ? (
                <button onClick={handleReply} disabled={sending || !reply.trim()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", background: (!reply.trim() || sending) ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: (!reply.trim() || sending) ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: (!reply.trim() || sending) ? "none" : "0 4px 16px rgba(124,58,237,0.4)" }}>
                  <Send size={14} /> {sending ? "Envoi…" : "Répondre"}
                </button>
              ) : (
                <button onClick={() => navigate("/login")} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function ReplyCard({ r, i, dark, tc, sc, cardBg, cardBdr, inputBg, inputBdr, isMobile, replyingTo, setReplyingTo, nestedReply, setNestedReply, sendingNested, handleNestedReply, handleReactOnReply, user, navigate, isNested }) {
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef(null);

  const replyReactions = r.reactions || {};
  const totalReplyReactions = Object.values(replyReactions).reduce((a, b) => a + b, 0);
  const userReplyReaction = r.user_reaction || null;

  return (
    <div style={{ background: cardBg, border: cardBdr, borderRadius: 14, padding: isMobile ? "14px 14px" : "18px 20px", marginBottom: 8, backdropFilter: "blur(12px)", animation: `fadeUp 0.3s ${i * 0.05}s ease both` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar src={r.author?.avatar_url} name={[r.author?.prenom, r.author?.nom].filter(Boolean).join(" ")} size={32} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: tc, margin: 0 }}>
            {r.author?.prenom} {r.author?.nom}
          </p>
          <p style={{ fontSize: 11, color: sc, margin: 0, marginTop: 1 }}>{fmtDate(r.created_at)}</p>
        </div>
      </div>
      <p style={{ fontSize: 14, color: tc, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, marginBottom: 10 }}>
        {r.content}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Reply reaction button */}
        <div style={{ position: "relative" }}
          onMouseEnter={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowPicker(true), 300); }}
          onMouseLeave={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowPicker(false), 200); }}
        >
          <button onClick={() => handleReactOnReply(r.id, userReplyReaction || "like")} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
            background: userReplyReaction ? "rgba(124,58,237,0.1)" : "transparent",
            border: userReplyReaction ? "1px solid rgba(124,58,237,0.25)" : dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(26,22,37,0.08)",
            borderRadius: 99, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            color: userReplyReaction ? (REACTIONS.find(rx => rx.type === userReplyReaction)?.color || "#7c3aed") : sc,
            transition: "all 0.15s",
          }}>
            {(() => {
              const rx = REACTIONS.find(x => x.type === userReplyReaction);
              if (rx) return <rx.Icon size={12} />;
              return <ThumbsUp size={12} />;
            })()}
            {totalReplyReactions > 0 ? totalReplyReactions : ""}
          </button>

          {showPicker && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 6px)", left: 0,
              display: "flex", gap: 2, padding: "6px 8px",
              background: dark ? "#1a0f3a" : "#fff",
              border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(124,58,237,0.2)",
              borderRadius: 99, boxShadow: "0 6px 20px rgba(0,0,0,0.2)", zIndex: 50,
            }}>
              {REACTIONS.map(({ type, Icon, label, color }) => (
                <button key={type} onClick={() => { handleReactOnReply(r.id, type); setShowPicker(false); }} title={label} style={{
                  width: 30, height: 30, borderRadius: "50%", border: "none",
                  background: type === userReplyReaction ? `${color}20` : "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.15s", color,
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Répondre button (not shown on nested replies) */}
        {!isNested && (
          <button onClick={() => { setReplyingTo(replyingTo === r.id ? null : r.id); setNestedReply(""); }}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: replyingTo === r.id ? "#7c3aed" : sc, padding: "4px 8px", borderRadius: 8, transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = "#7c3aed"}
            onMouseLeave={e => e.currentTarget.style.color = replyingTo === r.id ? "#7c3aed" : sc}
          >
            <CornerDownRight size={12} /> Répondre
          </button>
        )}

        {/* Reaction breakdown */}
        {totalReplyReactions > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            {REACTIONS.filter(rx => (replyReactions[rx.type] || 0) > 0).map(({ type, Icon, color }) => (
              <span key={type} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, color: sc }}>
                <Icon size={11} color={color} /> {replyReactions[type]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
