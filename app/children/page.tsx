"use client";
import Header from "../../components/Header";

const CHILDREN = [
  {
    name: "Jordan Rivera",
    grade: "Grade 8",
    school: "MS 456, District 8",
    flags: ["IEP", "Asthma"],
    initials: "JR",
    color: "bg-blue-500",
  },
];

export default function ChildrenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Children</h2>
            <p className="text-sm text-gray-500 mt-0.5">Linked student profiles</p>
          </div>
          <button className="text-sm px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            + Add Child
          </button>
        </div>

        <div className="space-y-4">
          {CHILDREN.map((child) => (
            <div key={child.name} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className={`${child.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                {child.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{child.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{child.grade} · {child.school}</p>
                <div className="flex gap-1.5 mt-2">
                  {child.flags.map(f => (
                    <span key={f} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
