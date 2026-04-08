import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { TrashClient } from "./trash-client";

export default async function AssetTrashPage() {
  await requireAdmin();

  const assets = await prisma.asset.findMany({
    where: { deletedAt: { not: null } },
    include: {
      category: { select: { name: true } },
      condition: { select: { name: true } },
    },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <TrashClient assets={JSON.parse(JSON.stringify(assets))} />
  );
}
