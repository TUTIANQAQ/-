
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Initialize off-screen to prevent flash
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Smooth spring animation
  const springConfig = { damping: 25, stiffness: 400, mass: 0.1 }; 
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const clickable = target.closest('button') || 
                        target.closest('a') || 
                        target.closest('[data-hover="true"]');
      setIsHovering(!!clickable);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-exclusion flex items-center justify-center hidden md:flex will-change-transform"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      {/* Precision cursor: Animating width/height keeps child text crisp and small */}
      <motion.div
        className="relative rounded-full bg-white shadow-[0_0_5px_rgba(0,0,0,0.2)] flex items-center justify-center"
        animate={{
          width: isHovering ? 56 : 16,  // Expands to 56px
          height: isHovering ? 56 : 16,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {/* Text directly inside the scalable cursor body */}
        <motion.span 
          className="z-10 text-black font-bold uppercase tracking-widest text-[9px] overflow-hidden whitespace-nowrap"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovering ? 1 : 0,
            scale: isHovering ? 1 : 0
          }}
          transition={{ duration: 0.15 }}
        >
          查看
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
