"use client";
import Header from "../../components/Header";

const EVENTS = [
  {
    date: "Apr 8",
    day: "Wed",
    title: "IEP Annual Review",
    detail: "MS 456 · Room 214 · 3:30 PM",
    type: "IEP",
    urgent: true,
  },
  {
    date: "Apr 14–16",
    day: "Mon–Wed",
    title: "CEC District 8 Election",
    detail: "PS 123 · Room 204 · 8 AM – 6 PM",
    type: "Election",
    urgent: false,
  },
  {
    date: "Apr 25",
    day: "Sat",
    title: "Middle School Choice Deadline",
    detail: "NYC Schools Account portal — online submission",
    type: "Enrollment",
    urgent: true,
  },
  {
    date: "May 1",
    day: "Fri",
    title: "Spring Parent-Teacher Conferences",
    detail: "MS 456 · 12 PM – 8 PM · Sign up via portal",
    type: "School",
    urgent: false,
  },
];

const TYPE_COLORS: Record<string, string> = {
  IEP: "bg-purple-100 text-purple-700",
  Election: "bg-blue-100 text-blue-700",
  Enrollment: "bg-amber-100 text-amber-700",
  School: "bg-green-100 text-green-700",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
          <p className="text-sm text-gray-500 mt-0.5">Upcoming deadlines and school events</p>
        </div>

        <div className="space-y-3">
          {EVENTS.map((event) => (
            <div key={event.title} className={`bg-white border rounded-2xl p-4 flex gap-4 ${event.urgent ? "border-amber-200" : "border-gray-200"}`}>
              <div className="flex-shrink-0 w-14 text-center">
                <p className="text-xs text-gray-400 font-medium">{event.day}</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{event.date}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                  {event.urgent && (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                      Action needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[event.type] ?? "bg-gray-100 text-gray-600"}`}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
