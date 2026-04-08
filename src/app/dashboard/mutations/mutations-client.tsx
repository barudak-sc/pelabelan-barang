"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MutationFormDialog } from "./mutation-form-dialog";

type MutationRow = {
  id: string;
  fromUser: string | null;
  fromPosition: string | null;
  toUser: string;
  toPosition: string | null;
  mutationDate: string;
  notes: string | null;
  createdAt: string;
  asset: { assetCode: string; name: string };
  creator: { name: string };
};

type AssetOption = {
  id: string;
  assetCode: string;
  name: string;
  userName: string | null;
  userPosition: string | null;
};

export function MutationsClient({
  mutations,
  assets,
}: {
  mutations: MutationRow[];
  assets: AssetOption[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
            Mutasi Aset
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Riwayat pemindahan aset antar pengguna
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Catat Mutasi
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark shadow-theme-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Aset</TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Dari</TableHead>
              <TableHead />
              <TableHead>Ke</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Dicatat oleh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mutations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                  Belum ada mutasi
                </TableCell>
              </TableRow>
            ) : (
              mutations.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.asset.assetCode}</TableCell>
                  <TableCell className="text-sm">{m.asset.name}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{m.fromUser || "(Baru)"}</p>
                      {m.fromPosition && (
                        <p className="text-xs text-gray-400">{m.fromPosition}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p className="font-medium">{m.toUser}</p>
                      {m.toPosition && (
                        <p className="text-xs text-gray-400">{m.toPosition}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {new Date(m.mutationDate).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">{m.creator.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MutationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        assets={assets}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
