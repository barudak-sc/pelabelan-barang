"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/master-data";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createCategory(
  formData: CategoryFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: parsed.data.name },
          { codePrefix: parsed.data.codePrefix },
        ],
      },
    });
    if (existing) {
      return {
        success: false,
        error:
          existing.name === parsed.data.name
            ? "Nama kategori sudah digunakan"
            : "Kode prefix sudah digunakan",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        codePrefix: parsed.data.codePrefix,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/dashboard/master/categories");
    return { success: true, data: category };
  } catch {
    return { success: false, error: "Gagal menambahkan kategori" };
  }
}

export async function updateCategory(
  id: string,
  formData: CategoryFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: parsed.data.name },
          { codePrefix: parsed.data.codePrefix },
        ],
        NOT: { id },
      },
    });
    if (existing) {
      return {
        success: false,
        error:
          existing.name === parsed.data.name
            ? "Nama kategori sudah digunakan"
            : "Kode prefix sudah digunakan",
      };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        codePrefix: parsed.data.codePrefix,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/dashboard/master/categories");
    return { success: true, data: category };
  } catch {
    return { success: false, error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const assetCount = await prisma.asset.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (assetCount > 0) {
      return {
        success: false,
        error: `Kategori tidak bisa dihapus karena digunakan oleh ${assetCount} aset`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/dashboard/master/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus kategori" };
  }
}
