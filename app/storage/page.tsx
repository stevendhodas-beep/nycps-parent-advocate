"use client";
import Header from "../../components/Header";

const DOCUMENTS = [
  { name: "IEP — 2025–2026", type: "IEP", date: "Sep 12, 2025", size: "1.2 MB", locked: true },
  { name: "Medical Action Plan (Asthma)", type: "Medical", date: "Aug 3, 2025", size: "340 KB", locked: true },
  { name: "Enrollment Form — PS 123", type: "Enrollment", date: "Jul 28, 2025", size: "180 KB", locked: false },
  { name: "Immunization Records", type: "Medical", date: "Jun 15, 2025", size: "95 KB", locked: true },
];

const TYPE_COLORS: Record<string, string> = {
  IEP: "bg-purple-50 text-purple-700 border-purple-200",
  Medical: "bg-red-50 text-red-700 border-red-200",
  Enrollment: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function StoragePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Storage Locker</h2>
            <p className="text-sm text-gray-500 mt-0.5">Encrypted documents — only you control access</p>
          </div>
          <button className="text-sm px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            + Upload
          </button>
        </div>

        <div className="space-y-3">
          {DOCUMENTS.map((doc) => (
            <div key={doc.name} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[doc.type] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {doc.type}
                  </span>
                  <span className="text-xs text-gray-400">{doc.date} · {doc.size}</span>
                </div>
              </div>
              {doc.locked && (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Documents are encrypted at rest. You control which workflows can access each file.
        </p>
      </main>
    </div>
  );
}
