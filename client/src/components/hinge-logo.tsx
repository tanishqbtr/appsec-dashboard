import hingeHealthLogo from "@assets/ChatGPT Image Jul 17, 2025, 07_08_44 PM_1752760077600.png";

interface HingeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function HingeLogo({ className = "", size = "md" }: HingeLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-16",
    md: "h-8 w-20", 
    lg: "h-64 w-96"
  };

  return (
    <img 
      src={hingeHealthLogo}
      alt="Hinge Health Logo"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
}