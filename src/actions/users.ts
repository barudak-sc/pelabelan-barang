"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateFormData,
  type UserUpdateFormData,
} from "@/lib/validations/user";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(
  formData: UserCreateFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = userCreateSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.user.findFirst({
      where: { username: parsed.data.username, deletedAt: null },
    });
    if (existing) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        name: parsed.data.name,
        role: parsed.data.role,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menambahkan pengguna" };
  }
}

export async function updateUser(
  id: string,
  formData: UserUpdateFormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = userUpdateSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const existing = await prisma.user.findFirst({
      where: { username: parsed.data.username, deletedAt: null, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: "Username sudah digunakan" };
    }

    const updateData: Record<string, unknown> = {
      username: parsed.data.username,
      name: parsed.data.name,
      role: parsed.data.role,
    };

    if (parsed.data.password && parsed.data.password.length > 0) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    }

    await prisma.user.update({ where: { id }, data: updateData });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui pengguna" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const currentUser = await requireAdmin();

    if (currentUser.id === id) {
      return { success: false, error: "Tidak bisa menghapus akun sendiri" };
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}
