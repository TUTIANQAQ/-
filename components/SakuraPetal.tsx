
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const SakuraPetal: React.FC = () => {
  // 使用 useMemo 生成只在挂载时计算一次的随机参数
  const params = useMemo(() => {
    // 屏幕宽度的百分比作为起始水平位置
    const startX = Math.random() * 100;
    // 结束时的水平偏移量，模拟风吹
    const xDrift = (Math.random() - 0.5) * 200; 
    
    return {
      left: `${startX}%`,
      duration: 15 + Math.random() * 10, // 15-25秒
      delay: Math.random() * 10, // 0-10秒延迟
      size: 10 + Math.random() * 10, // 10-20px
      initialRotate: Math.random() * 360,
      endRotate: 360 + Math.random() * 720, // 旋转 1-3 圈
      xDrift
    };
  }, []);

  return (
    <motion.div
      className="absolute bg-gradient-to-br from-pink-200/60 to-white/40 rounded-tr-3xl rounded-bl-3xl pointer-events-none"
      style={{
        width: params.size,
        height: params.size,
        left: params.left,
        top: -50, // 初始位置在屏幕上方
      }}
      initial={{ 
        y: -100, 
        rotate: params.initialRotate,
        opacity: 0 
      }}
      animate={{ 
        y: '110vh', // 落到屏幕下方
        x: params.xDrift,
        rotate: params.endRotate,
        opacity: [0, 0.8, 0.8, 0] // 淡入 -> 保持 -> 淡出
      }}
      transition={{ 
        duration: params.duration, 
        delay: params.delay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0
      }}
    />
  );
};

export default SakuraPetal;
