"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Download,
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  User,
  Printer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteAsset, deleteAssetPhoto } from "@/actions/assets";

type AssetData = {
  id: string;
  assetCode: string;
  qrToken: string;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  yearAcquired: number | null;
  yearPurchased: number | null;
  vendor: string | null;
  userName: string | null;
  userPosition: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category: { name: string; codePrefix: string };
  condition: { name: string; severityLevel: number };
  fundSource: { name: string } | null;
  location: { name: string; building: string | null; floor: string | null } | null;
  creator: { name: string };
  photos: { id: string; filePath: string; fileName: string; isPrimary: boolean }[];
  mutations: {
    id: string;
    fromUser: string | null;
    toUser: string;
    fromPosition: string | null;
    toPosition: string | null;
    mutationDate: string;
    notes: string | null;
    creator: { name: string };
  }[];
};

type Props = {
  asset: AssetData;
  appUrl: string;
  isAdmin: boolean;
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value || "-"}</dd>
    </div>
  );
}

export function AssetDetail({ asset, appUrl, isAdmin }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const verifyUrl = `${appUrl}/verify/${asset.qrToken}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, verifyUrl, {
        width: 200,
        margin: 2,
      });
    }
  }, [verifyUrl]);

  function downloadQR() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `QR-${asset.assetCode}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  function conditionVariant(severity: number) {
    if (severity <= 1) return "default" as const;
    if (severity <= 2) return "secondary" as const;
    if (severity <= 3) return "destructive" as const;
    return "outline" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} data-print-hide>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {asset.assetCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2" data-print-hide>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {isAdmin && (
            <>
              <Link href={`/dashboard/assets/${asset.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Photos */}
          {asset.photos.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="aspect-video overflow-hidden rounded-lg border">
                    <img
                      src={asset.photos[selectedPhoto]?.filePath}
                      alt={asset.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {asset.photos.length > 1 && (
                    <div className="flex gap-2">
                      {asset.photos.map((photo, i) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhoto(i)}
                          className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                            i === selectedPhoto
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={photo.filePath}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Aset</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <InfoRow label="Kategori" value={asset.category.name} />
                <InfoRow label="Merk" value={asset.brand} />
                <InfoRow label="Type/Model" value={asset.model} />
                <InfoRow label="Serial Number" value={asset.serialNumber} />
                <InfoRow
                  label="Kondisi"
                  value={asset.condition.name}
                />
                <InfoRow
                  label="Tahun Barang"
                  value={asset.yearAcquired?.toString()}
                />
                <InfoRow
                  label="Tahun Pembelian"
                  value={asset.yearPurchased?.toString()}
                />
                <InfoRow
                  label="Sumber Dana"
                  value={asset.fundSource?.name}
                />
                <InfoRow label="Vendor" value={asset.vendor} />
                <InfoRow
                  label="Lokasi"
                  value={
                    asset.location
                      ? `${asset.location.name}${
                          asset.location.building
                            ? ` - ${asset.location.building}`
                            : ""
                        }${
                          asset.location.floor
                            ? ` Lt.${asset.location.floor}`
                            : ""
                        }`
                      : null
                  }
                />
                <InfoRow label="Pengguna" value={asset.userName} />
                <InfoRow label="Jabatan" value={asset.userPosition} />
                <InfoRow label="Keterangan" value={asset.description} />
                <InfoRow label="Dibuat oleh" value={asset.creator.name} />
                <InfoRow
                  label="Tanggal Input"
                  value={new Date(asset.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  label="Terakhir Diupdate"
                  value={new Date(asset.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
              </dl>
            </CardContent>
          </Card>

          {/* Mutation History */}
          {asset.mutations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riwayat Mutasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {asset.mutations.map((m) => (
                    <div key={m.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <ArrowLeftRight className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 w-px bg-border" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">
                          {m.fromUser || "(Baru)"} → {m.toUser}
                        </p>
                        {m.toPosition && (
                          <p className="text-xs text-muted-foreground">
                            Jabatan: {m.toPosition}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(m.mutationDate).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {m.creator.name}
                          </span>
                        </div>
                        {m.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {m.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code Sidebar */}
        <div className="space-y-6">
          <Card id="qr">
            <CardHeader>
              <CardTitle className="text-lg">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <canvas ref={canvasRef} />
              <p className="text-center text-xs text-muted-foreground break-all">
                {verifyUrl}
              </p>
              <Button onClick={downloadQR} variant="outline" className="w-full" data-print-hide>
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kondisi</span>
                <Badge
                  variant={conditionVariant(asset.condition.severityLevel)}
                >
                  {asset.condition.name}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kategori</span>
                <span className="text-sm">{asset.category.name}</span>
              </div>
              {asset.location && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Lokasi
                    </span>
                    <span className="text-sm">{asset.location.name}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Hapus Aset"
        description={`Aset "${asset.name}" akan dipindahkan ke sampah.`}
        onConfirm={async () => {
          const result = await deleteAsset(asset.id);
          if (result.success) {
            toast.success("Aset berhasil dihapus");
            router.push("/dashboard/assets");
          } else {
            toast.error(result.error);
          }
        }}
      />
    </div>
  );
}
