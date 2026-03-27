import { useState } from "react";

const FLOWS = {
  setup: {
    title: "Security Questions Setup",
    subtitle: "Called after first-login password change",
    color: "#6366f1",
    steps: [
      { icon: "🔐", label: "User logs in", detail: "First login with temp password → forced password change" },
      { icon: "📝", label: "POST /security-questions/setup", detail: "Body: { questions: [{question, answer} × 3] }\nAuth: Bearer JWT required", code: `// SecurityQuestionsSetup component
// Renders 3 dropdown selectors from preset questions
// Answers are bcrypt-hashed server-side (12 rounds)` },
      { icon: "🗄️", label: "DB: security_questions table", detail: "3 rows inserted per user\nColumns: userId, questionIndex, question, answerHash" },
      { icon: "✅", label: "Setup complete", detail: "{ message: 'Security questions saved.' }" },
    ],
  },
  recovery: {
    title: "Forgot Password Recovery",
    subtitle: "3-step flow with staged JWTs",
    color: "#f59e0b",
    steps: [
      { icon: "📧", label: "Step 1 — POST /auth/forgot-password/init", detail: "Body: { email }\nReturns: questions[] + resetToken (stage: verify_questions, 5min TTL)", code: `// Hides user existence via generic message
// Token stage = 'verify_questions' (5 min)
// Returns the 3 stored question texts` },
      { icon: "🔍", label: "Step 2 — POST /auth/forgot-password/verify", detail: "Body: { resetToken, answers[3] }\nEach answer is bcrypt.compare()'d\nAll 3 must match", code: `// Answers normalized: trim + lowercase before compare
// All 3 must match — no partial success
// Returns verifiedToken (stage: reset_password, 10 min)` },
      { icon: "🔑", label: "Step 3 — POST /auth/forgot-password/reset", detail: "Body: { resetToken (verified), newPassword }\nPassword strength validated\nusers.updatePassword() called", code: `// Token stage checked: must be 'reset_password'
// Password rules: 8+ chars, uppercase, lowercase,
// number, special character` },
      { icon: "✅", label: "Password updated", detail: "{ message: 'Password reset successfully.' }\nUser redirected to login" },
    ],
  },
  integration: {
    title: "Integration Points",
    subtitle: "What you need to wire up",
    color: "#22c55e",
    steps: [
      { icon: "📦", label: "1. Register the module", detail: "Import SecurityQuestionsModule in app.module.ts", code: `// app.module.ts
imports: [
  ...,
  SecurityQuestionsModule,
]` },
      { icon: "🧩", label: "2. Add the entity to TypeORM", detail: "Add SecurityQuestion to your TypeORM entities array", code: `// ormconfig / TypeOrmModule.forRoot
entities: [User, Company, ..., SecurityQuestion]` },
      { icon: "👤", label: "3. UsersService methods needed", detail: "findByEmail(email) and updatePassword(userId, newPassword)", code: `// In users.service.ts — add if missing:
async findByEmail(email: string) { ... }
async updatePassword(id: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 12);
  await this.usersRepo.update(id, { password: hash });
}` },
      { icon: "⚛️", label: "4. Use React components", detail: "ForgotPassword on login page\nSecurityQuestionsSetup after first password change", code: `// On login page:
<ForgotPassword onBackToLogin={() => setView('login')} />

// After first-login password change:
<SecurityQuestionsSetup token={jwt} onComplete={goToDashboard} />` },
    ],
  },
};

export default function SecurityQuestionsVisual() {
  const [active, setActive] = useState("setup");
  const [expanded, setExpanded] = useState(null);
  const flow = FLOWS[active];

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", fontFamily: "'Fira Code', 'Courier New', monospace", padding: "32px 24px", color: "#f1f5f9" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: "#6366f1", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>FullStack-JS-Project-4TWIN-ESPRIT</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>Security Questions Module</h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>NestJS + React · Password Recovery Flow</p>
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {Object.entries(FLOWS).map(([key, f]) => (
            <button
              key={key}
              onClick={() => { setActive(key); setExpanded(null); }}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                background: active === key ? f.color : "#1e293b",
                color: active === key ? "#fff" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {f.title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Flow title */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: flow.color }}>{flow.title}</h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{flow.subtitle}</p>
        </div>

        {/* Steps */}
        <div>
          {flow.steps.map((step, i) => {
            const isLast = i === flow.steps.length - 1;
            const isOpen = expanded === i;
            return (
              <div key={i} style={{ display: "flex", gap: 0 }}>
                {/* Left: connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e293b", border: `2px solid ${flow.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                    {step.icon}
                  </div>
                  {!isLast && <div style={{ width: 2, flex: 1, background: "#1e3a5f", minHeight: 24 }} />}
                </div>

                {/* Right: content */}
                <div style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 20 }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", background: "#1e293b", border: `1px solid ${isOpen ? flow.color : "#334155"}`,
                      borderRadius: 10, padding: "12px 16px", cursor: "pointer", color: "inherit", fontFamily: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{step.label}</span>
                      <span style={{ color: "#475569", fontSize: 11 }}>{isOpen ? "▲ hide" : "▼ expand"}</span>
                    </div>
                    {!isOpen && (
                      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4, whiteSpace: "pre-line" }}>{step.detail.split("\n")[0]}</div>
                    )}
                  </button>

                  {isOpen && (
                    <div style={{ background: "#0f172a", border: `1px solid ${flow.color}33`, borderRadius: "0 0 10px 10px", marginTop: -6, padding: "16px 16px 14px", borderTop: "none" }}>
                      <p style={{ color: "#94a3b8", fontSize: 13, whiteSpace: "pre-line", margin: "0 0 12px", lineHeight: 1.6 }}>{step.detail}</p>
                      {step.code && (
                        <pre style={{ background: "#020617", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#7dd3fc", overflowX: "auto", margin: 0, lineHeight: 1.7 }}>
                          {step.code}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Files footer */}
        <div style={{ marginTop: 36, background: "#1e293b", borderRadius: 12, padding: "16px 20px", border: "1px solid #334155" }}>
          <div style={{ color: "#6366f1", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Files Created</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["🗄️ Entity", "security-questions.entity.ts"],
              ["📋 DTOs", "security-questions.dto.ts"],
              ["⚙️ Service", "security-questions.service.ts"],
              ["🛣️ Controller", "security-questions.controller.ts"],
              ["📦 Module", "security-questions.module.ts"],
              ["⚛️ React", "ForgotPassword.tsx"],
            ].map(([icon, name]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
                <span>{icon}</span><span style={{ color: "#7dd3fc" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
