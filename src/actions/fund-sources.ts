"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  fundSourceSchema,
  type FundSourceFormData,
} from "@/lib/validations/master-data";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createFundSource(
  formData: FundSourceFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = fundSourceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.fundSource.findUnique({
      where: { name: parsed.data.name },
    });
    if (existing) {
      return { success: false, error: "Nama sumber dana sudah digunakan" };
    }

    const fundSource = await prisma.fundSource.create({
      data: { name: parsed.data.name },
    });

    revalidatePath("/dashboard/master/fund-sources");
    return { success: true, data: fundSource };
  } catch {
    return { success: false, error: "Gagal menambahkan sumber dana" };
  }
}

export async function updateFundSource(
  id: string,
  formData: FundSourceFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = fundSourceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.fundSource.findFirst({
      where: { name: parsed.data.name, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: "Nama sumber dana sudah digunakan" };
    }

    const fundSource = await prisma.fundSource.update({
      where: { id },
      data: { name: parsed.data.name },
    });

    revalidatePath("/dashboard/master/fund-sources");
    return { success: true, data: fundSource };
  } catch {
    return { success: false, error: "Gagal memperbarui sumber dana" };
  }
}

export async function deleteFundSource(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const assetCount = await prisma.asset.count({
      where: { fundSourceId: id, deletedAt: null },
    });
    if (assetCount > 0) {
      return {
        success: false,
        error: `Sumber dana tidak bisa dihapus karena digunakan oleh ${assetCount} aset`,
      };
    }

    await prisma.fundSource.delete({ where: { id } });
    revalidatePath("/dashboard/master/fund-sources");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus sumber dana" };
  }
}
