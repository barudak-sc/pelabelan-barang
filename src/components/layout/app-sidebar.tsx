"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Plus,
  Printer,
  ScanLine,
  ArrowLeftRight,
  FolderTree,
  MapPin,
  Wallet,
  ShieldCheck,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const navSections: {
  label: string;
  items: NavItem[];
}[] = [
  {
    label: "Menu Utama",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Aset",
    items: [
      { title: "Daftar Aset", href: "/dashboard/assets", icon: Package },
      { title: "Tambah Aset", href: "/dashboard/assets/new", icon: Plus, adminOnly: true },
      { title: "Cetak Label", href: "/dashboard/labels", icon: Printer, adminOnly: true },
      { title: "Scanner QR", href: "/dashboard/scan", icon: ScanLine },
      { title: "Mutasi", href: "/dashboard/mutations", icon: ArrowLeftRight, adminOnly: true },
    ],
  },
  {
    label: "Data Master",
    items: [
      { title: "Kategori", href: "/dashboard/master/categories", icon: FolderTree, adminOnly: true },
      { title: "Lokasi", href: "/dashboard/master/locations", icon: MapPin, adminOnly: true },
      { title: "Sumber Dana", href: "/dashboard/master/fund-sources", icon: Wallet, adminOnly: true },
      { title: "Kondisi", href: "/dashboard/master/conditions", icon: ShieldCheck, adminOnly: true },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { title: "Pengguna", href: "/dashboard/users", icon: Users, adminOnly: true },
      { title: "Audit Log", href: "/dashboard/audit-log", icon: FileText, adminOnly: true },
      { title: "Pengaturan", href: "/dashboard/settings", icon: Settings, adminOnly: true },
    ],
  },
];

type AppSidebarProps = {
  user: {
    name?: string | null;
    role: string;
  };
};

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">InvenTrack</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<Link href={item.href} />}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {user.name ?? "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.role}
                </p>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
