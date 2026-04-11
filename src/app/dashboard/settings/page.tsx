import { requireAdmin } from "@/lib/auth-guard";
import { getAppSettings } from "@/actions/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pengaturan</h2>
        <p className="text-muted-foreground">
          Kelola pengaturan umum aplikasi seperti nama, logo, dan identitas
          instansi
        </p>
      </div>
      <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
