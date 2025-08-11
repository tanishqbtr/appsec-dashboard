import React, { ReactNode, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface RoleProtectedButtonProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}

export const RoleProtectedButton = forwardRef<HTMLButtonElement, RoleProtectedButtonProps>(({
  children,
  requiredRole = "admin",
  className,
  variant = "default",
  size = "default",
  onClick,
  disabled = false,
  type = "button",
  ...props
}, ref) => {
  const { user, isAdmin } = useAuth();

  const hasRequiredRole = requiredRole === "admin" ? isAdmin : true;
  const isDisabled = disabled || !hasRequiredRole;

  const button = (
    <Button
      ref={ref}
      className={className}
      variant={variant}
      size={size}
      onClick={hasRequiredRole ? onClick : undefined}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );

  // If user doesn't have required role, wrap with tooltip
  if (!hasRequiredRole) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin access required</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});

RoleProtectedButton.displayName = "RoleProtectedButton";