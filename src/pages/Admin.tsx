import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Shield, XCircle } from 'lucide-react';
import FluidBackground from '../../components/FluidBackground';
import CustomCursor from '../../components/CustomCursor';
import SakuraRain from '../../components/SakuraRain';
import TaiChiIcon from '../../components/TaiChiIcon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ProfileRow = {
  id: string;
  email: string | null;
  role: string | null;
  can_upload: boolean | null;
};

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
};

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-6 right-6 z-[120] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: easing }}
            className="pointer-events-auto w-[320px] rounded-2xl border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden"
          >
            <div className="p-4 flex items-start gap-3">
              <div className="mt-0.5">
                {t.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : t.type === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-700" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-serif-cn font-bold tracking-[0.2em] text-[#2C2C2C]">
                  {t.title}
                </div>
                {t.message && (
                  <div className="mt-1 text-[11px] text-[#2C2C2C]/70 leading-relaxed break-words">
                    {t.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 rounded-full px-2 py-1 text-[10px] font-serif-cn tracking-[0.2em] text-[#2C2C2C]/60 hover:text-[#8b2323] transition-colors"
                data-hover="true"
              >
                关闭
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Switch({
  checked,
  disabled,
  loading,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled || loading}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
        checked
          ? 'bg-[#8b2323] border-white/30'
          : 'bg-white/35 border-white/25'
      } ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      data-hover="true"
      aria-pressed={checked}
    >
      <motion.span
        layout
        transition={{ duration: 0.22, ease: easing }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
        style={{ x: checked ? 20 : 2 }}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 text-[#8b2323] animate-spin" />}
      </motion.span>
    </button>
  );
}

const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [meRole, setMeRole] = useState<string | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isAdmin = useMemo(() => meRole === 'admin', [meRole]);

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  // 获取当前用户 role（用于守卫）
  useEffect(() => {
    const run = async () => {
      if (!user) {
        setMeRole(null);
        setMeLoading(false);
        return;
      }
      setMeLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setMeRole((data as any)?.role ?? null);
      } catch (e: any) {
        setMeRole(null);
        pushToast({
          type: 'error',
          title: '无法读取身份卷宗',
          message: e?.message || '请检查 profiles 表权限策略',
        });
      } finally {
        setMeLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 拉取所有 profiles（仅管理员）
  useEffect(() => {
    const run = async () => {
      if (!user || !isAdmin) return;
      setListLoading(true);
      setListError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id,email,role,can_upload')
          .order('email', { ascending: true });

        if (error) throw error;
        setProfiles((data as ProfileRow[]) || []);
      } catch (e: any) {
        setListError(e?.message || '无法加载 profiles');
      } finally {
        setListLoading(false);
      }
    };
    run();
  }, [user, isAdmin]);

  const guardBlocked = !authLoading && !meLoading && (!user || !isAdmin);

  const handleToggleUpload = async (profile: ProfileRow, next: boolean) => {
    const id = profile.id;
    setBusyIds((prev) => ({ ...prev, [id]: true }));
    const prevValue = !!profile.can_upload;

    // optimistic
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, can_upload: next } : p))
    );

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ can_upload: next })
        .eq('id', id);
      if (error) throw error;

      pushToast({
        type: 'success',
        title: '结界已更新',
        message: `${profile.email || id} · ${next ? '允许奉纳' : '禁止奉纳'}`,
      });
    } catch (e: any) {
      // rollback
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, can_upload: prevValue } : p))
      );
      pushToast({
        type: 'error',
        title: '刻录失败',
        message: e?.message || '更新 can_upload 失败',
      });
    } finally {
      setBusyIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="relative min-h-screen text-[#2C2C2C] selection:bg-[#8B1D24] selection:text-white cursor-auto md:cursor-none overflow-x-hidden font-sans">
      <CustomCursor />
      <FluidBackground />
      <SakuraRain />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* 顶部栏 */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 bg-[#f2f0e9]/0 backdrop-blur-sm border-b border-transparent transition-all duration-300 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <TaiChiIcon />
          <motion.span
            className="font-serif-cn text-lg md:text-xl text-[#2C2C2C] tracking-widest select-none font-bold"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            管理结界
          </motion.span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-black/5">
            <Shield className="w-3.5 h-3.5 text-[#8b2323]" />
            <span className="text-xs font-serif-cn text-[#2C2C2C] tracking-wider">
              {authLoading || meLoading ? '鉴定中' : isAdmin ? '管理员' : '访客'}
            </span>
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/35 backdrop-blur-md text-xs font-serif-cn font-bold tracking-[0.2em] hover:bg-white/45 transition-colors"
            data-hover="true"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回主页
            </span>
          </button>
        </div>
      </nav>

      <main className="w-full px-4 md:px-12 pt-28 pb-24 max-w-[1200px] mx-auto">
        {/* Guard */}
        {guardBlocked ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/35 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.12)] p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#8b2323]/10 border border-[#8b2323]/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-[#8b2323]" />
              </div>
              <h1 className="text-xl md:text-2xl font-serif-cn font-bold tracking-[0.2em] text-[#2C2C2C]">
                灵力不足，结界拒绝了你的访问（仅限管理员）
              </h1>
              <p className="mt-4 text-sm text-[#2C2C2C]/60 leading-relaxed">
                请使用管理员账号登录，或返回主页继续阅览。
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-6 py-3 rounded-full bg-[#8b2323] text-white text-xs font-serif-cn font-bold tracking-[0.25em] hover:bg-[#6D161C] transition-colors"
                  data-hover="true"
                >
                  返回主页
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/20 bg-white/35 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="p-6 md:p-10 border-b border-white/15">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-serif-cn tracking-[0.35em] uppercase text-[#8b2323]/70">
                    PROFILES · USERS
                  </p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-serif-cn font-bold tracking-[0.18em] text-[#2C2C2C]">
                    用户卷宗
                  </h2>
                  <p className="mt-3 text-sm text-[#2C2C2C]/60 leading-relaxed max-w-2xl">
                    在此调整每位访客的“奉纳权限”（can_upload）。切换将实时写入 Supabase。
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-serif-cn tracking-[0.25em] text-[#2C2C2C]/50">
                    记录数
                  </div>
                  <div className="mt-1 text-lg font-mono text-[#2C2C2C]/80">
                    {(listLoading ? '··' : profiles.length.toString().padStart(2, '0'))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 md:p-5">
              {listError && (
                <div className="mb-4 rounded-2xl border border-red-200/60 bg-red-50/50 backdrop-blur-md p-4 text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-serif-cn font-bold tracking-[0.15em]">加载失败</div>
                      <div className="mt-1 text-[12px] opacity-80 break-all">{listError}</div>
                    </div>
                  </div>
                </div>
              )}

              {listLoading ? (
                <div className="py-20 flex items-center justify-center text-[#2C2C2C]/60">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  <span className="text-xs font-serif-cn tracking-[0.2em]">读取卷宗中……</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((p) => {
                    const checked = !!p.can_upload;
                    const role = p.role || 'user';
                    const busy = !!busyIds[p.id];
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur-md px-5 md:px-6 py-4 flex items-center justify-between gap-5 hover:bg-white/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-serif-cn tracking-[0.35em] uppercase text-[#2C2C2C]/45">
                            Email
                          </div>
                          <div className="mt-1 text-sm md:text-base text-[#2C2C2C] font-mono truncate">
                            {p.email || '(未知邮箱)'}
                          </div>
                          <div className="mt-2 inline-flex items-center gap-2">
                            <span className="text-[10px] font-serif-cn tracking-[0.25em] text-[#2C2C2C]/45">
                              Role
                            </span>
                            <span
                              className={`text-[10px] font-serif-cn tracking-[0.25em] px-2.5 py-1 rounded-full border ${
                                role === 'admin'
                                  ? 'border-[#8b2323]/25 bg-[#8b2323]/10 text-[#8b2323]'
                                  : 'border-white/20 bg-white/20 text-[#2C2C2C]/70'
                              }`}
                            >
                              {role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-serif-cn tracking-[0.25em] text-[#2C2C2C]/45">
                              can_upload
                            </span>
                            <span className={`text-[10px] font-serif-cn tracking-[0.25em] ${checked ? 'text-[#8b2323]' : 'text-[#2C2C2C]/60'}`}>
                              {checked ? '允许奉纳' : '禁止奉纳'}
                            </span>
                          </div>
                          <Switch
                            checked={checked}
                            loading={busy}
                            onChange={(next) => handleToggleUpload(p, next)}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {profiles.length === 0 && !listError && (
                    <div className="py-20 text-center text-[#2C2C2C]/55">
                      <div className="text-xs font-serif-cn tracking-[0.25em]">尚无卷宗</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

