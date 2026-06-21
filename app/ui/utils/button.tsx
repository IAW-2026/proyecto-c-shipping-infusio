"use client"

import Link from "next/link"

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
  href?: string;
}

export function Button({ children, className = "", variant, size, href, ...rest }: ButtonProps) {
  const variantClass = variant ? `btn-${variant}` : 'btn-default';
  const sizeClass = size ? `btn-${size}` : 'btn-md';
  const classNames = `btn ${variantClass} ${sizeClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button
      {...rest}
      className={classNames}
    >
      {children}
    </button>
  );
}