"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  KeyRound,
  LayoutDashboard,
  MapPinned,
  Users,
} from "lucide-react";

const nav = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard },
  { href: "/app/locais", label: "Locais", icon: MapPinned },
  { href: "/app/sensores", label: "Sensores", icon: Cpu },
  { href: "/app/tokens", label: "Tokens", icon: KeyRound, managerOnly: true },
  { href: "/app/usuarios", label: "Usuários", icon: Users },
];

export function AppSidebar({ role }: { role: "empresa" | "cliente" }) {
  const pathname = usePathname();
  const items = nav.filter((i) => role === "empresa" || !i.managerOnly);
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible">
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-500 transition ${
              active
                ? "bg-brand text-white shadow-glass"
                : "text-muted hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
