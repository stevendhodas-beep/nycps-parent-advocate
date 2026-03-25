"use client";

/**
 * ConsentModal — field-level consent UI for Lane 2 actions.
 *
 * Shows the parent exactly which data fields will be accessed,
 * lets them toggle individual fields on/off, and submits their
 * choices to the ConsentBroker.
 *
 * UX principles:
 *  - Plain language descriptions (no legal jargon)
 *  - Default: all optional fields OFF
 *  - Required fields (for the action to work) labeled clearly
 *  - One-click revoke after the fact
 */

import { useState } from "react";
import { initiateConsent, approveConsent } from "../lib/lane-manager";

interface FieldDefinition {
  id: string;
  label: string;
  description: string;
  required: boolean;
  sensitive: boolean;
}

interface ConsentModalProps {
  isOpen: boolean;
  action: string;
  consentActions: string[];
  vendorId: string;
  onApproved: (consentId: string, approvedFields: string[]) => void;
  onDismissed: () => void;
}

// Human-readable field definitions
const FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  home_address: {
    id: "home_address",
    label: "Home Address",
    description: "Your current address, used to verify your new school district.",
    required: true,
    sensitive: false,
  },
  iep_details: {
    id: "iep_details",
    label: "Special Education (IEP) Details",
    description: "Your child's IEP document and services, transferred to the new school.",
    required: false,
    sensitive: true,
  },
  medical_flags: {
    id: "medical_flags",
    label: "Medical Conditions",
    description: "Health conditions (e.g., asthma) shared only with the school nurse.",
    required: false,
    sensitive: true,
  },
  attendance_record: {
    id: "attendance_record",
    label: "Attendance Record",
    description: "Days present and absent this school year.",
    required: false,
    sensitive: false,
  },
  discipline_record: {
    id: "discipline_record",
    label: "Discipline Record",
    description: "Any disciplinary incidents on file.",
    required: false,
    sensitive: true,
  },
  evaluation_reports: {
    id: "evaluation_reports",
    label: "Evaluation Reports",
    description: "Psychological and educational evaluations from current school.",
    required: false,
    sensitive: true,
  },
};

// Action → relevant fields mapping
const ACTION_FIELDS: Record<string, string[]> = {
  residency_update: ["home_address"],
  record_transfer: ["iep_details", "evaluation_reports", "medical_flags", "attendance_record", "discipline_record"],
  iep_monitoring: ["iep_details", "evaluation_reports"],
  benefits_enrollment: ["home_address", "attendance_record"],
  fafsa_submission: ["home_address"],
};

export default function ConsentModal({
  isOpen,
  action,
  consentActions,
  vendorId,
  onApproved,
  onDismissed,
}: ConsentModalProps) {
  const allFields = Array.from(
    new Set(consentActions.flatMap((a) => ACTION_FIELDS[a] ?? []))
  );

  const requiredFields = allFields.filter((f) => FIELD_DEFINITIONS[f]?.required);
  const optionalFields = allFields.filter((f) => !FIELD_DEFINITIONS[f]?.required);

  const [approvedOptional, setApprovedOptional] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleField = (fieldId: string) => {
    setApprovedOptional((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const approvedFields = [...requiredFields, ...Array.from(approvedOptional)];
      const { consentId } = await initiateConsent(action, allFields, vendorId);
      const grant = await approveConsent(consentId, approvedFields);
      onApproved(grant.consentId, grant.approvedFields);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your consent choices.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabels: Record<string, string> = {
    residency_update: "Update Your Address",
    record_transfer: "Transfer School Records",
    iep_monitoring: "Monitor IEP Services",
    benefits_enrollment: "Check Benefits Eligibility",
    fafsa_submission: "Help with FAFSA",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Permission Request
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                To complete:{" "}
                <span className="font-medium text-gray-700">
                  {consentActions.map((a) => actionLabels[a] ?? a).join(" + ")}
                </span>
              </p>
            </div>
            <button
              onClick={onDismissed}
              className="text-gray-400 hover:text-gray-600 ml-4"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-3">
          <p className="text-sm text-gray-600">
            Choose exactly which information to share. You can change this anytime.
          </p>

          {/* Required fields */}
          {requiredFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Required for this action
              </p>
              {requiredFields.map((fieldId) => {
                const def = FIELD_DEFINITIONS[fieldId];
                if (!def) return null;
                return (
                  <div
                    key={fieldId}
                    className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100"
                  >
                    <div className="mt-0.5 w-4 h-4 rounded bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{def.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional fields */}
          {optionalFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">
                Optional — you choose
              </p>
              {optionalFields.map((fieldId) => {
                const def = FIELD_DEFINITIONS[fieldId];
                if (!def) return null;
                const checked = approvedOptional.has(fieldId);
                return (
                  <button
                    key={fieldId}
                    onClick={() => toggleField(fieldId)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors mb-2 ${
                      checked
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {def.label}
                        {def.sensitive && (
                          <span className="ml-2 text-xs text-amber-600 font-normal">Sensitive</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{def.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDismissed}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Confirm & Continue"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4 px-6">
          Your choices are logged and you can revoke access anytime in Settings.
          AgenticED and vendors never store your student's ID.
        </p>
      </div>
    </div>
  );
}
