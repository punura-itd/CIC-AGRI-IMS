import React from 'react';
import { Package } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  // Fallback to the Package icon if the logo image fails to load
  const [imageError, setImageError] = React.useState(false);

  if (imageError) {
    return (
      <div className={`relative ${className}`}>
        <Package className="w-full h-full text-teal-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img 
        src="/logo2.png" 
        alt="InventoryPro Logo" 
        className="w-full h-full object-contain rounded-lg"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default Logo;