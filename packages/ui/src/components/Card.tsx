import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card de vidro (glass) ou sólido. */
  variant?: "glass" | "solid";
  /** Cantos maiores (24px) para destaque. */
  feature?: boolean;
  /** Eleva no hover. */
  hover?: boolean;
  children?: ReactNode;
}

/**
 * Container de superfície (glassmorphism) do design system PlantiumAI.
 */
export function Card({
  variant = "glass",
  feature = false,
  hover = false,
  children,
  className = "",
  ...rest
}: CardProps) {
  const classes = [
    "pl-card",
    variant === "solid" ? "pl-card--solid" : "",
    feature ? "pl-card--feature" : "",
    hover ? "pl-card--hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default Card;
