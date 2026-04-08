"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  conditionSchema,
  type ConditionFormData,
} from "@/lib/validations/master-data";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createCondition(
  formData: ConditionFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = conditionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.condition.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return { success: false, error: "Nama kondisi sudah digunakan" };
    }

    const condition = await prisma.condition.create({
      data: {
        name: parsed.data.name,
        severityLevel: parsed.data.severityLevel,
      },
    });

    revalidatePath("/dashboard/master/conditions");
    return { success: true, data: condition };
  } catch {
    return { success: false, error: "Gagal menambahkan kondisi" };
  }
}

export async function updateCondition(
  id: string,
  formData: ConditionFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = conditionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.condition.findFirst({
      where: { name: parsed.data.name, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: "Nama kondisi sudah digunakan" };
    }

    const condition = await prisma.condition.update({
      where: { id },
      data: {
        name: parsed.data.name,
        severityLevel: parsed.data.severityLevel,
      },
    });

    revalidatePath("/dashboard/master/conditions");
    return { success: true, data: condition };
  } catch {
    return { success: false, error: "Gagal memperbarui kondisi" };
  }
}

export async function deleteCondition(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const assetCount = await prisma.asset.count({
      where: { conditionId: id, deletedAt: null },
    });
    if (assetCount > 0) {
      return {
        success: false,
        error: `Kondisi tidak bisa dihapus karena digunakan oleh ${assetCount} aset`,
      };
    }

    await prisma.condition.delete({ where: { id } });
    revalidatePath("/dashboard/master/conditions");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus kondisi" };
  }
}
