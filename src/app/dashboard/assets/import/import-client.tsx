"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importAssets, getExportTemplate } from "@/actions/import-export";

type ImportResult = {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
};

export function ImportClient() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleDownloadTemplate() {
    const res = await getExportTemplate();
    if (!res.success || !res.data) {
      toast.error(res.error || "Gagal membuat template");
      return;
    }
    downloadBase64("template_import_aset.xlsx", res.data);
  }

  async function handleImport() {
    if (!file) return;
    setIsImporting(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await importAssets(fd);

      if (!res.success) {
        toast.error(res.error || "Gagal mengimpor");
        return;
      }

      setResult(res.data!);
      if (res.data!.successCount > 0) {
        toast.success(`${res.data!.successCount} aset berhasil diimpor`);
      }
      if (res.data!.errorCount > 0) {
        toast.warning(`${res.data!.errorCount} baris gagal diimpor`);
      }
    } catch {
      toast.error("Gagal mengimpor data");
    } finally {
      setIsImporting(false);
    }
  }

  function downloadBase64(filename: string, base64: string) {
    const byteChars = atob(base64);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
          Import Aset
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unggah file Excel (.xlsx) untuk menambahkan aset secara massal
        </p>
      </div>

      {/* Template Download */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark shadow-theme-xs p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
          1. Download Template
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Unduh template Excel, isi data sesuai kolom yang tersedia. Pastikan nilai Kategori, Kondisi, dan Sumber Dana sesuai dengan data master.
        </p>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* File Upload */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark shadow-theme-xs p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
          2. Unggah File
        </h2>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
          }}
        />

        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 cursor-pointer hover:border-brand-500 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {file ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {file.name}
              </p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB — klik untuk ganti
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Klik untuk memilih file Excel (.xlsx)
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting ? "Mengimpor..." : "Import Data"}
          </Button>
          {result && result.successCount > 0 && (
            <Button variant="outline" onClick={() => router.push("/dashboard/assets")}>
              Lihat Daftar Aset
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark shadow-theme-xs p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
            Hasil Import
          </h2>

          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {result.totalRows}
              </p>
              <p className="text-xs text-gray-500">Total Baris</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
              </div>
              <p className="text-xs text-gray-500">Berhasil</p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
              </div>
              <p className="text-xs text-gray-500">Gagal</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Baris</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.errors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{err.row}</TableCell>
                      <TableCell className="text-sm text-red-600 dark:text-red-400">
                        {err.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
