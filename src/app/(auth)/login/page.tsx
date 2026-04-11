import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { getAppSettings } from "@/actions/settings";

export default async function LoginPage() {
  const settings = await getAppSettings();

  return (
    <Suspense>
      <LoginForm
        appName={settings.appName}
        institutionName={settings.institutionName}
        appDescription={settings.appDescription}
        logoUrl={settings.logoUrl}
      />
    </Suspense>
  );
}
