"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { assetSchema, type AssetFormData } from "@/lib/validations/asset";
import { createAsset, updateAsset, uploadAssetPhotos } from "@/actions/assets";

type MasterItem = { id: string; name: string };
type CategoryItem = MasterItem & { codePrefix: string };
type ConditionItem = MasterItem & { severityLevel: number };
type LocationItem = MasterItem & { building: string | null; floor: string | null };

type PhotoPreview = {
  file: File;
  url: string;
};

type ExistingPhoto = {
  id: string;
  filePath: string;
  fileName: string;
};

type Props = {
  categories: CategoryItem[];
  conditions: ConditionItem[];
  fundSources: MasterItem[];
  locations: LocationItem[];
  defaultValues?: AssetFormData & { id: string };
  existingPhotos?: ExistingPhoto[];
};

export function AssetForm({
  categories,
  conditions,
  fundSources,
  locations,
  defaultValues,
  existingPhotos = [],
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!defaultValues?.id;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: defaultValues ?? {
      name: "",
      categoryId: "",
      brand: "",
      model: "",
      serialNumber: "",
      yearAcquired: "",
      yearPurchased: "",
      fundSourceId: "",
      vendor: "",
      userName: "",
      userPosition: "",
      locationId: "",
      conditionId: "",
      description: "",
    },
  });

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const maxTotal = 5 - existingPhotos.length;

    if (photos.length + files.length > maxTotal) {
      toast.error(`Maksimal ${maxTotal} foto baru (sudah ada ${existingPhotos.length} foto)`);
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} melebihi 5MB`);
        return;
      }
    }

    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...previews]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(data: AssetFormData) {
    setIsSubmitting(true);
    try {
      let assetId: string;

      if (isEdit) {
        const result = await updateAsset(defaultValues!.id, data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        assetId = defaultValues!.id;
        toast.success("Aset berhasil diperbarui");
      } else {
        const result = await createAsset(data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        assetId = result.data!.id;
        toast.success(`Aset ${result.data!.assetCode} berhasil ditambahkan`);
      }

      // Upload photos if any
      if (photos.length > 0) {
        const fd = new FormData();
        for (const p of photos) fd.append("photos", p.file);
        const photoResult = await uploadAssetPhotos(assetId, fd);
        if (!photoResult.success) {
          toast.error(photoResult.error);
        }
      }

      router.push(`/dashboard/assets/${assetId}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Informasi Dasar</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nama Barang *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(v) => form.setValue("categoryId", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.codePrefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Kondisi *</Label>
              <Select
                value={form.watch("conditionId")}
                onValueChange={(v) => form.setValue("conditionId", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.conditionId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.conditionId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Merk</Label>
              <Input id="brand" {...form.register("brand")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Type/Model</Label>
              <Input id="model" {...form.register("model")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" {...form.register("serialNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor/Penyedia</Label>
              <Input id="vendor" {...form.register("vendor")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Tahun & Sumber Dana</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tahun Barang</Label>
              <Select
                value={String(form.watch("yearAcquired") || "")}
                onValueChange={(v) => form.setValue("yearAcquired", !v || v === "" ? "" : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Pembelian</Label>
              <Select
                value={String(form.watch("yearPurchased") || "")}
                onValueChange={(v) => form.setValue("yearPurchased", !v || v === "" ? "" : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sumber Dana</Label>
              <Select
                value={form.watch("fundSourceId") || ""}
                onValueChange={(v) => form.setValue("fundSourceId", !v || v === "" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sumber dana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {fundSources.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Select
                value={form.watch("locationId") || ""}
                onValueChange={(v) => form.setValue("locationId", !v || v === "" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                      {l.building ? ` - ${l.building}` : ""}
                      {l.floor ? ` Lt.${l.floor}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Pengguna</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="userName">Nama Pengguna</Label>
              <Input id="userName" {...form.register("userName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPosition">Jabatan</Label>
              <Input id="userPosition" {...form.register("userPosition")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              rows={3}
              {...form.register("description")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Foto Dokumentasi</h3>
          <p className="text-sm text-muted-foreground">
            Maksimal 5 foto, masing-masing maks 5MB (JPG, PNG, WEBP)
          </p>

          {existingPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {existingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-lg border"
                >
                  <img
                    src={photo.filePath}
                    alt={photo.fileName}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg border"
              >
                <img
                  src={p.url}
                  alt={p.file.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {existingPhotos.length + photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs">Tambah</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Simpan Aset"}
        </Button>
      </div>
    </form>
  );
}
