"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function lookupAssetByQrToken(token: string) {
  await requireAdmin();

  const asset = await prisma.asset.findUnique({
    where: { qrToken: token },
    select: { id: true, deletedAt: true },
  });

  if (!asset || asset.deletedAt) return null;
  return { id: asset.id };
}

export async function lookupAssetByCode(code: string) {
  await requireAdmin();

  const asset = await prisma.asset.findFirst({
    where: { assetCode: code, deletedAt: null },
    select: { id: true },
  });

  return asset;
}
