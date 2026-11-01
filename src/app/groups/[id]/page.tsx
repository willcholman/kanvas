import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenInApp, isId } from "@/components/OpenInApp";

export const metadata: Metadata = { title: "Group on Kanvas", robots: { index: false, follow: false } };

export default async function GroupLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) notFound();
  return <OpenInApp title="Open this group in Kanvas" appPath={`groups/${id}`} />;
}
