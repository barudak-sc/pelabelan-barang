"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function getAuditLogs(params?: {
  entityType?: string;
  action?: string;
}) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (params?.entityType) where.entityType = params.entityType;
  if (params?.action) where.action = params.action;

  return prisma.auditLog.findMany({
    where,
    include: {
      user: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
