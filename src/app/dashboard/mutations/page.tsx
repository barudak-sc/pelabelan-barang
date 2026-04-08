import { requireAdmin } from "@/lib/auth-guard";
import { getMutations, getAssetsForMutation } from "@/actions/mutations";
import { MutationsClient } from "./mutations-client";

export default async function MutationsPage() {
  await requireAdmin();

  const [mutations, assets] = await Promise.all([
    getMutations(),
    getAssetsForMutation(),
  ]);

  return (
    <MutationsClient
      mutations={JSON.parse(JSON.stringify(mutations))}
      assets={JSON.parse(JSON.stringify(assets))}
    />
  );
}
