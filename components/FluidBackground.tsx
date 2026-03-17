
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarField = () => {
  // Dark particles for light background
  const stars = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.3 + 0.1 // Lower opacity for subtle dust look
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-gray-600 will-change-[opacity,transform]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            transform: 'translateZ(0)'
          }}
          initial={{ opacity: star.opacity, scale: 1 }}
          animate={{
            opacity: [star.opacity, 0.5, star.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f2f0e9]">
      
      {/* 
        Rice Paper Texture Background 
        Using a high-quality Washi/Rice paper texture from Unsplash.
        The image is fixed (absolute inset-0 in a fixed container) and covers the screen.
      */}
      <div 
        className="absolute inset-0 w-full h-full opacity-90 mix-blend-multiply"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1621360841012-78d12997b093?q=80&w=2670&auto=format&fit=crop')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Warm overlay to tint the paper slightly towards a cozy cream if the image is too cool */}
      <div className="absolute inset-0 bg-[#fffbf0]/30 mix-blend-overlay" />

      <StarField />

      {/* 
         Light Theme Blobs: 
         Using 'mix-blend-multiply' allows colors to stain the paper texture like watercolor.
      */}

      {/* Blob 1: Soft Rose/Red */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[90vw] h-[90vw] bg-[#ffddd2] rounded-full mix-blend-multiply filter blur-[40px] opacity-40 will-change-transform"
        animate={{
          x: [0, 50, -25, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 2: Soft Lavender */}
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[100vw] h-[80vw] bg-[#e0d6ff] rounded-full mix-blend-multiply filter blur-[40px] opacity-40 will-change-transform"
        animate={{
          x: [0, -50, 25, 0],
          y: [0, 50, -25, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 3: Pale Gold/Orange */}
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#ffe8cc] rounded-full mix-blend-multiply filter blur-[40px] opacity-40 will-change-transform"
        animate={{
          x: [0, 75, -75, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Static Grain Overlay - Reduced opacity as the paper image provides texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply pointer-events-none"></div>
      
      {/* Light Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/0 to-[#dcdcdc]/40 pointer-events-none" />
    </div>
  );
};

export default FluidBackground;
