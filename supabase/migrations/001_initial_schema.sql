-- ============================================
-- 东方幻世录 · Supabase 数据库初始化
-- 表: works (作品集), music (背景音乐)
-- ============================================

-- 作品表：与前端 MediaItem 对应
CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '无题',
  description TEXT NOT NULL DEFAULT '暂无描述',
  source_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 音乐表：与前端 MusicTrack 对应
CREATE TABLE IF NOT EXISTS public.music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_works_created_at ON public.works (created_at DESC);

-- 启用 RLS (Row Level Security)
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

-- works: 允许匿名读、写（可根据需要改为仅认证用户）
CREATE POLICY "works_select_all" ON public.works FOR SELECT USING (true);
CREATE POLICY "works_insert_all" ON public.works FOR INSERT WITH CHECK (true);
CREATE POLICY "works_update_all" ON public.works FOR UPDATE USING (true);
CREATE POLICY "works_delete_all" ON public.works FOR DELETE USING (true);

-- music: 仅读（后台维护曲目）
CREATE POLICY "music_select_all" ON public.music FOR SELECT USING (true);
CREATE POLICY "music_insert_all" ON public.music FOR INSERT WITH CHECK (true);
CREATE POLICY "music_update_all" ON public.music FOR UPDATE USING (true);
CREATE POLICY "music_delete_all" ON public.music FOR DELETE USING (true);

-- 可选：仅在 music 表为空时插入默认曲目（前端无数据时会用 FALLBACK_TRACKS）
INSERT INTO public.music (title, artist, url)
SELECT v.title, v.artist, v.url
FROM (VALUES
  ('Sakura Dreams', 'Traditional', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=japanese-background-music-112361.mp3'),
  ('Zen Garden', 'Meditation', 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=main-c-10023.mp3')
) AS v(title, artist, url)
WHERE NOT EXISTS (SELECT 1 FROM public.music LIMIT 1);

COMMENT ON TABLE public.works IS '画廊作品（图片/视频）';
COMMENT ON TABLE public.music IS '背景音乐列表';
