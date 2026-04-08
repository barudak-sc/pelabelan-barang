"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  locationSchema,
  type LocationFormData,
} from "@/lib/validations/master-data";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createLocation(
  formData: LocationFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = locationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.location.findFirst({
      where: {
        name: parsed.data.name,
        building: parsed.data.building || null,
        floor: parsed.data.floor || null,
      },
    });
    if (existing) {
      return { success: false, error: "Lokasi dengan kombinasi nama, gedung, dan lantai yang sama sudah ada" };
    }

    const location = await prisma.location.create({
      data: {
        name: parsed.data.name,
        building: parsed.data.building || null,
        floor: parsed.data.floor || null,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/dashboard/master/locations");
    return { success: true, data: location };
  } catch {
    return { success: false, error: "Gagal menambahkan lokasi" };
  }
}

export async function updateLocation(
  id: string,
  formData: LocationFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = locationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.location.findFirst({
      where: {
        name: parsed.data.name,
        building: parsed.data.building || null,
        floor: parsed.data.floor || null,
        NOT: { id },
      },
    });
    if (existing) {
      return { success: false, error: "Lokasi dengan kombinasi nama, gedung, dan lantai yang sama sudah ada" };
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        name: parsed.data.name,
        building: parsed.data.building || null,
        floor: parsed.data.floor || null,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/dashboard/master/locations");
    return { success: true, data: location };
  } catch {
    return { success: false, error: "Gagal memperbarui lokasi" };
  }
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const assetCount = await prisma.asset.count({
      where: { locationId: id, deletedAt: null },
    });
    if (assetCount > 0) {
      return {
        success: false,
        error: `Lokasi tidak bisa dihapus karena digunakan oleh ${assetCount} aset`,
      };
    }

    await prisma.location.delete({ where: { id } });
    revalidatePath("/dashboard/master/locations");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus lokasi" };
  }
}
