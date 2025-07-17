import hingeHealthLogo from "@assets/ChatGPT Image Jul 17, 2025, 07_08_44 PM_1752759864189.png";

interface HingeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function HingeLogo({ className = "", size = "md" }: HingeLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-16",
    md: "h-8 w-20", 
    lg: "h-80 w-160"
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className} rounded overflow-hidden flex items-center justify-center`}
      style={{
        backgroundImage: `url(${hingeHealthLogo})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* This creates a cropped view of the logo focusing on the center where the logo text is */}
    </div>
  );
}