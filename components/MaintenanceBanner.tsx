import React from 'react';

export const MaintenanceBanner = () => {
  return (
    <div className=" fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-4 px-4 shadow-2xl animate-pulse border-b-4 border-red-600\>
 <div className=\max-w-7xl mx-auto flex items-center justify-center gap-3\>
 <svg className=\w-7 h-7 animate-spin text-white\ fill=\none\ stroke=\currentColor\ viewBox=\0 0 24 24\>
 <path strokeLinecap=\round\ strokeLinejoin=\round\ strokeWidth={3} d=\M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\ />
 </svg>
 <div className=\text-center\>
 <p className=\font-black text-xl md:text-2xl tracking-wide uppercase\>
 ⚠️ SYSTEM MAINTENANCE IN PROGRESS
 </p>
 <p className=\text-base md:text-lg mt-2 font-semibold\>
 The application is currently under maintenance for the next 10 hours. Some features may be temporarily unavailable.
 </p>
 </div>
 <svg className=\w-7 h-7 animate-spin text-white\ fill=\none\ stroke=\currentColor\ viewBox=\0 0 24 24\>
 <path strokeLinecap=\round\ strokeLinejoin=\round\ strokeWidth={3} d=\M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\ />
 </svg>
 </div>
 </div>
 );
};
