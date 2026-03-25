"use client";
import { useState } from "react";
import Header from "../../components/Header";

type Grant = {
  id: string;
  action: string;
  fields: string[];
  granted_to: string;
  granted_on: string;
  expires: string;
  active: boolean;
  category: "nycps" | "government" | "vendor";
};

const GRANTS: Grant[] = [
  // NYCPS Internal
  {
    id: "consent-a1b2c3d4",
    action: "IEP Record Transfer",
    fields: ["iep_document", "disability_classification", "service_hours"],
    granted_to: "District 8 Special Education Office",
    granted_on: "Mar 12, 2026",
    expires: "Jun 12, 2026",
    active: true,
    category: "nycps",
  },
  {
    id: "consent-e5f6g7h8",
    action: "Medical Record Sharing",
    fields: ["medical_action_plan", "emergency_contacts"],
    granted_to: "PS 123 Nurse Office",
    granted_on: "Sep 1, 2025",
    expires: "Aug 31, 2026",
    active: true,
    category: "nycps",
  },
  {
    id: "consent-i9j0k1l2",
    action: "Attendance Data Review",
    fields: ["attendance_record"],
    granted_to: "District Truancy Prevention Program",
    granted_on: "Jan 5, 2026",
    expires: "Jan 5, 2026",
    active: false,
    category: "nycps",
  },
  // Other Government Agencies
  {
    id: "consent-m3n4o5p6",
    action: "Youth Employment Eligibility Verification",
    fields: ["student_id", "grade_level", "enrollment_status", "date_of_birth"],
    granted_to: "Dept. of Youth & Family Services — Summer Youth Employment Program",
    granted_on: "Feb 3, 2026",
    expires: "Sep 30, 2026",
    active: true,
    category: "government",
  },
  // External Vendors
  {
    id: "consent-q7r8s9t0",
    action: "Learning Management System Access",
    fields: ["student_name", "grade_level", "course_enrollment", "assignment_data"],
    granted_to: "Instructure — Canvas LMS",
    granted_on: "Sep 5, 2025",
    expires: "Jun 30, 2026",
    active: true,
    category: "vendor",
  },
];

const SECTIONS: { key: Grant["category"]; label: string; description: string }[] = [
  {
    key: "nycps",
    label: "Shared with NYC Public Schools",
    description: "Internal DOE offices, schools, and district programs",
  },
  {
    key: "government",
    label: "Shared with Other Government Agencies",
    description: "City, state, or federal agencies outside the DOE",
  },
  {
    key: "vendor",
    label: "Shared with External Vendors",
    description: "Third-party platforms and service providers",
  },
];

export default function PermissionsPage() {
  const [grants, setGrants] = useState(GRANTS);

  const revoke = (id: string) => {
    setGrants(g => g.map(gr => gr.id === id ? { ...gr, active: false } : gr));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Permissions Given</h2>
          <p className="text-sm text-gray-500 mt-0.5">Data access you have approved — revoke any time</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ key, label, description }) => {
            const sectionGrants = grants.filter(g => g.category === key);
            if (sectionGrants.length === 0) return null;
            return (
              <div key={key}>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
                <div className="space-y-3">
                  {sectionGrants.map((grant) => (
                    <div key={grant.id} className={`bg-white border rounded-2xl p-5 ${grant.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${grant.active ? "bg-green-500" : "bg-gray-300"}`} />
                            <p className="text-sm font-semibold text-gray-900">{grant.action}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{grant.granted_to}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Granted {grant.granted_on} · Expires {grant.expires}
                          </p>
                        </div>
                        {grant.active ? (
                          <button
                            onClick={() => revoke(grant.id)}
                            className="text-xs text-red-600 hover:underline font-medium flex-shrink-0"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 flex-shrink-0">Expired / Revoked</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {grant.fields.map(f => (
                          <span key={f} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Revoking a permission does not delete records already shared — contact the recipient to request deletion.
        </p>
      </main>
    </div>
  );
}
