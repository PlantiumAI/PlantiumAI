import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { signOutAction } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, role } = session.user;

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-4 md:flex-row md:p-6">
      {/* Sidebar */}
      <aside className="flex flex-col gap-4 rounded-2xl glass p-4 md:w-60 md:shrink-0">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <AppSidebar role={role} />
        <div className="mt-auto hidden flex-col gap-2 border-t border-black/5 pt-3 md:flex dark:border-white/10">
          <div className="px-1 text-sm">
            <p className="font-600">{name}</p>
            <p className="text-xs capitalize text-muted">{role}</p>
          </div>
          <form action={signOutAction}>
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-danger/10 hover:text-danger">
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
