import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ExportClient } from "./export-client";

export default async function ExportPage() {
  await requireAdmin();

  const [categories, conditions] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.condition.findMany({ select: { id: true, name: true }, orderBy: { severityLevel: "asc" } }),
  ]);

  return (
    <ExportClient
      categories={JSON.parse(JSON.stringify(categories))}
      conditions={JSON.parse(JSON.stringify(conditions))}
    />
  );
}
