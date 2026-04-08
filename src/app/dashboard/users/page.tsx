import { requireAdmin } from "@/lib/auth-guard";
import { getUsers } from "@/actions/users";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  await requireAdmin();
  const users = await getUsers();

  return <UsersClient users={JSON.parse(JSON.stringify(users))} />;
}
