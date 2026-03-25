"use client";
import { useState } from "react";
import Header from "../../components/Header";

type Item = {
  id: string;
  title: string;
  detail: string;
  ref?: string;
  submitted?: string;
  due?: string;
  party: "district" | "parent";
  done: boolean;
};

const INITIAL_ITEMS: Item[] = [
  // Awaiting district
  {
    id: "d1",
    title: "Residency update confirmation",
    detail: "District 8 office is reviewing your new address. Enrollment at PS 123 will be confirmed once approved.",
    ref: "SIS-A1B2C3D4",
    submitted: "Mar 14, 2026",
    party: "district",
    done: false,
  },
  {
    id: "d2",
    title: "IEP record transfer to new school",
    detail: "Special Education records are being transferred from previous school. New school will acknowledge receipt.",
    ref: "IEP-E5F6G7H8",
    submitted: "Mar 14, 2026",
    party: "district",
    done: false,
  },
  {
    id: "d3",
    title: "Medical plan acknowledgment from PS 123 nurse",
    detail: "Asthma Action Plan sent to the nurse office. Awaiting confirmation that it has been logged.",
    submitted: "Mar 14, 2026",
    party: "district",
    done: false,
  },
  // Awaiting parent
  {
    id: "p1",
    title: "Sign IEP amendment consent form",
    detail: "The CSE has proposed an updated service schedule. Your signature is required before changes take effect.",
    due: "Apr 5, 2026",
    party: "parent",
    done: false,
  },
  {
    id: "p2",
    title: "Confirm after-school tutoring enrollment",
    detail: "PS 123 Math Support (Tue & Thu, 3–4:30 PM) is reserved for your child. Confirm to hold the spot.",
    due: "Mar 28, 2026",
    party: "parent",
    done: false,
  },
];

export default function AwaitingPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const markDone = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: true } : i));

  const district = items.filter(i => i.party === "district");
  const parent = items.filter(i => i.party === "parent");
  const parentPending = parent.filter(i => !i.done).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Awaiting Confirmation</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Open items between you and the district
            {parentPending > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {parentPending} action{parentPending > 1 ? "s" : ""} needed from you
              </span>
            )}
          </p>
        </div>

        <div className="space-y-8">
          {/* Awaiting parent action */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Needs Your Action</h3>
              <p className="text-xs text-gray-400 mt-0.5">Items waiting on you to respond or sign</p>
            </div>
            <div className="space-y-3">
              {parent.map(item => (
                <div key={item.id} className={`bg-white border rounded-2xl p-5 transition-opacity ${item.done ? "opacity-50 border-gray-100" : "border-amber-200"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${item.done ? "bg-gray-300" : "bg-amber-400"}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                        {item.due && !item.done && (
                          <p className="text-xs text-amber-600 font-medium mt-1.5">Due {item.due}</p>
                        )}
                      </div>
                    </div>
                    {!item.done ? (
                      <button
                        onClick={() => markDone(item.id)}
                        className="flex-shrink-0 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="flex-shrink-0 text-xs text-green-600 font-medium">Done ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awaiting district action */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Awaiting District Response</h3>
              <p className="text-xs text-gray-400 mt-0.5">Items submitted — waiting on the school or district to act</p>
            </div>
            <div className="space-y-3">
              {district.map(item => (
                <div key={item.id} className={`bg-white border rounded-2xl p-5 ${item.done ? "opacity-50 border-gray-100" : "border-gray-200"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${item.done ? "bg-green-500" : "bg-blue-400 animate-pulse"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {item.ref && (
                          <span className="text-xs text-gray-400">Ref: {item.ref}</span>
                        )}
                        {item.submitted && (
                          <span className="text-xs text-gray-400">Submitted {item.submitted}</span>
                        )}
                      </div>
                    </div>
                    {item.done && (
                      <span className="flex-shrink-0 text-xs text-green-600 font-medium">Confirmed ✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          You'll be notified by SMS/email when the district responds to any open item.
        </p>
      </main>
    </div>
  );
}
