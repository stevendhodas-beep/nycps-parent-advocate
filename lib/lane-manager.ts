/**
 * LaneManager — client-side lane state and token management.
 *
 * Enforces the Two-Lane model in the browser:
 *   Lane 1: short-lived session token, no PII in requests
 *   Lane 2: identity token issued after MFA, field-level consent required
 *
 * Tokens are stored in memory only (never localStorage/sessionStorage)
 * to prevent exfiltration via XSS.
 */

export type LaneId = "lane1" | "lane2";

export interface SessionToken {
  value: string;
  lane: LaneId;
  expiresAt: Date;
  consentId?: string;
}

export interface ConsentGrant {
  consentId: string;
  approvedFields: string[];
  deniedFields: string[];
  expiresAt: string;
  action: string;
}

// In-memory store (cleared on page unload)
let _activeToken: SessionToken | null = null;
let _activeConsent: ConsentGrant | null = null;

// ── Persisted consent grants (survive sign-out/sign-in) ─────────────────
const CONSENTS_KEY = "nycps_consent_grants";

function loadPersistedGrants(): ConsentGrant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONSENTS_KEY);
    return raw ? (JSON.parse(raw) as ConsentGrant[]) : [];
  } catch { return []; }
}

function savePersistedGrants(grants: ConsentGrant[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CONSENTS_KEY, JSON.stringify(grants)); } catch {}
}

export function hasSharedRecords(): boolean {
  return loadPersistedGrants().some(g => g.approvedFields.length > 0);
}

export function revokePersistedGrant(consentId: string): void {
  savePersistedGrants(loadPersistedGrants().filter(g => g.consentId !== consentId));
}

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL ?? "/api";

// ── Token management ────────────────────────────────────────────────────

export function getActiveToken(): SessionToken | null {
  if (_activeToken && new Date() > _activeToken.expiresAt) {
    _activeToken = null; // Expired
  }
  return _activeToken;
}

export function getLane(): LaneId {
  return _activeToken?.lane ?? "lane1";
}

/**
 * Try to silently authenticate via a connected NYCSA account (SSO).
 * If no connected account is found, falls back to an anonymous Lane 1 session.
 * Called once on app mount — no user interaction required.
 */
export async function initAutoSession(): Promise<SessionToken> {
  try {
    const res = await fetch(`${MCP_BASE_URL}/session/auto`, {
      method: "POST",
      credentials: "omit",
    });
    if (res.ok) {
      const { token, expires_in, lane } = await res.json();
      if (lane === "lane2") {
        _activeToken = {
          value: token,
          lane: "lane2",
          expiresAt: new Date(Date.now() + expires_in * 1000),
        };
        // Seed demo consent grants so "Records Shared" reflects permissions page data
        if (loadPersistedGrants().length === 0) {
          savePersistedGrants([
            { consentId: "consent-a1b2c3d4", approvedFields: ["iep_document", "disability_classification", "service_hours"], deniedFields: [], expiresAt: "2026-06-12T00:00:00Z", action: "IEP Record Transfer" },
            { consentId: "consent-e5f6g7h8", approvedFields: ["medical_action_plan", "emergency_contacts"], deniedFields: [], expiresAt: "2026-08-31T00:00:00Z", action: "Medical Record Sharing" },
          ]);
        }
        return _activeToken;
      }
    }
  } catch {
    // SSO unavailable — fall through to anonymous session
  }
  return initLane1Session();
}

export async function initLane1Session(): Promise<SessionToken> {
  const res = await fetch(`${MCP_BASE_URL}/session/anonymous`, {
    method: "POST",
    credentials: "omit", // No cookies in Lane 1
  });
  if (!res.ok) throw new Error("Failed to initialize Lane 1 session");
  const { token, expires_in } = await res.json();
  _activeToken = {
    value: token,
    lane: "lane1",
    expiresAt: new Date(Date.now() + expires_in * 1000),
  };
  return _activeToken;
}

export async function upgradToLane2(idToken: string): Promise<SessionToken> {
  // idToken comes from NYC Schools Account OAuth callback
  const res = await fetch(`${MCP_BASE_URL}/session/identity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Lane 2 upgrade failed — MFA may be required");
  const { token, expires_in } = await res.json();
  _activeToken = {
    value: token,
    lane: "lane2",
    expiresAt: new Date(Date.now() + expires_in * 1000),
  };
  return _activeToken;
}

export function clearSession(): void {
  _activeToken = null;
  _activeConsent = null;
  // NOTE: persisted consent grants are NOT cleared here —
  // "Records Shared" state survives sign-out until explicitly revoked.
}

// ── Consent management ──────────────────────────────────────────────────

export async function initiateConsent(
  action: string,
  fieldsRequested: string[],
  vendorId: string
): Promise<{ consentId: string; fieldsRequiringExplicit: string[] }> {
  const token = getActiveToken();
  if (!token || token.lane !== "lane2") {
    throw new Error("Consent requires Lane 2 authentication");
  }

  const res = await fetch(`${MCP_BASE_URL}/consent/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({
      identity_token: token.value,
      action,
      fields_requested: fieldsRequested,
      vendor_id: vendorId,
    }),
  });

  if (!res.ok) throw new Error("Failed to initiate consent");
  const data = await res.json();
  return {
    consentId: data.consent_id,
    fieldsRequiringExplicit: data.fields_requiring_explicit_consent ?? [],
  };
}

export async function approveConsent(
  consentId: string,
  approvedFields: string[]
): Promise<ConsentGrant> {
  const token = getActiveToken();
  if (!token || token.lane !== "lane2") throw new Error("Lane 2 required");

  const res = await fetch(`${MCP_BASE_URL}/consent/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({
      consent_id: consentId,
      identity_token: token.value,
      approved_fields: approvedFields,
    }),
  });

  if (!res.ok) throw new Error("Consent approval failed");
  const data = await res.json();

  _activeConsent = {
    consentId: data.consent_id,
    approvedFields: data.approved_fields,
    deniedFields: data.denied_fields,
    expiresAt: data.expires_at,
    action: data.action ?? "",
  };

  if (_activeToken) {
    _activeToken.consentId = _activeConsent.consentId;
  }

  // Persist so "Records Shared" survives sign-out/sign-in
  const existing = loadPersistedGrants().filter(g => g.consentId !== _activeConsent!.consentId);
  savePersistedGrants([...existing, _activeConsent]);

  return _activeConsent;
}

export async function revokeConsent(consentId: string): Promise<void> {
  const token = getActiveToken();
  if (!token) return;
  await fetch(`${MCP_BASE_URL}/consent/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({ consent_id: consentId, identity_token: token.value }),
  });
  _activeConsent = null;
}

export function getActiveConsent(): ConsentGrant | null {
  return _activeConsent;
}

// ── MCP tool calls ──────────────────────────────────────────────────────

export async function callMCPTool(
  tool: string,
  parameters: Record<string, unknown>
): Promise<unknown> {
  const token = getActiveToken();
  if (!token) throw new Error("No active session — call initLane1Session() first");

  const res = await fetch(`${MCP_BASE_URL}/mcp/tool`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({
      tool,
      parameters,
      token: token.value,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Tool call failed: ${res.status}`);
  }

  return res.json();
}

// ── CEC Vote transmission ────────────────────────────────────────────────

const ORCHESTRATOR_BASE_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "/api";

export interface VoteReceipt {
  confirmation_id: string;
  status: string;
  nycsa_transmitted: boolean;
  candidate_id: string;
  candidate_name: string;
  message: string;
}

export async function castCECVote(
  candidateId: string,
  candidateName: string
): Promise<VoteReceipt> {
  const token = getActiveToken();
  if (!token || token.lane !== "lane2") {
    throw new Error("lane2_required");
  }

  const res = await fetch(`${ORCHESTRATOR_BASE_URL}/vote/cast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      candidate_name: candidateName,
      token: token.value,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Vote transmission failed");
  }
  return res.json();
}

// ── Intent submission ────────────────────────────────────────────────────

export async function submitIntent(
  message: string,
  channel: "app" | "voice" | "sms" = "app"
): Promise<Record<string, unknown>> {
  const token = getActiveToken();
  if (!token) throw new Error("No active session");

  const res = await fetch(`/api/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      token: token.value,
      lane: token.lane,
      consent_id: token.consentId ?? null,
      channel,
    }),
  });

  if (!res.ok) throw new Error("Intent submission failed");
  return res.json();
}
