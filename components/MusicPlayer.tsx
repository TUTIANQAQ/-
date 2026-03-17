
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic, Music as MusicIcon, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { MusicTrack } from '../types';

// Fallback tracks in case Supabase table is empty or missing
// Using royalty-free eastern/ambient styled tracks
const FALLBACK_TRACKS: MusicTrack[] = [
  {
    id: 'default-1',
    title: 'Sakura Dreams',
    artist: 'Traditional',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=japanese-background-music-112361.mp3'
  },
  {
    id: 'default-2',
    title: 'Zen Garden',
    artist: 'Meditation',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=main-c-10023.mp3'
  }
];

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch Tracks
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('music').select('*');
        
        if (error || !data || data.length === 0) {
          // Fallback if no table or empty
          console.log("Using fallback music tracks.");
          setTracks(FALLBACK_TRACKS);
        } else {
          setTracks(data);
        }
      } catch (e) {
        console.error("Music fetch error:", e);
        setTracks(FALLBACK_TRACKS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusic();
  }, []);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [tracks, currentTrackIndex]); // Re-bind if track changes

  // Sync Play/Pause with Ref
  useEffect(() => {
    if (tracks.length === 0) return;
    
    if (isPlaying) {
      audioRef.current?.play().catch(e => {
        console.warn("Autoplay blocked or playback failed:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex, tracks]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handlers
  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    // Don't auto-play if it was paused, unless we want continuous playback logic
    // Usually user expects next song to play immediately
    setIsPlaying(true); 
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrack = tracks[currentTrackIndex];

  if (tracks.length === 0 && isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed bottom-4 left-4 z-[55] flex flex-col items-start gap-2"
    >
      <audio ref={audioRef} src={currentTrack?.url} preload="metadata" />

      {/* Expanded Playlist (Scroll style) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 12 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="w-72 bg-[#fdfdfd]/90 backdrop-blur-xl border border-[#2C2C2C]/10 rounded-xl overflow-hidden shadow-2xl shadow-[#8B1D24]/10"
          >
            {/* Header */}
            <div className="bg-[#8B1D24]/5 p-3 flex justify-between items-center border-b border-[#8B1D24]/10">
              <span className="text-xs font-serif-cn font-bold text-[#8B1D24] tracking-widest">雅乐集 · PLAYLIST</span>
              <button onClick={() => setIsExpanded(false)} className="p-1 rounded-full hover:bg-[#8B1D24]/10 transition-colors">
                <ChevronDown className="w-4 h-4 text-[#2C2C2C]/50 hover:text-[#8B1D24]" />
              </button>
            </div>
            
            {/* List */}
            <div className="max-h-48 overflow-y-auto custom-scrollbar p-2">
              {tracks.map((track, idx) => (
                <motion.div
                  key={track.id}
                  whileHover={{ backgroundColor: 'rgba(139, 29, 36, 0.05)' }}
                  onClick={() => handleTrackSelect(idx)}
                  className={`p-2 rounded-lg flex items-center justify-between cursor-pointer group transition-colors ${idx === currentTrackIndex ? 'bg-[#8B1D24]/10' : ''}`}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-xs font-bold truncate ${idx === currentTrackIndex ? 'text-[#8B1D24]' : 'text-[#2C2C2C]'}`}>
                      {track.title}
                    </span>
                    <span className="text-[10px] text-[#2C2C2C]/50 truncate">{track.artist}</span>
                  </div>
                  {idx === currentTrackIndex && isPlaying && (
                     <div className="flex gap-0.5 items-end h-3">
                       <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-[#8B1D24]" />
                       <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-0.5 bg-[#8B1D24]" />
                       <motion.div animate={{ height: [6, 10, 5] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-0.5 bg-[#8B1D24]" />
                     </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player Bar */}
      <motion.div 
        className="relative bg-white/60 backdrop-blur-xl border border-[#2C2C2C]/10 rounded-full p-2 pr-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-shadow group"
        whileHover={{ scale: 1.02 }}
      >
        {/* Album Art / Rotate Icon */}
        <div 
          className="relative w-10 h-10 shrink-0 rounded-full bg-[#2C2C2C] flex items-center justify-center overflow-hidden border-2 border-[#f2f0e9] shadow-md cursor-pointer hover:border-[#8B1D24]/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-full h-full absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:4px_4px]"
          />
           {isPlaying ? (
             <MusicIcon className="w-4 h-4 text-[#f2f0e9]" />
           ) : (
             <ListMusic className="w-4 h-4 text-[#f2f0e9]" />
           )}
        </div>

        {/* Info & Controls */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          {/* Top Row: Title & Time */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[10px] font-serif-cn font-bold text-[#2C2C2C] truncate max-w-[100px] tracking-wider leading-none">
                 {currentTrack?.title || '加载中...'}
               </span>
               <span className="text-[9px] text-[#2C2C2C]/50 truncate max-w-[100px] leading-none mt-1">
                 {currentTrack?.artist}
               </span>
            </div>
            
            {/* Controls - Increased hit areas with w-6 h-6 containers */}
            <div className="flex items-center gap-1">
               <button onClick={handlePrev} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#2C2C2C]/5 text-[#2C2C2C]/60 hover:text-[#8B1D24] transition-colors">
                 <SkipBack className="w-3 h-3" />
               </button>
               
               <button 
                onClick={togglePlay} 
                className="w-7 h-7 rounded-full bg-[#8B1D24] flex items-center justify-center text-white hover:bg-[#6D161C] transition-colors shadow-sm"
               >
                 {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
               </button>

               <button onClick={handleNext} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#2C2C2C]/5 text-[#2C2C2C]/60 hover:text-[#8B1D24] transition-colors">
                 <SkipForward className="w-3 h-3" />
               </button>
            </div>
          </div>

          {/* Progress Bar - Thin Red Line */}
          <div className="flex items-center gap-2 w-full mt-1 group/progress">
            <span className="text-[8px] font-mono text-[#2C2C2C]/40 min-w-[20px]">{formatTime(currentTime)}</span>
            
            <div className="relative flex-1 h-2 flex items-center cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <div className="w-full h-[1px] bg-[#2C2C2C]/10 rounded-full overflow-hidden pointer-events-none">
                <motion.div 
                  className="h-full bg-[#8B1D24]" 
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  layoutId="progress"
                />
              </div>
              {/* Thumb (Visual Only) */}
              <motion.div 
                className="absolute w-2 h-2 bg-[#8B1D24] rounded-full pointer-events-none opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-sm"
                style={{ left: `${(currentTime / (duration || 1)) * 100}%`, x: '-50%' }}
              />
            </div>
            
            <span className="text-[8px] font-mono text-[#2C2C2C]/40 min-w-[20px] text-right">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume - Robust interaction area */}
        <div className="relative flex items-center justify-center ml-2 group/vol w-8 h-8">
           <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="w-full h-full flex items-center justify-center rounded-full hover:bg-[#2C2C2C]/5 text-[#2C2C2C]/40 hover:text-[#8B1D24] transition-colors"
           >
             {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
           </button>
           
           {/* Invisible bridge to prevent mouse gap issues */}
           <div className="absolute bottom-full left-0 w-full h-4 bg-transparent group-hover/vol:block hidden" />

           {/* Volume Slider Popup */}
           <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-8 h-24 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg flex justify-center items-end pb-3 pt-3 opacity-0 translate-y-2 group-hover/vol:translate-y-0 group-hover/vol:opacity-100 transition-all duration-200 pointer-events-none group-hover/vol:pointer-events-auto shadow-lg">
             <div className="relative w-full h-full flex justify-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-8 bg-transparent appearance-none -rotate-90 origin-center cursor-pointer 
                  [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-[#2C2C2C]/10 [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8B1D24] [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:shadow-sm"
                />
             </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MusicPlayer;
