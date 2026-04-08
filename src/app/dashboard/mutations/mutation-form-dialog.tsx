"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mutationSchema, type MutationFormData } from "@/lib/validations/mutation";
import { createMutation } from "@/actions/mutations";

type AssetOption = {
  id: string;
  assetCode: string;
  name: string;
  userName: string | null;
  userPosition: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: AssetOption[];
  onSuccess: () => void;
};

export function MutationFormDialog({ open, onOpenChange, assets, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MutationFormData>({
    resolver: zodResolver(mutationSchema),
    defaultValues: {
      assetId: "",
      toUser: "",
      toPosition: "",
      mutationDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const selectedAssetId = form.watch("assetId");
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  async function onSubmit(data: MutationFormData) {
    setIsLoading(true);
    try {
      const result = await createMutation(data);
      if (result.success) {
        toast.success("Mutasi berhasil dicatat");
        form.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Catat Mutasi Aset</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Aset *</Label>
            <Select
              value={form.watch("assetId")}
              onValueChange={(v) => form.setValue("assetId", v ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih aset..." />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.assetCode} — {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.assetId && (
              <p className="text-sm text-destructive">{form.formState.errors.assetId.message}</p>
            )}
          </div>

          {selectedAsset && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-sm">
              <p className="text-gray-500 dark:text-gray-400">Pengguna saat ini:</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {selectedAsset.userName || "(Belum ada)"}
                {selectedAsset.userPosition ? ` — ${selectedAsset.userPosition}` : ""}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="toUser">Pengguna Baru *</Label>
              <Input id="toUser" {...form.register("toUser")} />
              {form.formState.errors.toUser && (
                <p className="text-sm text-destructive">{form.formState.errors.toUser.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="toPosition">Jabatan Baru</Label>
              <Input id="toPosition" {...form.register("toPosition")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mutationDate">Tanggal Mutasi *</Label>
            <Input id="mutationDate" type="date" {...form.register("mutationDate")} />
            {form.formState.errors.mutationDate && (
              <p className="text-sm text-destructive">{form.formState.errors.mutationDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" rows={2} {...form.register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Mutasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
