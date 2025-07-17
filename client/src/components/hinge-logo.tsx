import hingeHealthLogo from "@assets/images_1752736599270.jpeg";

interface HingeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function HingeLogo({ className = "", size = "md" }: HingeLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-16",
    md: "h-8 w-20", 
    lg: "h-16 w-32"
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