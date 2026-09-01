"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Database } from "@/types/database";
import { getAllowedIncidentStatusTransitions } from "@/lib/admin/incident-workflow";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type IncidentStatus = Database["public"]["Enums"]["incident_status"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];
type Category = { id: string; name: string };
type Division = { id: number; name: string };
type District = { id: number; division_id: number; name: string };

type Props = {
  incident: Incident;
  categories: Category[];
  divisions: Division[];
  districts: District[];
};

type Message = { type: "success" | "error"; text: string } | null;

const STATUS_LABEL_KEYS: Record<IncidentStatus, string> = {
  pending: "statusPending",
  under_review: "statusUnderReview",
  needs_revision: "statusNeedsRevision",
  approved: "statusApproved",
  rejected: "statusRejected",
  archived: "statusArchived",
};

const VERIFICATION_LABEL_KEYS: Record<VerificationStatus, string> = {
  reported: "verificationReported",
  partially_verified: "verificationPartiallyVerified",
  verified: "verificationVerified",
  disputed: "verificationDisputed",
};

export function ModerationActionPanel({ incident, categories, divisions, districts }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const allowedTransitions = useMemo(() => getAllowedIncidentStatusTransitions(incident.status), [incident.status]);

  const [status, setStatus] = useState<IncidentStatus>(allowedTransitions[0] ?? incident.status);
  const [statusReason, setStatusReason] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<Message>(null);

  const [verification, setVerification] = useState<VerificationStatus>(incident.verification_status);
  const [verificationReason, setVerificationReason] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<Message>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(incident.title);
  const [editDescription, setEditDescription] = useState(incident.description);
  const [editCategoryId, setEditCategoryId] = useState(incident.category_id);
  const [editDivisionId, setEditDivisionId] = useState(incident.division_id);
  const [editDistrictId, setEditDistrictId] = useState(incident.district_id);
  const [editDate, setEditDate] = useState(incident.incident_date);
  const [editReason, setEditReason] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<Message>(null);

  const availableDistricts = useMemo(
    () => districts.filter((district) => district.division_id === editDivisionId),
    [districts, editDivisionId],
  );

  useEffect(() => {
    setStatus(allowedTransitions[0] ?? incident.status);
    setStatusReason("");
    setStatusMessage(null);
    setVerification(incident.verification_status);
    setVerificationReason("");
    setVerificationMessage(null);
    setIsEditing(false);
    setEditTitle(incident.title);
    setEditDescription(incident.description);
    setEditCategoryId(incident.category_id);
    setEditDivisionId(incident.division_id);
    setEditDistrictId(incident.district_id);
    setEditDate(incident.incident_date);
    setEditReason("");
    setEditMessage(null);
  }, [allowedTransitions, incident]);

  async function handleStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (statusLoading || !allowedTransitions.includes(status)) return;
    const reason = statusReason.trim();
    if (!reason) {
      setStatusMessage({ type: "error", text: `${t("reason")} is required.` });
      return;
    }
    setStatusLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/incidents/${incident.public_id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: status, reason }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data?.message || t("actionError") });
        return;
      }
      setStatusMessage({ type: "success", text: t("actionSuccess") });
      setStatusReason("");
      router.refresh();
    } catch {
      setStatusMessage({ type: "error", text: t("actionError") });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleVerificationChange(e: React.FormEvent) {
    e.preventDefault();
    if (verificationLoading || verification === incident.verification_status) return;
    const reason = verificationReason.trim();
    if (!reason) {
      setVerificationMessage({ type: "error", text: `${t("reason")} is required.` });
      return;
    }
    setVerificationLoading(true);
    setVerificationMessage(null);
    try {
      const res = await fetch(`/api/admin/incidents/${incident.public_id}/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus: verification, reason }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setVerificationMessage({ type: "error", text: data?.message || t("actionError") });
        return;
      }
      setVerificationMessage({ type: "success", text: t("actionSuccess") });
      setVerificationReason("");
      router.refresh();
    } catch {
      setVerificationMessage({ type: "error", text: t("actionError") });
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editLoading) return;
    const reason = editReason.trim();
    if (!reason) {
      setEditMessage({ type: "error", text: `${t("reason")} is required.` });
      return;
    }
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await fetch(`/api/admin/incidents/${incident.public_id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          categoryId: editCategoryId,
          divisionId: editDivisionId,
          districtId: editDistrictId,
          incidentDate: editDate,
          reason,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setEditMessage({ type: "error", text: data?.message || t("actionError") });
        return;
      }
      setEditMessage({ type: "success", text: t("actionSuccess") });
      setEditReason("");
      setIsEditing(false);
      router.refresh();
    } catch {
      setEditMessage({ type: "error", text: t("actionError") });
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Workflow</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">{t("changeStatus")}</h3>
            <p className="mt-1 text-xs text-zinc-500">Current: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t(STATUS_LABEL_KEYS[incident.status])}</span></p>
          </div>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {allowedTransitions.length} {allowedTransitions.length === 1 ? "next action" : "next actions"}
          </span>
        </div>

        {allowedTransitions.length === 0 ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">No further workflow transition is available from this status.</div>
        ) : (
          <form onSubmit={handleStatusChange} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Next valid status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as IncidentStatus)} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                {allowedTransitions.map((value) => <option key={value} value={value}>{t(STATUS_LABEL_KEYS[value])}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("reason")} <span className="text-red-500">*</span></label>
              <input required maxLength={2000} value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder={t("reasonPlaceholder")} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            {statusMessage && <p className={`text-xs ${statusMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{statusMessage.text}</p>}
            <button type="submit" disabled={statusLoading} className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950">{statusLoading ? "Updating…" : t("applyStatusChange")}</button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Assessment</p>
          <h3 className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">{t("changeVerification")}</h3>
          <p className="mt-1 text-xs text-zinc-500">Current: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{t(VERIFICATION_LABEL_KEYS[incident.verification_status])}</span></p>
        </div>
        <form onSubmit={handleVerificationChange} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Assessment</label>
            <select value={verification} onChange={(e) => setVerification(e.target.value as VerificationStatus)} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
              {(Object.keys(VERIFICATION_LABEL_KEYS) as VerificationStatus[]).map((value) => <option key={value} value={value}>{t(VERIFICATION_LABEL_KEYS[value])}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("reason")} <span className="text-red-500">*</span></label>
            <input required maxLength={2000} value={verificationReason} onChange={(e) => setVerificationReason(e.target.value)} placeholder={t("reasonPlaceholder")} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
          </div>
          {verificationMessage && <p className={`text-xs ${verificationMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{verificationMessage.text}</p>}
          <button type="submit" disabled={verificationLoading || verification === incident.verification_status} className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950">{verificationLoading ? "Updating…" : t("applyVerificationChange")}</button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Content</p>
            <h3 className="mt-1 text-base font-semibold text-zinc-950 dark:text-white">{t("editIncident")}</h3>
            <p className="mt-1 text-xs text-zinc-500">{t("editIncidentHelp")}</p>
          </div>
          <button type="button" onClick={() => setIsEditing((value) => !value)} className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">{isEditing ? "Cancel" : "Edit / Redact"}</button>
        </div>

        {isEditing && (
          <form onSubmit={handleEditSubmit} className="mt-5 space-y-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Title</label>
              <input required minLength={5} maxLength={200} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
              <textarea required rows={7} minLength={20} maxLength={10000} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Incident Date</label>
                <input type="date" required value={editDate} onChange={(e) => setEditDate(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Division</label>
                <select value={editDivisionId} onChange={(e) => { const nextDivision = Number(e.target.value); setEditDivisionId(nextDivision); const firstDistrict = districts.find((district) => district.division_id === nextDivision); if (firstDistrict) setEditDistrictId(firstDistrict.id); }} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">{divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">District</label>
                <select value={editDistrictId} onChange={(e) => setEditDistrictId(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">{availableDistricts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("reason")} <span className="text-red-500">*</span></label>
              <input required maxLength={2000} value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder={t("reasonPlaceholder")} className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            {editMessage && <p className={`text-xs ${editMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{editMessage.text}</p>}
            <button type="submit" disabled={editLoading} className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950">{editLoading ? "Saving…" : "Save revision"}</button>
          </form>
        )}
      </section>
    </div>
  );
}
