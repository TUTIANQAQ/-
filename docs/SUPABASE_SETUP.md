# Supabase 配置说明（前后端一体）

本项目使用 **Supabase** 作为后端：数据库存作品与音乐，Storage 存上传的图片/视频。前端通过 `@supabase/supabase-js` 直连，无需自建服务器。

## 1. 创建项目与密钥

1. 打开 [Supabase](https://supabase.com) 并登录。
2. 新建项目（或使用已有项目），记下 **Project URL** 和 **anon public** Key（Settings → API）。

## 2. 执行数据库迁移

在 Supabase 控制台：**SQL Editor** → 新建查询，粘贴并执行：

- 文件内容：`supabase/migrations/001_initial_schema.sql`

执行后将创建：

- **`public.works`**：作品表（id, type, image_url, title, description, source_url, created_at）
- **`public.music`**：音乐表（id, title, artist, url）
- 相应 RLS 策略（当前为允许匿名读写，可按需收紧）

## 3. 创建 Storage 桶（上传图片/视频）

1. 在 Supabase 控制台打开 **Storage**。
2. 点击 **New bucket**，名称填：**`works`**。
3. 勾选 **Public bucket**（前端需要公开 URL 展示图片/视频）。
4. 创建后进入该桶 → **Policies** → 添加策略，允许匿名上传与读取，例如：

   - **Allow uploads**：Policy name 随意，Allowed operation = `INSERT`，Target roles = `public` 或 `anon`，WITH CHECK 可留空或 `true`。
   - **Allow public read**：Public 桶一般默认可读；若非公开，需添加 SELECT 策略。

这样前端的「奉纳」上传才会成功写入 Storage 并得到 `image_url`。

## 4. 环境变量

在项目根目录创建 `.env.local`（或使用 `.env`），参考 `.env.example`：

```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_KEY=你的 anon key
GEMINI_API_KEY=你的 Gemini API Key   # 可选，用于图片 AI 描述
```

重启 `npm run dev` 后，前端会使用上述配置连接 Supabase。

## 5. 前后端联通一览

| 功能         | 前端调用                         | 后端/存储                    |
|--------------|----------------------------------|------------------------------|
| 作品列表     | `fetchWorks()`                   | Supabase 表 `works`          |
| 奉纳（上传） | `uploadWorkFile()` + `createWork()` | Storage 桶 `works` + 表 `works` |
| 修订记录     | `updateWork(id, {...})`         | 表 `works` UPDATE            |
| 封印异变     | `deleteWork(id)`                 | 表 `works` DELETE            |
| 背景音乐     | `supabase.from('music').select()` | 表 `music`                   |

数据全部落在 Supabase，无需额外后端服务即可实现前后端一体。
