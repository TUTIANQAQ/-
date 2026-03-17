
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GradientText: React.FC<GradientTextProps> = ({ text, as: Component = 'span', className = '' }) => {
  return (
    <Component className={`relative inline-block font-serif-cn font-black tracking-normal isolate ${className}`}>
      {/* 
        Main Gradient Text - Matched to the image: Dark Red -> Burnt Orange -> Purple 
        Using 'font-serif-cn' for that calligraphy/book look.
      */}
      <motion.span
        className="absolute inset-0 z-10 block bg-gradient-to-r from-[#6b0f1a] via-[#b91c1c] via-[#7e22ce] to-[#312e81] bg-[length:200%_auto] bg-clip-text text-transparent will-change-[background-position]"
        animate={{
          backgroundPosition: ['0% center', '200% center'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        aria-hidden="true"
        style={{ 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {text}
      </motion.span>
      
      {/* Base layer for fallback */}
      <span 
        className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 opacity-20"
        style={{ 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent' 
        }}
      >
        {text}
      </span>
      
      {/* Glow Effect - Adjusted for light background (more subtle) */}
      <span
        className="absolute inset-0 -z-10 block bg-gradient-to-r from-[#fda4af] via-[#d8b4fe] to-[#a5b4fc] bg-[length:200%_auto] bg-clip-text text-transparent blur-lg opacity-60"
        style={{ 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transform: 'translateZ(0)' 
        }}
      >
        {text}
      </span>
    </Component>
  );
};

export default GradientText;
