import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

function detectIntent(message: string): "iep" | "tutoring" | "transfer" | "medical" | "enrollment" | "attendance" | "general" {
  const m = message.toLowerCase();
  if (/\biep\b|individualized education|special ed|disability|accommodation|service hour|eval(uation)?/.test(m)) return "iep";
  if (/tutor|tutoring|after.?school|homework help|math help|reading help|extra help/.test(m)) return "tutoring";
  if (/transfer|moving|new school|new address|district|enroll.*new|new.*enroll/.test(m)) return "transfer";
  if (/asthma|allerg|medical|nurse|health|epipen|inhaler|medication|condition/.test(m)) return "medical";
  if (/enroll|register|registration|kindergarten|pre.?k|school year/.test(m)) return "enrollment";
  if (/absent|absence|attendance|tardy|late|miss(ed)? school/.test(m)) return "attendance";
  return "general";
}

const RESPONSES: Record<ReturnType<typeof detectIntent>, (message: string) => object> = {
  iep: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["iep_review", "special_education_services"],
    steps_completed: 4,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Here's the status of your child's IEP services:\n\n" +
      "• Current IEP is active through June 2026. Annual review is due April 14, 2026 — you'll receive a notice 30 days in advance.\n" +
      "• Services on file: Speech-Language (3×/week, 30 min), Resource Room support (daily, 45 min).\n" +
      "• Your child's Special Education teacher is Ms. Rivera at PS 123. You can request a meeting via the Communications section.\n" +
      "• If you believe services need to be updated, you have the right to request a CSE meeting at any time — I can send that request on your behalf.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: ["If you meant to request a change to current services, reply with what you'd like updated."],
  }),

  tutoring: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["tutoring_resources", "after_school_programs"],
    steps_completed: 5,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Here are tutoring options available for your child:\n\n" +
      "• School-based: PS 123 offers free after-school Math support (Tue & Thu, 3–4:30 PM). Enrollment is open — I can register your child.\n" +
      "• District program: District 8 Academic Recovery runs Mon–Wed at the community center on E. Tremont Ave. Free for all students.\n" +
      "• NYC Free Resources: NYC DOE's free online tutoring through Varsity Tutors is available 24/7. I've sent the login link to your account.\n" +
      "• CUNY's College Now program offers free math support for high school students — your 9th grader qualifies.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: [],
  }),

  transfer: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["transfer_and_transition"],
    steps_completed: 5,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Here's what we've set in motion for your child's transfer:\n\n" +
      "• Your new address qualifies for District 8. Nearby schools: PS 123 (0.3 mi), PS 456 (0.6 mi).\n" +
      "• Residency update submitted (ref: SIS-A1B2C3D4). District will confirm enrollment within 5 business days.\n" +
      "• Special Education records are being transferred (ref: IEP-E5F6G7H8). Expected in 3–5 business days.\n" +
      "• Medical conditions flagged for the new school nurse. They will contact you within 2 business days.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: [],
  }),

  medical: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["medical_records", "school_health"],
    steps_completed: 3,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Your child's medical information has been reviewed:\n\n" +
      "• Health plan on file at PS 123 Nurse Office: Asthma Action Plan (updated Sep 2025). Inhaler is logged in the nurse's office.\n" +
      "• Emergency contacts on file: 2 contacts verified.\n" +
      "• If you need to update the health plan or add a new condition, you can upload a doctor's note in the Storage Locker and I'll route it to the nurse.\n" +
      "• Annual physical form is due by Oct 1, 2026 — I can send you a reminder.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: [],
  }),

  enrollment: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["enrollment", "school_finder"],
    steps_completed: 4,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Here's what you need to know about enrollment:\n\n" +
      "• Pre-K enrollment for 2026–27 opens March 1 and closes April 30. I can submit your application now if you're ready.\n" +
      "• Kindergarten: your child can attend your zoned school (PS 123) or apply to any school with open seats through the MySchools portal.\n" +
      "• Required documents: proof of address, birth certificate, immunization records. All can be uploaded to your Storage Locker.\n" +
      "• Shall I start your enrollment application or help you gather the required documents?\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: [],
  }),

  attendance: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["attendance_review"],
    steps_completed: 3,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "Here's a summary of your child's attendance:\n\n" +
      "• Current school year: 142 days present, 6 absences (3 excused, 3 unexcused), 2 late arrivals.\n" +
      "• Attendance rate: 96% — on track. NYC requires 90% minimum.\n" +
      "• Upcoming: 3 or more consecutive absences require a doctor's note. I can submit one from your Storage Locker if needed.\n" +
      "• To report today's absence, reply with the reason and I'll notify the school automatically.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: [],
  }),

  general: (message) => ({
    run_id: randomUUID(),
    status: "completed",
    intent: message,
    workflows_executed: ["general_inquiry"],
    steps_completed: 2,
    steps_failed: 0,
    parent_coordinator_notified: true,
    summary:
      "I've looked into your request and here's what I found:\n\n" +
      "• Your child is currently enrolled at PS 123, Grade 4, Room 204 (Teacher: Mr. Thompson).\n" +
      "• No outstanding action items or alerts on your account.\n" +
      "• For more specific help, you can ask about IEP services, tutoring, enrollment, attendance, or medical records.\n" +
      "• Your Parent Coordinator, Sheila Nevins, has been notified.",
    ambiguities: ["Your question may need more detail — feel free to rephrase and I'll try again."],
  }),
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.message || !body?.token) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  const intent = detectIntent(body.message);
  const response = RESPONSES[intent](body.message);

  return NextResponse.json({
    ...response,
    channel: body.channel ?? "app",
    mode: "preview",
  });
}
