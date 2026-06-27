import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const classNames = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-primary-foreground hover:bg-primary/90":
          variant === "default",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
          variant === "outline",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "bg-destructive text-destructive-foreground hover:bg-destructive/90":
          variant === "destructive",
      },
      {
        "h-10 px-4 py-2": size === "default",
        "h-8 px-3 text-sm": size === "sm",
        "h-12 px-6 text-lg": size === "lg",
        "h-10 w-10": size === "icon",
      },
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classNames, (children.props as any).className),
        ref,
        ...props,
      });
    }

    return (
      <button className={classNames} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
