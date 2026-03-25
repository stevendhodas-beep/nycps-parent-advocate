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
  revokeConsequence: string;
  restoreBenefit: string;
};

const GRANTS: Grant[] = [
  {
    id: "consent-a1b2c3d4",
    action: "IEP Record Transfer",
    fields: ["iep_document", "disability_classification", "service_hours"],
    granted_to: "District 8 Special Education Office",
    granted_on: "Mar 12, 2026",
    expires: "Jun 12, 2026",
    active: true,
    category: "nycps",
    revokeConsequence: "The District 8 Special Education Office will lose access to your child's IEP documents, disability classification, and service hours. This may delay or interrupt the delivery of special education services at the new school until records are re-shared.",
    restoreBenefit: "Restoring this permission will allow the District 8 Special Education Office to access your child's IEP documents and service records again, ensuring continuity of special education services without interruption.",
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
    revokeConsequence: "The PS 123 school nurse will no longer have access to your child's Asthma Action Plan or emergency contact information. In a medical emergency at school, staff may not have the information needed to respond appropriately.",
    restoreBenefit: "Restoring this permission ensures the PS 123 school nurse can access your child's Asthma Action Plan and emergency contacts, enabling the school to respond safely in a health emergency.",
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
    revokeConsequence: "The District Truancy Prevention Program will no longer be able to monitor your child's attendance record.",
    restoreBenefit: "Restoring this permission allows the District Truancy Prevention Program to monitor attendance and proactively reach out if absences become a concern.",
  },
  {
    id: "consent-m3n4o5p6",
    action: "Youth Employment Eligibility Verification",
    fields: ["student_id", "grade_level", "enrollment_status", "date_of_birth"],
    granted_to: "Dept. of Youth & Family Services — Summer Youth Employment Program",
    granted_on: "Feb 3, 2026",
    expires: "Sep 30, 2026",
    active: true,
    category: "government",
    revokeConsequence: "DYFS will no longer be able to verify your child's eligibility for the Summer Youth Employment Program. Your child may lose their program placement if eligibility cannot be confirmed before the deadline.",
    restoreBenefit: "Restoring this permission allows DYFS to verify your child's enrollment status and age, keeping their Summer Youth Employment Program placement active.",
  },
  {
    id: "consent-q7r8s9t0",
    action: "Learning Management System Access",
    fields: ["student_name", "grade_level", "course_enrollment", "assignment_data"],
    granted_to: "Instructure — Canvas LMS",
    granted_on: "Sep 5, 2025",
    expires: "Jun 30, 2026",
    active: true,
    category: "vendor",
    revokeConsequence: "Canvas LMS will lose access to your child's course enrollment and assignment data. Your child may lose access to their online coursework, assignments, and teacher feedback on the Canvas platform.",
    restoreBenefit: "Restoring this permission re-enables your child's full access to Canvas LMS, including online assignments, course materials, and teacher communications.",
  },
];

const SECTIONS: { key: Grant["category"]; label: string; description: string }[] = [
  { key: "nycps", label: "Shared with NYC Public Schools", description: "Internal DOE offices, schools, and district programs" },
  { key: "government", label: "Shared with Other Government Agencies", description: "City, state, or federal agencies outside the DOE" },
  { key: "vendor", label: "Shared with External Vendors", description: "Third-party platforms and service providers" },
];

export default function PermissionsPage() {
  const [grants, setGrants] = useState(GRANTS);
  const [confirmingRevoke, setConfirmingRevoke] = useState<string | null>(null);
  const [confirmingRestore, setConfirmingRestore] = useState<string | null>(null);

  const revoke = (id: string) => {
    setGrants(g => g.map(gr => gr.id === id ? { ...gr, active: false } : gr));
    setConfirmingRevoke(null);
  };

  const restore = (id: string) => {
    setGrants(g => g.map(gr => gr.id === id ? { ...gr, active: true } : gr));
    setConfirmingRestore(null);
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
                    <div key={grant.id} className={`bg-white border rounded-2xl overflow-hidden ${grant.active ? "border-gray-200" : "border-gray-200"}`}>
                      {/* Main card */}
                      <div className={`p-5 ${!grant.active ? "opacity-60" : ""}`}>
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
                          {grant.active && confirmingRevoke !== grant.id && (
                            <button
                              onClick={() => { setConfirmingRevoke(grant.id); setConfirmingRestore(null); }}
                              className="text-xs text-red-600 hover:underline font-medium flex-shrink-0"
                            >
                              Revoke
                            </button>
                          )}
                          {!grant.active && confirmingRestore !== grant.id && (
                            <button
                              onClick={() => { setConfirmingRestore(grant.id); setConfirmingRevoke(null); }}
                              className="text-xs text-blue-600 hover:underline font-medium flex-shrink-0"
                            >
                              Restore permission
                            </button>
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

                      {/* Revoke confirmation panel */}
                      {confirmingRevoke === grant.id && (
                        <div className="border-t border-red-100 bg-red-50 px-5 py-4">
                          <p className="text-xs font-semibold text-red-800 mb-1">Before you revoke — here's what will happen:</p>
                          <p className="text-xs text-red-700 leading-relaxed mb-4">{grant.revokeConsequence}</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => revoke(grant.id)}
                              className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Yes, revoke access
                            </button>
                            <button
                              onClick={() => setConfirmingRevoke(null)}
                              className="text-xs font-medium text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Restore confirmation panel */}
                      {confirmingRestore === grant.id && (
                        <div className="border-t border-blue-100 bg-blue-50 px-5 py-4">
                          <p className="text-xs font-semibold text-blue-800 mb-1">What you'll gain by restoring this permission:</p>
                          <p className="text-xs text-blue-700 leading-relaxed mb-4">{grant.restoreBenefit}</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => restore(grant.id)}
                              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Yes, restore permission
                            </button>
                            <button
                              onClick={() => setConfirmingRestore(null)}
                              className="text-xs font-medium text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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
