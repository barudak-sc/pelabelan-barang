import Link from "next/link";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

// ============================================================
// Stat Card
// ============================================================
type StatCard = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
};

const stats: StatCard[] = [
  {
    title: "Total Aset",
    value: "0",
    subtitle: "Seluruh aset terdaftar",
    icon: Package,
    iconBg: "bg-brand-50 dark:bg-brand-500/10",
    iconColor: "text-brand-500 dark:text-brand-400",
  },
  {
    title: "Kondisi Baik",
    value: "0",
    subtitle: "Aset dalam kondisi layak",
    icon: CheckCircle2,
    iconBg: "bg-success-50 dark:bg-success-500/10",
    iconColor: "text-success-500 dark:text-success-400",
  },
  {
    title: "Rusak / Perbaikan",
    value: "0",
    subtitle: "Perlu tindak lanjut",
    icon: AlertTriangle,
    iconBg: "bg-warning-50 dark:bg-warning-500/10",
    iconColor: "text-warning-500 dark:text-warning-400",
  },
  {
    title: "Hilang",
    value: "0",
    subtitle: "Tidak ditemukan",
    icon: XCircle,
    iconBg: "bg-error-50 dark:bg-error-500/10",
    iconColor: "text-error-500 dark:text-error-400",
  },
];

// ============================================================
// Dashboard Page
// ============================================================
export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-title-sm font-bold text-gray-900 dark:text-white/90">
            Dashboard
          </h2>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Selamat datang di InvenTrack. Berikut ringkasan inventaris aset Anda.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Periode: Semua waktu</span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-5 shadow-theme-xs hover:shadow-theme-sm transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              {/* Icon */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>

              {/* Trend indicator (placeholder) */}
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>—</span>
              </div>
            </div>

            {/* Value */}
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white/90">
                {stat.value}
              </h3>
              <p className="mt-0.5 text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.title}
              </p>
              <p className="mt-1 text-theme-xs text-gray-400 dark:text-gray-500">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark p-6 shadow-theme-xs">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">
          Aksi Cepat
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Tambah Aset Baru", href: "/dashboard/assets/new", color: "bg-brand-500 hover:bg-brand-600 text-white" },
            { label: "Lihat Semua Aset", href: "/dashboard/assets", color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" },
            { label: "Cetak Label QR", href: "/dashboard/labels", color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Empty State Info */}
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
          <Package className="h-7 w-7 text-brand-500 dark:text-brand-400" />
        </div>
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Belum ada data aset
        </h4>
        <p className="mt-1 text-theme-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
          Mulai tambahkan aset pertama Anda untuk melihat statistik dan laporan inventaris di sini.
        </p>
        <Link
          href="/dashboard/assets/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors duration-200 cursor-pointer"
        >
          <Package className="w-4 h-4" />
          Tambah Aset Pertama
        </Link>
      </div>

    </div>
  );
}
