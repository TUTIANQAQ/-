<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1krxxiWgKQwhGgoZWR4SCQLK5eY_G5Y4h

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. 配置环境变量（复制 `.env.example` 为 `.env.local`）：
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`：Supabase 项目 URL 与 anon key（必填，用于作品与音乐数据）
   - `GEMINI_API_KEY`：Gemini API key（可选，用于上传图片时的 AI 标题/描述）
3. 按 [Supabase 配置说明](docs/SUPABASE_SETUP.md) 执行数据库迁移并创建 Storage 桶 `works`
4. Run the app: `npm run dev`

## 前后端一体说明

- **后端**：使用 Supabase（PostgreSQL + Storage），无自建服务器。
- **数据**：作品表 `works`、音乐表 `music`；上传文件存于 Storage 桶 `works`。
- **前端**：通过 `services/worksService.ts` 与 `services/supabase.ts` 直连 Supabase，实现列表、上传、编辑、删除的持久化。
