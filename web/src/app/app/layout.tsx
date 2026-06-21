import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/app-shell";
import { signOutAction } from "./actions";
import "../plantium-ds.css";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? "Produtor";
  const email = session.user.email ?? "voce@plantium.ai";

  return (
    <AppShell name={name} email={email} signOut={signOutAction}>
      {children}
    </AppShell>
  );
}
