import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual do botão. */
  variant?: "primary" | "secondary" | "ghost";
  /** Tamanho. */
  size?: "sm" | "md" | "lg";
  /** Ocupa a largura total do container. */
  block?: boolean;
  /** Ícone opcional à esquerda do texto. */
  icon?: ReactNode;
  children?: ReactNode;
}

/**
 * Botão do design system PlantiumAI. Pílula, sentence case, verde funcional.
 */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  icon,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = [
    "pl-btn",
    `pl-btn--${variant}`,
    size !== "md" ? `pl-btn--${size}` : "",
    block ? "pl-btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export default Button;
