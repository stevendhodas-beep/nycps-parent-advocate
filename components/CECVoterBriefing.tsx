"use client";

/**
 * CEC Voter Briefing — multi-step issue questionnaire + candidate matcher.
 *
 * Flow:
 *   1. Intro
 *   2. Rate 8 issues 1–5 (all on one screen)
 *   3. Ranked candidate recommendations
 *   4. Candidate detail panel (bio, endorsements, positions)
 *
 * Runs entirely in Lane 1 — all data is public, no PII required.
 */

import { useState } from "react";
import { getLane, castCECVote, type VoteReceipt } from "../lib/lane-manager";

// ── Data ─────────────────────────────────────────────────────────────

const ISSUES = [
  { id: "math_curriculum",   label: "Math Curriculum Reform",       description: "Changing how math is taught (e.g., NYC Solves)" },
  { id: "special_ed",        label: "Special Education Services",   description: "IEP compliance, staffing, and disability services" },
  { id: "ell_support",       label: "Multilingual Learner Support", description: "Bilingual programs and support for ELL students" },
  { id: "school_safety",     label: "School Safety",                description: "Safety officers, restorative justice, anti-violence" },
  { id: "arts_funding",      label: "Arts & Enrichment",            description: "Arts, music, theater, and extracurricular programs" },
  { id: "school_funding",    label: "Funding Equity",               description: "How education dollars are distributed across schools" },
  { id: "afterschool",       label: "After-School Programs",        description: "Availability and quality of extended-day programs" },
  { id: "parent_engagement", label: "Parent Voice",                 description: "How much parents shape school decisions" },
];

const IMPORTANCE_LABELS: Record<number, string> = {
  1: "Not important",
  2: "Slightly",
  3: "Moderate",
  4: "Very important",
  5: "Essential",
};

interface Position {
  stance: number;   // 1–5
  description: string;
}

interface Candidate {
  id: string;
  name: string;
  district: string;
  initials: string;
  color: string;
  bio: string;
  endorsements: string[];
  positions: Record<string, Position>;
}

const CANDIDATES: Candidate[] = [
  {
    id: "santos",
    name: "Maria Santos",
    district: "District 8",
    initials: "MS",
    color: "bg-blue-600",
    bio: "Parent of two PS 123 students with 10 years of school leadership experience and a former math teacher. Maria has led the District 8 PTA Council for three years and spearheaded the community review of the NYC Solves rollout.",
    endorsements: ["UFT", "Brooklyn Parents Coalition", "Council Member D. Johnson", "District 8 PTA Council"],
    positions: {
      math_curriculum:   { stance: 5, description: "Strong supporter of NYC Solves; advocates for evidence-based instruction and targeted tutoring for students who fall behind during the transition." },
      special_ed:        { stance: 5, description: "Top champion for IEP compliance. Will push for quarterly compliance audits and increased staffing ratios." },
      ell_support:       { stance: 4, description: "Supports bilingual education expansion and hiring more bilingual paraprofessionals in every school." },
      school_safety:     { stance: 3, description: "Advocates for restorative justice practices over punitive discipline; wants more counselors, fewer suspensions." },
      arts_funding:      { stance: 4, description: "Supports fully restoring arts programming cut during COVID, especially in Title I schools." },
      school_funding:    { stance: 5, description: "Strong advocate for equitable funding reform, ensuring high-need schools receive weighted resources." },
      afterschool:       { stance: 4, description: "Wants after-school programs tied to academic support and enrichment, available to all students free of charge." },
      parent_engagement: { stance: 5, description: "Wants mandatory Parent Coordinator training, monthly office hours with principals, and multilingual communication standards." },
    },
  },
  {
    id: "wright",
    name: "James Wright",
    district: "District 8",
    initials: "JW",
    color: "bg-emerald-600",
    bio: "Small business owner, youth basketball coach, and father of three. James has volunteered with the District 8 Community Education Council as a parent observer for five years and is focused on school safety and workforce readiness pathways.",
    endorsements: ["Brooklyn Chamber of Commerce", "Clergy Council of Brooklyn", "District 8 Youth Alliance"],
    positions: {
      math_curriculum:   { stance: 3, description: "Open to curriculum reform but wants a community input process before full district implementation. Concerned about transition support." },
      special_ed:        { stance: 4, description: "Supports increased special ed funding but prioritizes giving individual schools flexibility in service delivery." },
      ell_support:       { stance: 3, description: "Supports ELL programs and also wants clear English proficiency pathways for students aiming for competitive high schools." },
      school_safety:     { stance: 5, description: "Core platform: dedicated school safety officers, mentorship programs, and partnerships with anti-violence organizations." },
      arts_funding:      { stance: 3, description: "Values arts but believes STEM and career-readiness tracks should be equally funded." },
      school_funding:    { stance: 4, description: "Wants full transparency in school-level budget allocation so parents can hold principals accountable." },
      afterschool:       { stance: 5, description: "Signature issue: every student deserves free, safe after-school programming, especially in high-crime neighborhoods." },
      parent_engagement: { stance: 4, description: "Supports parent voice in curriculum and safety decisions; wants town halls before any major policy change." },
    },
  },
  {
    id: "patel",
    name: "Dr. Aisha Patel",
    district: "District 8",
    initials: "AP",
    color: "bg-purple-600",
    bio: "School psychologist with 15 years in NYC public schools and mother of a child with autism. Dr. Patel has been a leading voice for mental health resources in schools and is a founding member of the Special Education Advocates Network.",
    endorsements: ["NAACP Brooklyn Branch", "Special Education Advocates Network", "Brooklyn Mental Health Alliance", "District 8 Multilingual Families Coalition"],
    positions: {
      math_curriculum:   { stance: 4, description: "Supports NYC Solves with a strong emphasis on additional scaffolding and support for students with IEPs and learning differences." },
      special_ed:        { stance: 5, description: "Full IEP implementation and a mental health professional in every school is her #1 priority. Will audit compliance quarterly." },
      ell_support:       { stance: 5, description: "Strong bilingual education advocate. Wants dual-language programs in every District 8 school within two years." },
      school_safety:     { stance: 4, description: "Mental health-first approach: more counselors, trauma-informed classrooms, and de-escalation training for all staff." },
      arts_funding:      { stance: 5, description: "Arts integration across all subjects as a core curriculum strategy, especially for students with learning differences." },
      school_funding:    { stance: 4, description: "Supports weighted per-pupil funding that accounts for disability status, language background, and poverty level." },
      afterschool:       { stance: 4, description: "Advocates for therapeutic and enrichment after-school options, particularly social-emotional learning programs." },
      parent_engagement: { stance: 5, description: "Wants multilingual outreach, accessible meeting times, and a district-wide parent feedback dashboard." },
    },
  },
];

// ── Scoring ───────────────────────────────────────────────────────────

function scoreCandidate(candidate: Candidate, ratings: Record<string, number>): number {
  let total = 0, maxPossible = 0;
  for (const issue of ISSUES) {
    const weight = ratings[issue.id] ?? 3;
    const stance = candidate.positions[issue.id]?.stance ?? 3;
    total += weight * stance;
    maxPossible += weight * 5;
  }
  return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0;
}

// ── Sub-components ────────────────────────────────────────────────────

function StanceBar({ value }: { value: number }) {
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} className={`h-2 flex-1 rounded-full ${n <= value ? colors[value] : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

function CandidateDetail({ candidate, ratings, votedFor, onVoteCast, onBack }: {
  candidate: Candidate;
  ratings: Record<string, number>;
  votedFor: string | null;
  onVoteCast: (receipt: VoteReceipt) => void;
  onBack: () => void;
}) {
  const score = scoreCandidate(candidate, ratings);
  const sortedIssues = [...ISSUES].sort((a, b) =>
    (ratings[b.id] ?? 3) - (ratings[a.id] ?? 3)
  );
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const lane = getLane();
  const alreadyVotedHere = votedFor === candidate.id;
  const alreadyVotedElsewhere = votedFor !== null && votedFor !== candidate.id;

  const handleVote = async () => {
    setVoteError(null);
    setVoteLoading(true);
    try {
      const receipt = await castCECVote(candidate.id, candidate.name);
      onVoteCast(receipt);
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : "Vote failed. Please try again.");
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to results
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`${candidate.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
          {candidate.initials}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
          <p className="text-sm text-gray-500">{candidate.district} CEC Candidate</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
              {score}% match with your priorities
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1.5">About</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{candidate.bio}</p>
      </div>

      {/* Endorsements */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Endorsements</h3>
        <div className="flex flex-wrap gap-2">
          {candidate.endorsements.map(e => (
            <span key={e} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">{e}</span>
          ))}
        </div>
      </div>

      {/* Positions — sorted by your importance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Positions <span className="text-gray-400 font-normal normal-case">(sorted by your priorities)</span>
        </h3>
        <div className="space-y-4">
          {sortedIssues.map(issue => {
            const pos = candidate.positions[issue.id];
            const myRating = ratings[issue.id] ?? 3;
            return (
              <div key={issue.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{issue.label}</span>
                  <span className="text-xs text-gray-400">Your priority: {IMPORTANCE_LABELS[myRating]}</span>
                </div>
                <StanceBar value={pos.stance} />
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{pos.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cast My Vote ── */}
      <div className="pt-2 border-t border-gray-100">
        {alreadyVotedHere ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-800">Your vote has been transmitted to NYCSA.</p>
          </div>
        ) : lane !== "lane2" ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-medium text-amber-800 mb-1">Sign in to cast your vote</p>
            <p className="text-xs text-amber-700 mb-2">Voting requires your verified NYC Schools Account identity.</p>
            <a href="/lane2" className="text-xs font-medium text-amber-800 underline">Sign in with NYC Schools Account →</a>
          </div>
        ) : alreadyVotedElsewhere ? (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
            You already cast your vote in this election.
          </div>
        ) : (
          <>
            {voteError && (
              <p className="text-xs text-red-600 mb-2">{voteError}</p>
            )}
            <button
              onClick={handleVote}
              disabled={voteLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {voteLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transmitting to NYCSA…
                </>
              ) : (
                <>Cast My Vote for {candidate.name} →</>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-400 text-center">
              Your vote will be securely transmitted to the NYC Schools Account (NYCSA) system.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

type Step = "intro" | "questions" | "results";

interface CECVoterBriefingProps {
  onDismiss: () => void;
}

export default function CECVoterBriefing({ onDismiss }: CECVoterBriefingProps) {
  const [step, setStep] = useState<Step>("intro");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);

  const handleVoteCast = (receipt: VoteReceipt) => {
    setVotedFor(receipt.candidate_id);
    setVoteReceipt(receipt);
  };

  const defaultRating = (id: string) => ratings[id] ?? 3;

  const rankedCandidates = [...CANDIDATES].sort(
    (a, b) => scoreCandidate(b, ratings) - scoreCandidate(a, ratings)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗳️</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">CEC Voter Briefing</h2>
            <p className="text-xs text-gray-500">District 8 Community Education Council Election</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-5">

        {/* ── Intro ──────────────────────────────────────────────── */}
        {step === "intro" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              The <strong>Community Education Council (CEC)</strong> sets curriculum, reviews budgets, and approves school zoning for your district. CEC members are elected by public school parents — your vote directly shapes your child's education.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We'll ask you to rate <strong>8 education issues</strong> by how important they are to you (1–5). Then we'll match you with the candidates whose platforms best reflect your priorities.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              Your responses are anonymous and never stored. This tool uses only publicly available candidate platform information.
            </div>
            <button
              onClick={() => setStep("questions")}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Start — rate the issues →
            </button>
          </div>
        )}

        {/* ── Questions ──────────────────────────────────────────── */}
        {step === "questions" && !selectedCandidate && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Rate how important each issue is to you as a parent.</p>

            {ISSUES.map(issue => (
              <div key={issue.id}>
                <div className="mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">{issue.label}</p>
                  <p className="text-xs text-gray-500">{issue.description}</p>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRatings(r => ({ ...r, [issue.id]: n }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        defaultRating(issue.id) === n
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1 px-0.5">
                  <span className="text-xs text-gray-400">Not important</span>
                  <span className="text-xs text-gray-400">Essential</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep("results")}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              See my candidate matches →
            </button>
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────── */}
        {step === "results" && !selectedCandidate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Candidates ranked by alignment with your priorities:</p>
              <button
                onClick={() => setStep("questions")}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit ratings
              </button>
            </div>

            {rankedCandidates.map((candidate, index) => {
              const score = scoreCandidate(candidate, ratings);
              const topIssues = ISSUES
                .filter(i => ratings[i.id] >= 4)
                .sort((a, b) =>
                  candidate.positions[b.id].stance - candidate.positions[a.id].stance
                )
                .slice(0, 2);

              return (
                <div
                  key={candidate.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank badge */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mt-0.5">
                      {index + 1}
                    </div>

                    <div className={`${candidate.color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {candidate.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{candidate.name}</h3>
                        <span className={`text-sm font-bold flex-shrink-0 ${score >= 70 ? "text-green-600" : score >= 50 ? "text-blue-600" : "text-gray-500"}`}>
                          {score}% match
                        </span>
                      </div>

                      {/* Match bar */}
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${score >= 70 ? "bg-green-500" : score >= 50 ? "bg-blue-500" : "bg-gray-400"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      {/* Top aligned issues */}
                      {topIssues.length > 0 && (
                        <p className="mt-1.5 text-xs text-gray-500">
                          Strong on: {topIssues.map(i => i.label).join(" · ")}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-xs text-blue-600 font-medium">View bio, endorsements & positions →</p>
                        {votedFor === candidate.id ? (
                          <span className="text-xs text-green-700 font-medium">✓ Voted</span>
                        ) : votedFor === null && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(candidate);
                            }}
                            className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                          >
                            Cast my vote →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {voteReceipt && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-green-800">{voteReceipt.message}</p>
                  <p className="text-xs text-green-700 mt-0.5">Ref: {voteReceipt.confirmation_id}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center pt-1">
              Based on publicly available candidate platforms. Candidate data last updated March 2026.
            </p>
          </div>
        )}

        {/* ── Candidate detail ────────────────────────────────────── */}
        {selectedCandidate && (
          <CandidateDetail
            candidate={selectedCandidate}
            ratings={ratings}
            votedFor={votedFor}
            onVoteCast={handleVoteCast}
            onBack={() => setSelectedCandidate(null)}
          />
        )}
      </div>
    </div>
  );
}
