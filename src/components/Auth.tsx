/**
 * 登录 / 注册 UI（东方幻世录风格）
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  open: boolean;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ open, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b0b0b]/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md mx-4 rounded-3xl border border-[#2C2C2C]/10 bg-[#fdfaf4]/95 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部墨迹 */}
            <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(circle_at_top,_rgba(139,29,36,0.18),transparent_60%)] pointer-events-none" />

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 border border-[#2C2C2C]/10 text-[#2C2C2C]/60 hover:bg-[#8B1D24] hover:text-white transition-colors"
              data-hover="true"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-8 pt-10 pb-8">
              {/* 标题 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-[#8B1D24] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-serif-cn tracking-[0.3em] text-[#8B1D24]/70 uppercase">
                    访客识别
                  </p>
                  <h2 className="mt-1 text-xl font-serif-cn font-bold tracking-[0.15em] text-[#2C2C2C]">
                    {mode === 'login' ? '登入幻想结界' : '刻录来访卷宗'}
                  </h2>
                </div>
              </div>

              {/* 切换标签 */}
              <div className="flex mb-6 rounded-full bg-[#f5efe4] p-1 border border-[#2C2C2C]/5">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-xs font-serif-cn tracking-[0.2em] rounded-full transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#8B1D24] shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                      : 'text-[#2C2C2C]/50'
                  }`}
                  data-hover="true"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 text-xs font-serif-cn tracking-[0.2em] rounded-full transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-[#8B1D24] shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
                      : 'text-[#2C2C2C]/50'
                  }`}
                  data-hover="true"
                >
                  注册
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-serif-cn tracking-[0.2em] text-[#2C2C2C]/60 mb-2">
                    <Mail className="w-3 h-3" />
                    邮箱
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#2C2C2C]/15 bg-white/80 focus-within:border-[#8B1D24] focus-within:bg-white transition-colors">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/30 focus:outline-none font-sans"
                      placeholder="your@scarlet.dev"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[11px] font-serif-cn tracking-[0.2em] text-[#2C2C2C]/60 mb-2">
                    <Lock className="w-3 h-3" />
                    密码
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#2C2C2C]/15 bg-white/80 focus-within:border-[#8B1D24] focus-within:bg-white transition-colors">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/30 focus:outline-none font-sans"
                      placeholder="至少 6 位字符"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-[11px] font-serif-cn text-red-600 bg-red-50/80 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#8B1D24] hover:bg-[#6D161C] text-white text-xs font-serif-cn tracking-[0.25em] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  data-hover="true"
                >
                  {loading ? '灵力接续中……' : mode === 'login' ? '踏入幻想乡' : '刻录来访信息'}
                </button>

                {mode === 'login' && (
                  <p className="mt-2 text-[10px] text-[#2C2C2C]/40 font-serif-cn text-center">
                    已在后台关闭邮箱确认，可使用任意有效邮箱完成快速登录。
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Auth;

