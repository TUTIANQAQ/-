
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Film, Loader2, ChevronLeft, ChevronRight, Trash2, Edit2, Check, ExternalLink, AlertTriangle, ChevronDown } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import MediaCard from './components/ArtistCard';
import TaiChiIcon from './components/TaiChiIcon';
import SakuraRain from './components/SakuraRain';
import MusicPlayer from './components/MusicPlayer';
import { MediaItem } from './types';
import { analyzeImage } from './services/geminiService';
import { fetchWorks, uploadWorkFile, createWork, updateWork, deleteWork } from './services/worksService';
import Auth from './src/components/Auth';
import { useAuth } from './src/contexts/AuthContext';

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut, loading: authLoading } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');

  // Image Zoom State
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Auth Modal
  const [showAuth, setShowAuth] = useState(false);

  // Dynamic Title Animation
  useEffect(() => {
    const baseTitle = "东方幻世录 | 少女祈祷中";
    const frames = [".", "..", "...", "....", ".....", "......"];
    let i = 0;
    
    const interval = setInterval(() => {
      document.title = `${baseTitle}${frames[i]}`;
      i = (i + 1) % frames.length;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // 从 Supabase 拉取作品列表
  useEffect(() => {
    const load = async () => {
      try {
        setDbError(null);
        const data = await fetchWorks();
        setItems(data);
      } catch (err: any) {
        console.error('Error fetching works:', err);
        setDbError(err?.message || '无法加载数据');
      }
    };
    load();
  }, []);

  // Sync edit state when item is selected & Reset zoom
  useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title);
      setEditDesc(selectedItem.description);
      setEditSourceUrl(selectedItem.sourceUrl || '');
      setIsEditing(false);
      setIsImageZoomed(false); // Reset zoom when switching items
    }
  }, [selectedItem]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close Zoom if open
      if (isImageZoomed && e.key === 'Escape') {
        setIsImageZoomed(false);
        return;
      }

      if (!selectedItem) return;
      if (isEditing) return; // Disable nav while editing
      if (e.key === 'ArrowLeft') navigateItem('prev');
      if (e.key === 'ArrowRight') navigateItem('next');
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items, isEditing, isImageZoomed]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      alert('请先登录后再奉纳作品。');
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress('正在解析灵力...');

    try {
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' as const : 'image' as const;
      let title = "新收录·未命名";
      let description = "等待撰写的幻想纪事。";

      if (!isVideo) {
        setUploadProgress('AI 正在构筑绘卷信息...');
        const reader = new FileReader();
        const base64Url = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const rawBase64 = base64Url.split(',')[1];
        const aiData = await analyzeImage(rawBase64, file.type);
        title = aiData.title;
        description = aiData.description;
      }

      setUploadProgress('刻录至灵格...');
      const imageUrl = await uploadWorkFile(file);
      const newItem = await createWork({
        type,
        image_url: imageUrl,
        title,
        description,
        source_url: '',
      });

      setItems(prev => [newItem, ...prev]);
    } catch (error: any) {
      console.error("Upload error", error);
      alert(error?.message || "奉纳失败或灵力过载（请确认 Supabase Storage 已创建 works 桶）");
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    const idStr = String(id);
    try {
      await deleteWork(idStr);
      setItems(prev => prev.filter(item => String(item.id) !== idStr));
      if (selectedItem && String(selectedItem.id) === idStr) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      console.error('Delete error', err);
      alert(err?.message || '封印失败');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      const updatedItem = await updateWork(selectedItem.id, {
        title: editTitle,
        description: editDesc,
        source_url: editSourceUrl,
      });
      setItems(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item));
      setSelectedItem(updatedItem);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update error', err);
      alert(err?.message || '刻录失败');
    }
  };

  const navigateItem = (direction: 'next' | 'prev') => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex(a => a.id === selectedItem.id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % items.length;
    } else {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    }
    setSelectedItem(items[nextIndex]);
  };

  const handleScrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-start');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative min-h-screen text-[#2C2C2C] selection:bg-[#8B1D24] selection:text-white cursor-auto md:cursor-none overflow-x-hidden font-sans">
      <CustomCursor />
      <FluidBackground />
      <SakuraRain />
      
      {/* Global Music Player */}
      <MusicPlayer />

      {/* Header - Fixed & Blurred (Light Theme) */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 bg-[#f2f0e9]/0 backdrop-blur-sm border-b border-transparent transition-all duration-300 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <TaiChiIcon />
          <motion.span 
            className="font-serif-cn text-lg md:text-xl text-[#2C2C2C] tracking-widest select-none font-bold"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            少女祈祷中......
          </motion.span>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
           <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-black/5">
             <div className={`w-2 h-2 rounded-full ${dbError ? 'bg-red-500' : 'bg-[#2C2C2C] animate-pulse'}`} />
             <span className="text-xs font-serif-cn text-[#2C2C2C] tracking-wider">{dbError ? '灵脉断绝' : '结界稳定'}</span>
           </div>
           <div className="text-xs font-serif-cn tracking-widest text-[#2C2C2C]/60 border-l border-black/10 pl-4 pr-4 font-bold">
            收录 {items.length.toString().padStart(2, '0')} 卷
          </div>
          {/* Auth status / actions */}
          <div className="flex items-center gap-3 pl-4 border-l border-black/10">
            {authLoading ? (
              <span className="text-[10px] font-serif-cn tracking-[0.2em] text-[#2C2C2C]/50">
                鉴定身份中...
              </span>
            ) : user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-serif-cn tracking-[0.2em] text-[#2C2C2C]/60">
                    已登入
                  </span>
                  <span className="text-[10px] font-mono text-[#2C2C2C]/80 max-w-[160px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-[10px] font-serif-cn tracking-[0.2em] px-3 py-1 rounded-full border border-[#2C2C2C]/20 hover:border-[#8B1D24] hover:text-[#8B1D24] bg-white/60 transition-colors"
                  data-hover="true"
                >
                  退出
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-[10px] font-serif-cn tracking-[0.25em] px-4 py-1.5 rounded-full border border-[#2C2C2C]/20 bg-white/70 hover:border-[#8B1D24] hover:text-[#8B1D24] transition-colors"
                data-hover="true"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full">
        
        {/* Full Screen Hero Section */}
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-4">
          
          {/* Ink Bleed Effect (洇染) - Sits behind the title */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[1000px] h-[30vh] md:h-[400px] bg-[#8B1D24]/5 blur-[60px] rounded-[40%] pointer-events-none mix-blend-multiply z-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              rotate: [-2, 3, -1, 2, -2],
              scale: [0.95, 1.05, 0.98, 1.02, 0.95] 
            }}
            transition={{ 
              opacity: { duration: 2 },
              rotate: { duration: 20, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* Main Title - Image */}
          <motion.img 
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://cdn.jsdelivr.net/gh/TUTIANQAQ/my-images@main/assets/new-source_bloom_high_1x.png"
            alt="东方幻世录"
            // Increased width by ~30% (md:w-[800px] -> md:w-[1100px])
            className="relative z-10 w-full md:w-[1100px] h-auto object-contain select-none pointer-events-none mix-blend-multiply drop-shadow-[0_0_15px_rgba(139,29,36,0.2)]"
          />
          
          {/* Scroll Indicator (Clickable) */}
          <motion.div
             className="absolute bottom-10 left-0 w-full flex flex-col items-center justify-center gap-2 cursor-pointer group z-20"
             onClick={handleScrollToGallery}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1, y: [0, 8, 0] }}
             transition={{ 
                opacity: { duration: 1, delay: 1 },
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
             }}
          >
            {/* 
              Optical Correction: 
              We use pl-[0.4em] to match tracking-[0.4em]. 
              This balances the whitespace: [Space][Text][Space] instead of [Text][Space].
              Ensures the text is visually centered relative to the chevron below.
            */}
            <span className="text-xs font-serif-cn text-[#2C2C2C]/60 tracking-[0.4em] uppercase group-hover:text-[#8B1D24] transition-colors duration-300 pl-[0.4em]">阅览</span>
            <ChevronDown className="w-5 h-5 text-[#2C2C2C]/60 group-hover:text-[#8B1D24] transition-colors duration-300" />
          </motion.div>

          {user && (
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
          )}
        </section>

        {/* Gallery Section - Starts below the fold */}
        <div 
          id="gallery-start" 
          className="px-4 md:px-12 max-w-[1800px] mx-auto pb-24 pt-12 md:pt-24 min-h-[60vh]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)'
          }}
        >
            {/* Error Message Display */}
            <AnimatePresence>
              {dbError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-12 max-w-2xl mx-auto overflow-hidden"
                >
                  <div className="p-4 border border-red-500/30 bg-red-50/50 backdrop-blur-sm rounded-xl flex items-start gap-4 text-red-700">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-serif-cn font-bold text-sm mb-1 tracking-wider">灵脉异常</h3>
                      <p className="text-xs font-serif-cn opacity-80 break-all">{dbError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <MediaCard 
                    key={String(item.id)} 
                    item={item} 
                    onClick={() => setSelectedItem(item)}
                    onDelete={(e) => handleDelete(e, item.id)}
                    canDelete={!!user}
                  />
                ))}
              </AnimatePresence>
              
              {/* Empty State */}
              {!dbError && items.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-40 border border-dashed border-[#2C2C2C]/20 rounded-3xl bg-white/30">
                  <div className="p-6 bg-white/50 rounded-full mb-6">
                    <ImageIcon className="w-10 h-10 text-[#2C2C2C]/40" />
                  </div>
                  <p className="font-serif-cn font-bold text-xl tracking-[0.2em] text-[#2C2C2C]/60">尚无卷轴收录</p>
                  <p className="font-serif-cn text-xs mt-3 text-[#2C2C2C]/40 tracking-wider">请奉纳幻想纪事</p>
                </div>
              )}
            </motion.div>

            {/* Elegant Footer - Moved inside container flow */}
            <footer className="w-full pt-12 pb-8 flex flex-col items-center justify-center relative z-40 pointer-events-none opacity-80 mix-blend-multiply">
              <div className="w-12 h-[1px] bg-[#2C2C2C]/40 mb-3" />
              <span className="font-serif-cn text-[10px] text-[#2C2C2C] tracking-[0.3em] font-bold uppercase">
                © 2026 TUTIAN / 东方幻世录
              </span>
            </footer>
        </div>
      </main>

      {/* Floating Upload Action Button (FAB) */}
      {user && (
        <motion.button
          initial={{ scale: 0, rotate: 90 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`
            z-50 w-16 h-16
            rounded-full bg-[#8B1D24] border-2 border-white/20 shadow-2xl shadow-[#8B1D24]/40
            text-white flex flex-col items-center justify-center gap-0.5
            transition-all duration-300 overflow-hidden group
            ${isUploading ? 'cursor-wait opacity-90' : 'cursor-pointer'}
            
            /* Mobile Positioning: Relative flow at bottom */
            relative mx-auto mt-12 mb-32
            
            /* Desktop Positioning: Fixed bottom right */
            md:fixed md:bottom-8 md:right-8 md:m-0
          `}
          data-hover="true"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6D161C] to-[#8B1D24] z-0" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            {isUploading ? (
               <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                 <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
                 <span className="text-[9px] font-serif-cn font-bold tracking-widest opacity-0 group-hover:opacity-100 absolute bottom-[-14px] group-hover:bottom-[-8px] transition-all duration-300 whitespace-nowrap">奉纳</span>
              </>
            )}
          </div>
        </motion.button>
      )}

      {/* Detail Modal - Light Theme */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-[#f2f0e9]/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-full md:h-[85vh] bg-[#fdfdfd] border border-gray-200 rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/60 backdrop-blur-md text-[#2C2C2C]/60 hover:bg-[#8B1D24] hover:text-white transition-all border border-gray-200"
                data-hover="true"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Nav Buttons */}
              {!isEditing && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateItem('prev'); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/60 backdrop-blur-md hover:bg-[#8B1D24] hover:text-white transition-colors border border-gray-200 hidden md:block group text-[#2C2C2C]/60"
                    data-hover="true"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateItem('next'); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/60 backdrop-blur-md hover:bg-[#8B1D24] hover:text-white transition-colors border border-gray-200 hidden md:block group text-[#2C2C2C]/60"
                    data-hover="true"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Media Display (Top Hero) */}
              <div className="w-full bg-[#0f0f12] relative overflow-hidden flex-none h-[42vh] md:h-[55vh] max-h-[620px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                {selectedItem.type === 'video' ? (
                  <video 
                    src={selectedItem.url} 
                    className="w-full h-full object-cover"
                    controls 
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0">
                    <AnimatePresence initial={false} mode="sync">
                      <motion.img
                        key={String(selectedItem.id ?? selectedItem.url)}
                        initial={{ opacity: 0, scale: 0.985 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.01 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        src={selectedItem.url}
                        alt={selectedItem.title}
                        className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                        onClick={() => setIsImageZoomed(true)}
                        draggable={false}
                      />
                    </AnimatePresence>
                  </div>
                )}

                {/* Image Zoom Overlay (viewport-level) */}
                <AnimatePresence>
                  {selectedItem.type !== 'video' && isImageZoomed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[90] bg-[#0b0b0b]/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
                      onClick={() => setIsImageZoomed(false)}
                    >
                      <motion.img
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        src={selectedItem.url}
                        alt={selectedItem.title}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info Section */}
              <div className="w-full flex flex-col bg-white border-t border-gray-100">
                <div className="p-7 md:p-12 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    
                    <div className="flex items-center gap-3 text-[#8B1D24] mb-7 opacity-80">
                       {selectedItem.type === 'video' ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                       <span className="font-serif-cn font-bold text-xs tracking-[0.2em]">
                         {new Date(selectedItem.timestamp).toLocaleDateString()} / 番号：{String(selectedItem.id ?? '').slice(-4)}
                       </span>
                    </div>
                    
                    {/* Title Section */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-[#2C2C2C]/10 text-3xl md:text-4xl font-serif-cn font-bold leading-tight mb-7 text-[#2C2C2C] focus:outline-none focus:border-[#8B1D24] placeholder-gray-300 tracking-[0.12em] py-2"
                        placeholder="题名..."
                        autoFocus
                      />
                    ) : (
                      <h2 className="text-3xl md:text-4xl font-serif-cn font-bold leading-tight mb-7 text-[#2C2C2C] break-words tracking-[0.12em]">
                        {selectedItem.title}
                      </h2>
                    )}
                    
                    {/* Description Section */}
                    <div className="flex-grow">
                        {isEditing ? (
                           <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-[#2C2C2C] font-serif-cn text-base leading-relaxed focus:outline-none focus:border-[#8B1D24] focus:bg-white resize-none h-48 transition-all"
                            placeholder="撰写纪事..."
                           />
                        ) : (
                          <div className="text-[#2C2C2C]/80 leading-relaxed text-base md:text-[17px] font-serif-cn font-medium pl-5 pr-1 border-l-2 border-[#8B1D24]/20">
                            {selectedItem.description}
                          </div>
                        )}
                    </div>

                    {/* Source URL Section */}
                    <div className="mt-8 mb-8">
                        {isEditing ? (
                          <div className="group">
                             <label className="block text-[10px] font-serif-cn text-[#2C2C2C]/40 mb-2 uppercase tracking-wider group-focus-within:text-[#8B1D24]">来源链接</label>
                             <div className="flex items-center gap-2 border-b border-gray-200 group-focus-within:border-[#8B1D24] transition-colors pb-2">
                               <ExternalLink className="w-3 h-3 text-[#2C2C2C]/40 group-focus-within:text-[#8B1D24]" />
                               <input
                                type="url"
                                value={editSourceUrl}
                                onChange={(e) => setEditSourceUrl(e.target.value)}
                                className="w-full bg-transparent text-xs font-mono text-[#2C2C2C] focus:outline-none placeholder-gray-300"
                                placeholder="https://..."
                               />
                             </div>
                          </div>
                        ) : (
                          selectedItem.sourceUrl && (
                            <a 
                              href={selectedItem.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-serif-cn font-bold text-[#8B1D24] hover:text-white border border-[#8B1D24]/30 hover:border-[#8B1D24] hover:bg-[#8B1D24] rounded-full px-5 py-2.5 transition-all group w-max tracking-widest"
                              data-hover="true"
                            >
                              <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                              溯源寻踪
                            </a>
                          )
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4">
                      {isEditing && user ? (
                        <div className="flex gap-3 w-full">
                           <button 
                            onClick={handleSaveEdit}
                            className="flex-1 py-4 bg-[#8B1D24] hover:bg-[#6D161C] text-white font-serif-cn font-bold text-sm tracking-[0.2em] flex items-center justify-center gap-2 rounded-lg transition-colors"
                            data-hover="true"
                          >
                            <Check className="w-4 h-4" /> 刻录
                          </button>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-[#2C2C2C] font-serif-cn font-bold text-sm tracking-[0.2em] flex items-center justify-center gap-2 rounded-lg transition-colors"
                            data-hover="true"
                          >
                            <X className="w-4 h-4" /> 作罢
                          </button>
                        </div>
                      ) : user ? (
                        <div className="flex w-full justify-between items-center">
                           <button 
                            onClick={() => setIsEditing(true)}
                            className="text-[#2C2C2C]/40 hover:text-[#2C2C2C] text-xs font-serif-cn font-bold tracking-widest flex items-center gap-2 transition-colors px-2 py-1"
                            data-hover="true"
                          >
                            <Edit2 className="w-3 h-3" /> 修订记录
                          </button>
                          
                          <button 
                            onClick={(e) => handleDelete(e, selectedItem.id)}
                            className="text-red-300 hover:text-red-600 text-xs font-serif-cn font-bold tracking-widest flex items-center gap-2 transition-colors px-2 py-1"
                            data-hover="true"
                          >
                            <Trash2 className="w-3 h-3" /> 封印异变
                          </button>
                        </div>
                      ) : null}
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth modal */}
      <Auth open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default App;
