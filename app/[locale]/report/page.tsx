import { redirect } from "next/navigation";

export default async function LegacyReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/incident/new`);
}
