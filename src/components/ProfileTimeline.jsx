import { CheckCircle, Circle, Lock, PartyPopper, User, Compass, Landmark, BookOpen, Trophy, Settings2, BarChart3, HeartPulse, Building2, GraduationCap } from "lucide-react";

const TYPE_ICON = {
  engineering: Settings2, business: BarChart3, health: HeartPulse,
  architecture: Building2, preparatoire: BookOpen, university: GraduationCap,
};

function buildSteps(profile, orientResult, soloStats, schoolsHistory) {
  const steps = [];
  const profileFilled = !!(
    profile?.prenom && profile?.nom && profile?.ville &&
    profile?.niveau && profile?.type_bac
  );

  // Step 1 — Inscription
  steps.push({
    done:    true,
    label:   "Compte créé",
    detail:  profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
      : "Bienvenue sur Najahi !",
    color:   "#7c3aed",
    icon:    PartyPopper,
  });

  // Step 2 — Profil
  steps.push({
    done:    profileFilled,
    label:   profileFilled ? "Profil complété" : "Compléter ton profil",
    detail:  profileFilled
      ? `${profile.prenom} ${profile.nom} · ${profile.niveau} · ${profile.ville}`
      : "Renseigne ton niveau, ville et type de bac",
    color:   "#8b5cf6",
    icon:    User,
    link:    !profileFilled ? "/app/profile" : null,
  });

  // Step 3 — Test orientation
  const hasOrient = !!orientResult;
  steps.push({
    done:    hasOrient,
    label:   hasOrient ? "Test d'orientation passé" : "Passer le test d'orientation",
    detail:  hasOrient
      ? `Résultat : ${orientResult.top_label || orientResult.top_type || "Voir le résultat"}`
      : "Découvre quelles filières te correspondent",
    color:   "#a78bfa",
    icon:    Compass,
    link:    !hasOrient ? "/app/orientation" : null,
  });

  // Step 4 — Écoles explorées
  const schoolCount = schoolsHistory?.length || 0;
  steps.push({
    done:    schoolCount > 0,
    label:   schoolCount > 0 ? `${schoolCount} école${schoolCount > 1 ? "s" : ""} explorée${schoolCount > 1 ? "s" : ""}` : "Explorer les écoles",
    detail:  schoolCount > 0
      ? `${schoolsHistory.slice(0, 3).map(s => s.nom || s.name || s).join(", ")}${schoolCount > 3 ? "…" : ""}`
      : "Consulte les fiches écoles et compare",
    color:   "#6d28d9",
    icon:    Landmark,
    link:    schoolCount === 0 ? "/app/schools" : null,
  });

  // Step 5 — Sessions d'étude
  const sessions = soloStats?.total_sessions || 0;
  const hours    = Math.floor((soloStats?.total_minutes || 0) / 60);
  steps.push({
    done:    sessions > 0,
    label:   sessions > 0
      ? `${sessions} session${sessions > 1 ? "s" : ""} d'étude`
      : "Commencer à étudier",
    detail:  sessions > 0
      ? `${hours > 0 ? `${hours}h ` : ""}${(soloStats?.total_minutes || 0) % 60}min cumulées · Streak : ${soloStats?.streak_days || 0} jour${soloStats?.streak_days > 1 ? "s" : ""}`
      : "Lance ta première session solo ou en groupe",
    color:   "#5b21b6",
    icon:    BookOpen,
    link:    sessions === 0 ? "/app/study" : null,
  });

  // Step 6 — Prêt pour les concours (locked until prev done)
  const ready = hasOrient && schoolCount > 0 && sessions >= 5;
  steps.push({
    done:    ready,
    locked:  !hasOrient || schoolCount === 0,
    label:   ready ? "Prêt pour les concours !" : "Objectif final : les concours",
    detail:  ready
      ? "Tu as exploré tes options et commencé à préparer — bonne chance !"
      : "Complète les étapes précédentes pour débloquer cet objectif",
    color:   "#f59e0b",
    icon:    Trophy,
    link:    ready ? "/app/concours" : null,
  });

  return steps;
}

export default function ProfileTimeline({ profile, orientResult, soloStats, schoolsHistory, isDark }) {
  const steps = buildSteps(profile, orientResult, soloStats, schoolsHistory);
  const doneCount = steps.filter(s => s.done).length;

  const textCol = isDark ? "#f3f4f6" : "#1e1b4b";
  const subCol  = isDark ? "rgba(255,255,255,0.45)" : "rgba(30,27,75,0.5)";
  const lineBg  = isDark ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.12)";

  return (
    <div>
      {/* Progress header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: textCol }}>
            {doneCount}/{steps.length} étapes complétées
          </div>
          <div style={{ fontSize: 11, color: subCol, marginTop: 3 }}>
            Ton parcours vers les grandes écoles marocaines
          </div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: "#7c3aed",
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 99, padding: "5px 14px",
        }}>
          {Math.round((doneCount / steps.length) * 100)}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 99, background: lineBg, marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${(doneCount / steps.length) * 100}%`,
          background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
          transition: "width 0.8s cubic-bezier(0.34,1.1,0.64,1)",
        }} />
      </div>

      {/* Timeline steps */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 19, top: 24, bottom: 8,
          width: 2, background: lineBg, borderRadius: 99,
        }} />

        {steps.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 16, alignItems: "flex-start",
            marginBottom: i < steps.length - 1 ? 22 : 0,
            opacity: step.locked ? 0.45 : 1,
            transition: "opacity 0.2s",
          }}>
            {/* Icon */}
            <div style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
              background: step.done
                ? `linear-gradient(135deg,${step.color},${step.color}bb)`
                : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
              border: step.done
                ? `2px solid ${step.color}40`
                : `2px solid ${lineBg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, zIndex: 1, position: "relative",
              boxShadow: step.done ? `0 4px 14px ${step.color}30` : "none",
              transition: "all 0.3s",
            }}>
              {step.locked
                ? <Lock size={14} color={subCol} />
                : step.done
                  ? step.icon ? <step.icon size={18} color="#fff" /> : <CheckCircle size={18} color="#fff" />
                  : <Circle size={16} color={subCol} />
              }
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3,
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: step.done ? textCol : subCol,
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  {step.label}
                </span>
                {step.done && (
                  <CheckCircle size={14} color="#10b981" />
                )}
              </div>
              <span style={{
                fontSize: 12, color: subCol, lineHeight: 1.5,
                fontFamily: "'DM Sans',sans-serif",
              }}>
                {step.detail}
              </span>
              {step.link && !step.done && (
                <a href={step.link}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    marginTop: 6, fontSize: 11, fontWeight: 700,
                    color: "#7c3aed", textDecoration: "none",
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: 99, padding: "3px 10px",
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                  Continuer →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
