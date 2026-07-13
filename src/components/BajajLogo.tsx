import React from 'react';

/**
 * Official Bajaj Auto logo image
 * White-on-blue scheme using the authentic Wikipedia asset
 */
export const BajajHorizontalLogo: React.FC<{ className?: string; inverted?: boolean }> = ({ 
  className = "h-10", 
  inverted = false 
}) => {
  return (
    <div className={`flex items-center overflow-hidden rounded-lg select-none ${className}`}>
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bajaj_Auto_Logo.svg/512px-Bajaj_Auto_Logo.svg.png" 
        className="h-full w-auto object-contain" 
        alt="Bajaj Auto Logo" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

/**
 * Beautiful representation of "THE WORLD'S FAVOURITE INDIAN" logo
 * It uses the actual official logo image on the left and the elegant slanted text on the right
 */
export const BajajFavouriteIndianLogo: React.FC<{ className?: string; compact?: boolean }> = ({ 
  className = "", 
  compact = false 
}) => {
  return (
    <div className={`flex items-center gap-3 bg-white p-2 rounded-xl select-none transition-shadow ${className}`}>
      {/* Official logo image cropped or fitted to look like the square emblem */}
      <div className="bg-[#005cb9] rounded-lg overflow-hidden flex items-center justify-center p-1 w-14 h-14 sm:w-16 sm:h-16 shrink-0 shadow-sm">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bajaj_Auto_Logo.svg/512px-Bajaj_Auto_Logo.svg.png" 
          className="w-full h-full object-contain scale-110" 
          alt="Bajaj Logo Icon" 
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Slanted Branding Text */}
      <div className="flex flex-col select-none rotate-[-2deg] transform origin-left">
        <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-[#005cb9] uppercase leading-none">
          THE
        </span>
        <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#005cb9] uppercase leading-none mt-0.5">
          WORLD'S
        </span>
        <span className="text-xs sm:text-sm font-black tracking-tight text-[#005cb9] uppercase leading-none mt-0.5">
          FAVOURITE
        </span>
        <span className="text-sm sm:text-lg font-black tracking-tighter text-[#005cb9] uppercase leading-none">
          INDIAN
        </span>
      </div>
    </div>
  );
};

