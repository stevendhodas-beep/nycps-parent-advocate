"use client";

/**
 * NYCPS Parent Advocate — Main Application Page
 *
 * Mobile-first, accessible interface for the parent-facing portal.
 * Implements the full lane → intent → consent → result loop.
 */

import { useState, useEffect } from "react";
import IntentInput from "../components/IntentInput";
import ConsentModal from "../components/ConsentModal";
import CECVoterBriefing from "../components/CECVoterBriefing";
import Header from "../components/Header";
import { useAuth } from "../lib/AuthContext";

const CEC_KEYWORDS = ["vote", "cec", "election", "candidate", "council", "ballot"];

interface OrchestratorResult {
  run_id: string;
  status: string;
  intent: string;
  workflows_executed: string[];
  steps_completed: number;
  steps_failed: number;
  parent_coordinator_notified: boolean;
  summary: string;
  ambiguities: string[];
}

export default function Home() {
  const { workflowResetCount } = useAuth();
  const [result, setResult] = useState<OrchestratorResult | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentActions, setConsentActions] = useState<string[]>([]);
  const [authRequired, setAuthRequired] = useState(false);
  const [showCEC, setShowCEC] = useState(false);

  useEffect(() => {
    setResult(null);
    setShowCEC(false);
    setAuthRequired(false);
  }, [workflowResetCount]);

  const handleResult = (res: Record<string, unknown>) => {
    const isCEC =
      (res.workflows_executed as string[] | undefined)?.includes("cec_voter_briefing") ||
      CEC_KEYWORDS.some(kw => (res.intent as string ?? "").toLowerCase().includes(kw));
    if (isCEC) { setShowCEC(true); return; }
    setResult(res as unknown as OrchestratorResult);
  };

  const handleConsentRequired = (actions: string[]) => {
    setConsentActions(actions);
    setConsentOpen(true);
  };

  const handleAuthRequired = () => {
    setAuthRequired(true);
  };

  const handleConsentApproved = (consentId: string, approvedFields: string[]) => {
    setConsentOpen(false);
    // Re-submit the last intent with consent in place
    // In production: preserve the pending intent and resubmit
    console.log("Consent approved:", consentId, approvedFields);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Hero */}
        <section className="text-center pt-4 pb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            How can I help your child today?
          </h2>
          <p className="mt-2 text-gray-500 text-base max-w-xl mx-auto">
            Describe what you need in your own words. I'll handle the rest — across all the systems your child's school uses.
          </p>
        </section>

        {/* Auth required banner */}
        {authRequired && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Secure Sign-In Required</p>
              <p className="text-sm text-amber-700 mt-1">
                This action involves your child's official records.{" "}
                <a href="/lane2" className="underline font-medium">Sign in with your NYC Schools Account</a> to continue.
              </p>
            </div>
          </div>
        )}

        {/* Intent input */}
        <section>
          <IntentInput
            onResult={handleResult}
            onConsentRequired={handleConsentRequired}
            onAuthRequired={handleAuthRequired}
            workflowActive={!!result || showCEC || authRequired}
          />
        </section>

        {/* CEC Voter Briefing */}
        {showCEC && (
          <section>
            <CECVoterBriefing onDismiss={() => setShowCEC(false)} />
          </section>
        )}

        {/* Result display */}
        {result && !showCEC && (
          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-900">Action Plan Complete</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{result.steps_completed} steps done</span>
                {result.steps_failed > 0 && (
                  <span className="text-red-500">{result.steps_failed} failed</span>
                )}
                {result.parent_coordinator_notified && (
                  <span className="text-amber-600">Parent Coordinator notified</span>
                )}
              </div>
            </div>

            <div className="px-6 py-5">
              {/* Summary */}
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {result.summary}
              </div>

              {/* Workflows executed */}
              {result.workflows_executed?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.workflows_executed.map((w) => (
                    <span
                      key={w}
                      className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}

              {/* Ambiguities / clarifications */}
              {result.ambiguities?.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-xs font-medium text-yellow-800 mb-1">A few things to note:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {result.ambiguities.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Channels */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {[
            {
              icon: "💬",
              title: "SMS / WhatsApp",
              description: "Text us at (718) 555-NYCS — works on any phone, no app needed.",
              action: "Text us",
            },
            {
              icon: "📞",
              title: "Call Us",
              description: "Speak with our voice assistant 24/7 in 9 languages.",
              action: "Call (718) 555-NYCS",
            },
            {
              icon: "👩‍💼",
              title: "Parent Coordinator",
              description: "For complex situations, speak directly with your school's PC.",
              action: "Find my PC",
            },
          ].map((channel) => (
            <div
              key={channel.title}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col"
            >
              <span className="text-2xl mb-3">{channel.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900">{channel.title}</h3>
              <p className="text-xs text-gray-500 mt-1 flex-1">{channel.description}</p>
              <button className="mt-4 text-xs font-medium text-blue-600 hover:underline text-left">
                {channel.action} →
              </button>
            </div>
          ))}
        </section>

        {/* Privacy note */}
        <section className="text-center pb-8">
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            By default, your child's name and ID are never shared with AI models.
            You control exactly what data is used, field by field.{" "}
            <a href="/privacy" className="underline hover:text-gray-600">
              Learn how we protect your privacy.
            </a>
          </p>
        </section>
      </main>

      {/* Consent modal */}
      <ConsentModal
        isOpen={consentOpen}
        action="record_transfer"
        consentActions={consentActions}
        vendorId="nycps-internal"
        onApproved={handleConsentApproved}
        onDismissed={() => setConsentOpen(false)}
      />
    </div>
  );
}
