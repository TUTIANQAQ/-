
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';

const TaiChiIcon: React.FC = () => {
  return (
    <motion.div
      className="w-10 h-10 relative drop-shadow-sm"
      animate={{ 
        rotate: 360,
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        rotate: { repeat: Infinity, duration: 5, ease: "linear" },
        scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base Circle - Yang (Cream) */}
        <circle cx="50" cy="50" r="50" fill="#f2f0e9" />
        
        {/* Yin Shape (Red) - Creates the 'S' curve */}
        {/* Logic: Right semicircle + Bottom-Left bulge - Top-Right scoop */}
        <path 
          d="M50 0 A50 50 0 0 1 50 100 A25 25 0 0 1 50 50 A25 25 0 0 0 50 0 Z" 
          fill="#8B1D24" 
        />
        
        {/* Top Dot (Red) - Placed in the Cream head */}
        <circle cx="50" cy="25" r="6" fill="#8B1D24" />
        
        {/* Bottom Dot (Cream) - Placed in the Red head */}
        <circle cx="50" cy="75" r="6" fill="#f2f0e9" />
        
        {/* Subtle border to define edges clearly */}
        <circle cx="50" cy="50" r="49.5" stroke="#2C2C2C" strokeOpacity="0.1" strokeWidth="1" />
      </svg>
    </motion.div>
  );
};

export default TaiChiIcon;
