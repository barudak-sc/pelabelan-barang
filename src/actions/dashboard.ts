"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function getDashboardStats() {
  await requireAuth();

  const [
    totalAssets,
    assetsByCondition,
    assetsByCategory,
    assetsByYear,
    assetsByFundSource,
    recentAssets,
    recentScans,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),

    prisma.$queryRaw<{ name: string; severity_level: number; count: bigint }[]>`
      SELECT c.name, c.severity_level, COUNT(a.id)::bigint as count
      FROM assets a
      JOIN conditions c ON a.condition_id = c.id
      WHERE a.deleted_at IS NULL
      GROUP BY c.id, c.name, c.severity_level
      ORDER BY c.severity_level ASC
    `,

    prisma.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT c.name, COUNT(a.id)::bigint as count
      FROM assets a
      JOIN categories c ON a.category_id = c.id
      WHERE a.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `,

    prisma.$queryRaw<{ year: number; count: bigint }[]>`
      SELECT a.year_purchased as year, COUNT(a.id)::bigint as count
      FROM assets a
      WHERE a.deleted_at IS NULL AND a.year_purchased IS NOT NULL
      GROUP BY a.year_purchased
      ORDER BY a.year_purchased ASC
    `,

    prisma.$queryRaw<{ name: string; count: bigint }[]>`
      SELECT f.name, COUNT(a.id)::bigint as count
      FROM assets a
      JOIN fund_sources f ON a.fund_source_id = f.id
      WHERE a.deleted_at IS NULL
      GROUP BY f.id, f.name
      ORDER BY count DESC
    `,

    prisma.asset.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        assetCode: true,
        name: true,
        createdAt: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.scanLog.findMany({
      select: {
        id: true,
        scannedAt: true,
        ipAddress: true,
        asset: { select: { assetCode: true, name: true } },
      },
      orderBy: { scannedAt: "desc" },
      take: 10,
    }),
  ]);

  // Derive condition summary
  const conditionGood = assetsByCondition
    .filter((c) => c.severity_level <= 1)
    .reduce((sum, c) => sum + Number(c.count), 0);
  const conditionDamaged = assetsByCondition
    .filter((c) => c.severity_level >= 2 && c.severity_level <= 3)
    .reduce((sum, c) => sum + Number(c.count), 0);
  const conditionLost = assetsByCondition
    .filter((c) => c.severity_level >= 4)
    .reduce((sum, c) => sum + Number(c.count), 0);

  return {
    totalAssets,
    conditionGood,
    conditionDamaged,
    conditionLost,
    assetsByCondition: assetsByCondition.map((c) => ({
      name: c.name,
      count: Number(c.count),
    })),
    assetsByCategory: assetsByCategory.map((c) => ({
      name: c.name,
      count: Number(c.count),
    })),
    assetsByYear: assetsByYear.map((y) => ({
      year: y.year,
      count: Number(y.count),
    })),
    assetsByFundSource: assetsByFundSource.map((f) => ({
      name: f.name,
      count: Number(f.count),
    })),
    recentAssets: recentAssets.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    recentScans: recentScans.map((s) => ({
      ...s,
      scannedAt: s.scannedAt.toISOString(),
    })),
  };
}
