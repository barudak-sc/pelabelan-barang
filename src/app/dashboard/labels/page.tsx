import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { LabelsClient } from "./labels-client";

export default async function LabelsPage() {
  await requireAdmin();

  const assets = await prisma.asset.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      assetCode: true,
      name: true,
      qrToken: true,
      category: { select: { name: true } },
    },
    orderBy: { assetCode: "asc" },
  });

  const institutionName = process.env.NEXT_PUBLIC_INSTITUTION_NAME || "Instansi";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <LabelsClient
      assets={JSON.parse(JSON.stringify(assets))}
      institutionName={institutionName}
      appUrl={appUrl}
    />
  );
}
