"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { mutationSchema, type MutationFormData } from "@/lib/validations/mutation";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createMutation(
  formData: MutationFormData
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = mutationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const d = parsed.data;
    const asset = await prisma.asset.findUnique({
      where: { id: d.assetId },
      select: { userName: true, userPosition: true },
    });

    if (!asset) return { success: false, error: "Aset tidak ditemukan" };

    // Create mutation record
    await prisma.assetMutation.create({
      data: {
        assetId: d.assetId,
        fromUser: asset.userName,
        fromPosition: asset.userPosition,
        toUser: d.toUser,
        toPosition: d.toPosition || null,
        mutationDate: new Date(d.mutationDate),
        notes: d.notes || null,
        createdBy: user.id!,
      },
    });

    // Update asset's current user
    await prisma.asset.update({
      where: { id: d.assetId },
      data: {
        userName: d.toUser,
        userPosition: d.toPosition || null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: "asset",
        entityId: d.assetId,
        action: "UPDATE",
        changedBy: user.id!,
        changes: JSON.parse(JSON.stringify({
          userName: { old: asset.userName, new: d.toUser },
          userPosition: { old: asset.userPosition, new: d.toPosition || null },
          mutation: "transfer",
        })),
      },
    });

    revalidatePath("/dashboard/mutations");
    revalidatePath(`/dashboard/assets/${d.assetId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mencatat mutasi" };
  }
}

export async function getMutations() {
  await requireAdmin();

  return prisma.assetMutation.findMany({
    include: {
      asset: { select: { assetCode: true, name: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getAssetsForMutation() {
  await requireAdmin();

  return prisma.asset.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      assetCode: true,
      name: true,
      userName: true,
      userPosition: true,
    },
    orderBy: { assetCode: "asc" },
  });
}
