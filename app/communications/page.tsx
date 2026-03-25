"use client";
import Header from "../../components/Header";

const MESSAGES = [
  {
    from: "PS 123 — Nurse Office",
    subject: "Asthma Action Plan on file — please review",
    preview: "We have received your child's updated asthma action plan. Please confirm the emergency contacts are current.",
    time: "Today, 9:14 AM",
    unread: true,
    channel: "email",
  },
  {
    from: "Parent Coordinator — M. Torres",
    subject: "IEP Annual Review scheduled",
    preview: "Your child's annual IEP review is scheduled for April 8 at 3:30 PM. Please confirm your attendance.",
    time: "Yesterday",
    unread: true,
    channel: "portal",
  },
  {
    from: "District 8 CEC",
    subject: "April election — your polling location",
    preview: "CEC elections are April 14–16. Your polling location is PS 123, Room 204. Voting hours: 8 AM – 6 PM.",
    time: "Mar 22",
    unread: true,
    channel: "email",
  },
  {
    from: "NYC Schools Account",
    subject: "New enrollment option available",
    preview: "Middle school choice applications are now open. Your child is eligible to apply to 12 schools in District 8.",
    time: "Mar 19",
    unread: false,
    channel: "portal",
  },
];

export default function CommunicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Communications</h2>
          <p className="text-sm text-gray-500 mt-0.5">Messages from schools, coordinators, and NYC Schools</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {MESSAGES.map((msg) => (
            <div key={msg.subject} className={`px-5 py-4 ${msg.unread ? "bg-blue-50/40" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {msg.unread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    <p className={`text-sm truncate ${msg.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                      {msg.from}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 truncate">{msg.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.preview}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400 whitespace-nowrap">{msg.time}</p>
                  <span className="mt-1 inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {msg.channel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
