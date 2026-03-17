
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { MediaItem } from '../types';
import { Trash2, Play, Eye } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  canDelete?: boolean;
}

const MediaCard = forwardRef<HTMLDivElement, MediaCardProps>(
  ({ item, onClick, onDelete, canDelete = false }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      if (isHovered) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Video play prevented:", error);
          });
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, item.type]);

  // Generate a pseudo-tag based on the title to mimic semantic tags
  const getSecondaryTag = (title: string) => {
    if (title.includes('红')) return '猩红';
    if (title.includes('月')) return '狂气';
    if (title.includes('夜')) return '永夜';
    if (title.includes('梦')) return '梦境';
    if (title.includes('花')) return '花见';
    if (title.includes('雪')) return '冬寂';
    return '幻想';
  };

  return (
    <motion.div
      ref={ref}
      layout={false}
      className="group relative w-full aspect-[3/4] overflow-hidden border border-[#D4AF37] bg-white cursor-pointer rounded-xl shadow-lg shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 will-change-transform"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-hover="true"
    >
      {/* Media Content */}
      <div className="absolute inset-0 bg-gray-100">
        {item.type === 'video' ? (
          <>
            <motion.video
              ref={videoRef}
              src={item.url}
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Play Icon Overlay - Light Theme */}
            <div 
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="w-14 h-14 rounded-full bg-white/70 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-sm">
                <Play className="w-6 h-6 text-[#2C2C2C] fill-[#2C2C2C] ml-1" />
              </div>
            </div>
          </>
        ) : (
          <motion.img 
            src={item.url} 
            alt={item.title} 
            className="h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: isImgLoaded ? 1 : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            onLoad={() => setIsImgLoaded(true)}
          />
        )}
        {/* Gradient overlay - Increased opacity/height slightly to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95 opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Top Actions */}
      {canDelete && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={onDelete}
            className="p-2.5 rounded-full bg-white/80 text-[#2C2C2C]/60 hover:text-red-500 hover:bg-white backdrop-blur-md transition-colors border border-gray-200 shadow-sm"
            title="封印异变"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Info (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none z-10">
        {/* Parent wrapper for Tags and Title: set to overflow-visible to prevent border clipping. Added pb-1 buffer. */}
        <div className="overflow-visible pb-1">
          {/* Tags Row - Refactored for physical stability */}
          <div className="flex flex-wrap items-center gap-2 mb-3 opacity-100 transition-opacity">
            
            {/* Primary Tag (Type) - Shell + Content separation */}
            {/* Fix: 
                - Shell: div with h-[20px], bg-[#f2f0e9], flex center, border.
                - Content: span with leading-none, pt-[1px] for optical centering.
            */}
            <div className="inline-flex items-center justify-center h-[20px] px-3 bg-[#f2f0e9] border border-[#8B1D24]/40 rounded-sm shadow-[0_1px_2px_rgba(139,29,36,0.1)]">
              <span className="text-[10px] font-serif-cn font-bold text-[#8B1D24] leading-none tracking-widest pt-[1px]">
                {item.type === 'video' ? '留念' : '影画'}
              </span>
            </div>
            
            {/* Secondary Tag (Context) - Shell + Content separation */}
            <div className="inline-flex items-center justify-center h-[20px] px-3 bg-[#f2f0e9] border border-[#2C2C2C]/20 rounded-sm">
              <span className="text-[10px] font-serif-cn text-[#2C2C2C]/60 leading-none tracking-wider pt-[1px]">
                {getSecondaryTag(item.title)}
              </span>
            </div>

          </div>
          
          <h3 className="font-serif-cn text-2xl font-bold text-[#2C2C2C] leading-tight pt-1 mb-2 break-words line-clamp-2 tracking-[0.1em]">
            {item.title}
          </h3>
          
          <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
             <p className="text-sm text-[#2C2C2C]/80 line-clamp-2 font-serif-cn font-medium leading-relaxed mb-4">
              {item.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-serif-cn font-bold uppercase tracking-wider text-[#8B1D24]">
              <Eye className="w-3 h-3" />
              <span>解封阅览</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;
