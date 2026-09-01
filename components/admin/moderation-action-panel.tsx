"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Database } from "@/types/database";

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

export function ModerationActionPanel({
  incident,
  categories,
  divisions,
  districts,
}: Props) {
  const t = useTranslations("admin");
  const router = useRouter();

  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [statusReason, setStatusReason] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [verification, setVerification] = useState<VerificationStatus>(incident.verification_status);
  const [verificationReason, setVerificationReason] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(incident.title);
  const [editDescription, setEditDescription] = useState(incident.description);
  const [editCategoryId, setEditCategoryId] = useState(incident.category_id);
  const [editDivisionId, setEditDivisionId] = useState(incident.division_id);
  const [editDistrictId, setEditDistrictId] = useState(incident.district_id);
  const [editDate, setEditDate] = useState(incident.incident_date);
  const [editReason, setEditReason] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const availableDistricts = districts.filter(
    (d) => d.division_id === editDivisionId,
  );

  async function handleStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (statusLoading || status === incident.status) return;

    setStatusLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/incidents/${incident.public_id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: status,
          reason: statusReason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatusMessage({ type: "error", text: data?.message || t("actionError") });
        setStatusLoading(false);
        return;
      }

      setStatusMessage({ type: "success", text: t("actionSuccess") });
      setStatusLoading(false);
      setStatusReason("");
      router.refresh();
    } catch {
      setStatusMessage({ type: "error", text: t("actionError") });
      setStatusLoading(false);
    }
  }

  async function handleVerificationChange(e: React.FormEvent) {
    e.preventDefault();
    if (verificationLoading || verification === incident.verification_status) return;

    setVerificationLoading(true);
    setVerificationMessage(null);

    try {
      const res = await fetch(`/api/admin/incidents/${incident.public_id}/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: verification,
          reason: verificationReason.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setVerificationMessage({ type: "error", text: data?.message || t("actionError") });
        setVerificationLoading(false);
        return;
      }

      setVerificationMessage({ type: "success", text: t("actionSuccess") });
      setVerificationLoading(false);
      setVerificationReason("");
      router.refresh();
    } catch {
      setVerificationMessage({ type: "error", text: t("actionError") });
      setVerificationLoading(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editLoading || !editReason.trim()) return;

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
          reason: editReason.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setEditMessage({ type: "error", text: data?.message || t("actionError") });
        setEditLoading(false);
        return;
      }

      setEditMessage({ type: "success", text: t("actionSuccess") });
      setEditLoading(false);
      setEditReason("");
      setIsEditing(false);
      router.refresh();
    } catch {
      setEditMessage({ type: "error", text: t("actionError") });
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Workflow Status Action */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("changeStatus")}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Current status: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{incident.status}</span>
        </p>

        <form onSubmit={handleStatusChange} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="pending">{t("statusPending")}</option>
              <option value="under_review">{t("statusUnderReview")}</option>
              <option value="needs_revision">{t("statusNeedsRevision")}</option>
              <option value="approved">{t("statusApproved")}</option>
              <option value="rejected">{t("statusRejected")}</option>
              <option value="archived">{t("statusArchived")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("reason")}
            </label>
            <input
              type="text"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {statusMessage && (
            <p
              className={`text-xs ${
                statusMessage.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {statusMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={statusLoading || status === incident.status}
            className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {statusLoading ? "Updating…" : t("applyStatusChange")}
          </button>
        </form>
      </section>

      {/* 2. Verification Status Action */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
          {t("changeVerification")}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Current assessment: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{incident.verification_status}</span>
        </p>

        <form onSubmit={handleVerificationChange} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Assessment
            </label>
            <select
              value={verification}
              onChange={(e) => setVerification(e.target.value as VerificationStatus)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="reported">{t("verificationReported")}</option>
              <option value="partially_verified">{t("verificationPartiallyVerified")}</option>
              <option value="verified">{t("verificationVerified")}</option>
              <option value="disputed">{t("verificationDisputed")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t("reason")}
            </label>
            <input
              type="text"
              value={verificationReason}
              onChange={(e) => setVerificationReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {verificationMessage && (
            <p
              className={`text-xs ${
                verificationMessage.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {verificationMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={verificationLoading || verification === incident.verification_status}
            className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {verificationLoading ? "Updating…" : t("applyVerificationChange")}
          </button>
        </form>
      </section>

      {/* 3. Edit & Redact Section */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
              {t("editIncident")}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {t("editIncidentHelp")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isEditing ? "Cancel" : "Edit / Redact"}
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleEditSubmit} className="mt-5 space-y-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                required
                minLength={5}
                maxLength={200}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                required
                rows={6}
                minLength={20}
                maxLength={10000}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Category
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Incident Date
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Division
                </label>
                <select
                  value={editDivisionId}
                  onChange={(e) => {
                    const newDiv = Number(e.target.value);
                    setEditDivisionId(newDiv);
                    const firstDist = districts.find((d) => d.division_id === newDiv);
                    if (firstDist) setEditDistrictId(firstDist.id);
                  }}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  District
                </label>
                <select
                  value={editDistrictId}
                  onChange={(e) => setEditDistrictId(Number(e.target.value))}
                  className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Reason for Edit / Redaction (Required for Audit Trail)
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={2000}
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Redacted phone number and verified location"
                className="mt-1 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {editMessage && (
              <p
                className={`text-xs ${
                  editMessage.type === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {editMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={editLoading || !editReason.trim()}
              className="h-10 rounded-xl bg-zinc-950 px-5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {editLoading ? "Saving Revision…" : t("saveEdits")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
