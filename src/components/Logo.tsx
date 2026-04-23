interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ size = "md", showTagline = false }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };
  return (
    <div className="inline-flex flex-col">
      <span className={`font-bold tracking-tight ${sizeClasses[size]} text-text-primary`}>
        saudejusia<span className="text-primary">.</span>
      </span>
      {showTagline && (
        <span className="caption mt-1">Direitos do beneficiário de plano de saúde</span>
      )}
    </div>
  );
}
