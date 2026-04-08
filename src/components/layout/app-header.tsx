"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/assets": "Daftar Aset",
  "/dashboard/assets/new": "Tambah Aset",
  "/dashboard/assets/import": "Import Aset",
  "/dashboard/assets/export": "Export Aset",
  "/dashboard/assets/trash": "Aset Terhapus",
  "/dashboard/labels": "Cetak Label",
  "/dashboard/scan": "Scanner QR",
  "/dashboard/mutations": "Mutasi Aset",
  "/dashboard/master/categories": "Kategori",
  "/dashboard/master/locations": "Lokasi",
  "/dashboard/master/fund-sources": "Sumber Dana",
  "/dashboard/master/conditions": "Kondisi",
  "/dashboard/users": "Pengguna",
  "/dashboard/audit-log": "Audit Log",
  "/dashboard/settings": "Pengaturan",
};

export function AppHeader() {
  const pathname = usePathname();
  const title =
    breadcrumbMap[pathname] ??
    (pathname.match(/^\/dashboard\/assets\/[^/]+\/edit$/)
      ? "Edit Aset"
      : pathname.match(/^\/dashboard\/assets\/[^/]+$/)
        ? "Detail Aset"
        : "Dashboard");

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  );
}
