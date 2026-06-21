import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

export interface NavLink {
  label: string;
  href?: string;
  active?: boolean;
}

export interface NavbarProps {
  /** Nome da marca exibido ao lado do logo. */
  brand?: string;
  /** Conteúdo do logo (ícone/imagem). Padrão: "P". */
  logo?: ReactNode;
  /** Links de navegação. */
  links?: NavLink[];
  /** Tema atual (para o toggle). */
  theme?: "light" | "dark";
  /** Callback de troca de tema. */
  onToggleTheme?: (next: "light" | "dark") => void;
  /** Ações extras à direita (ex.: botão Entrar). */
  actions?: ReactNode;
}

/**
 * Barra de navegação de vidro do topo, com marca, links, toggle de tema e ações.
 */
export function Navbar({
  brand = "PlantiumAI",
  logo,
  links = [],
  theme = "light",
  onToggleTheme,
  actions,
}: NavbarProps) {
  return (
    <nav className="pl-navbar">
      <span className="pl-navbar__brand">
        <span className="pl-navbar__logo">{logo ?? "P"}</span>
        {brand}
      </span>
      <div className="pl-navbar__links">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href ?? "#"}
            className={`pl-navbar__link${l.active ? " pl-navbar__link--active" : ""}`}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="pl-navbar__actions">
        {onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
        {actions}
      </div>
    </nav>
  );
}

export default Navbar;
