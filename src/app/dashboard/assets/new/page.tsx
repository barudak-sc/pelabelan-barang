import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AssetForm } from "../asset-form";

export default async function NewAssetPage() {
  await requireAdmin();

  const [categories, conditions, fundSources, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.condition.findMany({ orderBy: { severityLevel: "asc" } }),
    prisma.fundSource.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Aset Baru</h1>
        <p className="text-sm text-muted-foreground">
          Isi data aset secara manual
        </p>
      </div>
      <AssetForm
        categories={JSON.parse(JSON.stringify(categories))}
        conditions={JSON.parse(JSON.stringify(conditions))}
        fundSources={JSON.parse(JSON.stringify(fundSources))}
        locations={JSON.parse(JSON.stringify(locations))}
      />
    </div>
  );
}
