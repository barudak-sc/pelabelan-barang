"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { restoreAsset } from "@/actions/assets";

type TrashAsset = {
  id: string;
  assetCode: string;
  name: string;
  deletedAt: string;
  category: { name: string };
  condition: { name: string };
};

export function TrashClient({ assets }: { assets: TrashAsset[] }) {
  const router = useRouter();
  const [restoreTarget, setRestoreTarget] = useState<TrashAsset | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/assets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Aset Terhapus</h1>
          <p className="text-sm text-muted-foreground">
            {assets.length} aset di sampah
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Aset</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dihapus</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Tidak ada aset di sampah
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-sm">
                    {asset.assetCode}
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.category.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(asset.deletedAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(asset)}
                    >
                      <RotateCcw className="mr-2 h-3 w-3" />
                      Pulihkan
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        title="Pulihkan Aset"
        description={`Aset "${restoreTarget?.name}" akan dipulihkan ke daftar aktif.`}
        variant="default"
        confirmText="Pulihkan"
        onConfirm={async () => {
          if (!restoreTarget) return;
          const result = await restoreAsset(restoreTarget.id);
          if (result.success) {
            toast.success("Aset berhasil dipulihkan");
            setRestoreTarget(null);
            router.refresh();
          } else {
            toast.error(result.error);
          }
        }}
      />
    </div>
  );
}
