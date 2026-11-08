import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpenInApp, isId } from "@/components/OpenInApp";

export const metadata: Metadata = { title: "Session on Kanvas", robots: { index: false, follow: false } };

export default async function SessionLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) notFound();
  return <OpenInApp title="Open this session in Kanvas" appPath={`s/${id}`} />;
}
