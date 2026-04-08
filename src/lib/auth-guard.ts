import { auth } from "@/lib/auth";
import { UserRole } from "@generated/prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
