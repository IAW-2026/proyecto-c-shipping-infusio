interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "success";
  size?:
    | "default"
    | "sm"
    | "lg"
    | "icon"
    | "icon-sm"
    | "icon-lg";
}

export function Button({ children, className = "", variant, size, ...rest }: ButtonProps) {
  const variantClass = variant ? `btn-${variant}` : 'btn-default';
  const sizeClass = size ? `btn-${size}` : 'btn-md';

  return (
    <button
      {...rest}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
}