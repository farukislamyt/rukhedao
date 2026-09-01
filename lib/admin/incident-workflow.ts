import type { Database } from "@/types/database";

type IncidentStatus = Database["public"]["Enums"]["incident_status"];

/**
 * Application mirror of the frozen database status-transition contract.
 * Keep this list synchronized with public.moderate_incident_status().
 * Never use this helper to bypass the database transition validation.
 */
export const INCIDENT_STATUS_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  pending: ["under_review", "rejected"],
  under_review: ["needs_revision", "approved", "rejected"],
  needs_revision: ["under_review", "rejected"],
  approved: ["archived"],
  rejected: [],
  archived: ["approved"],
};

export function getAllowedIncidentStatusTransitions(
  status: IncidentStatus,
): readonly IncidentStatus[] {
  return INCIDENT_STATUS_TRANSITIONS[status];
}
