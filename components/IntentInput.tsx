"use client";

/**
 * IntentInput — Primary parent interaction widget.
 *
 * Accepts free-form text and sends it to the orchestrator.
 * Displays the lane indicator (anonymous vs. authenticated).
 * Triggers the ConsentModal when Lane 2 is required.
 */

import { useState, useRef } from "react";
import { submitIntent } from "../lib/lane-manager";

interface IntentInputProps {
  onResult: (result: Record<string, unknown>) => void;
  onConsentRequired: (actions: string[]) => void;
  onAuthRequired: () => void;
  placeholder?: string;
  workflowActive?: boolean;
}

const EXAMPLE_INTENTS = [
  "My child is moving to District 8 and has asthma",
  "I need to check on my child's IEP services",
  "Help me find tutoring for my 9th grader in math",
  "Help me vote for the CEC",
];

export default function IntentInput({
  onResult,
  onConsentRequired,
  onAuthRequired,
  placeholder = "Tell me what you need for your child...",
  workflowActive = false,
}: IntentInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const CEC_KEYWORDS = ["vote", "cec", "election", "candidate", "council", "ballot"];
  const isCECMessage = (msg: string) => CEC_KEYWORDS.some(kw => msg.toLowerCase().includes(kw));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Short-circuit CEC — launch briefing without API roundtrip
    if (isCECMessage(message)) {
      onResult({ workflows_executed: ["cec_voter_briefing"], intent: message });
      setMessage("");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await submitIntent(message.trim(), "app");

      if (result.status === "authentication_required") {
        onAuthRequired();
        return;
      }

      if (result.status === "consent_required") {
        onConsentRequired(result.consent_actions_needed as string[]);
        return;
      }

      onResult(result);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExample = (example: string) => {
    setMessage(example);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="border border-gray-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white overflow-hidden">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            placeholder={placeholder}
            rows={3}
            disabled={isLoading}
            className="w-full px-4 pt-4 pb-2 text-gray-900 placeholder-gray-400 bg-transparent resize-none outline-none text-base leading-relaxed"
            style={{ minHeight: "80px", maxHeight: "240px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Press Enter to send · Shift+Enter for new line</span>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Working...
                </>
              ) : (
                <>Send</>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Example intents */}
      {!message && !isLoading && !workflowActive && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
            Try asking about:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_INTENTS.map((example) => (
              <button
                key={example}
                onClick={() => handleExample(example)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
