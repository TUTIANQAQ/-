/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 作品 CRUD 与 Supabase Storage 上传封装，与前端 MediaItem / works 表联通。
 */

import { supabase } from './supabase';
import type { MediaItem } from '../types';

const BUCKET_WORKS = 'works';

/** 数据库 works 表行（与 Supabase 一致） */
export interface WorkRow {
  // 旧数据里 id 可能是数字，这里兼容 string | number，统一在映射时转成字符串
  id: string | number;
  type: 'image' | 'video';
  image_url: string;
  title: string;
  description: string;
  source_url: string | null;
  created_at: string;
}

function rowToMediaItem(row: WorkRow): MediaItem {
  return {
    id: String(row.id),
    type: row.type,
    url: row.image_url,
    title: row.title || '无题',
    description: row.description || '暂无描述',
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    sourceUrl: row.source_url || undefined,
  };
}

/**
 * 上传文件到 Supabase Storage，返回公开访问 URL。
 * 需在 Supabase Dashboard 创建名为 works 的 public bucket。
 */
export async function uploadWorkFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'jpg');
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_WORKS)
    .upload(path, file, { upsert: false });

  if (error) throw new Error(`上传失败: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET_WORKS).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * 拉取作品列表（按创建时间倒序）
 */
export async function fetchWorks(): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`加载失败: ${error.message}`);
  return (data || []).map((row: WorkRow) => rowToMediaItem(row));
}

/**
 * 新增作品（仅写库，不传文件；上传由 uploadWorkFile + createWork 组合完成）
 */
export async function createWork(params: {
  type: 'image' | 'video';
  image_url: string;
  title: string;
  description: string;
  source_url?: string;
}): Promise<MediaItem> {
  const { data, error } = await supabase
    .from('works')
    .insert({
      type: params.type,
      image_url: params.image_url,
      title: params.title,
      description: params.description,
      source_url: params.source_url || null,
    })
    .select()
    .single();

  if (error) throw new Error(`创建失败: ${error.message}`);
  return rowToMediaItem(data as WorkRow);
}

/**
 * 更新作品（标题、描述、来源链接）
 */
export async function updateWork(
  id: string,
  updates: { title?: string; description?: string; source_url?: string }
): Promise<MediaItem> {
  const { data, error } = await supabase
    .from('works')
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.source_url !== undefined && { source_url: updates.source_url }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`更新失败: ${error.message}`);
  return rowToMediaItem(data as WorkRow);
}

/**
 * 删除作品（仅删数据库记录；Storage 中的文件可后续在 Dashboard 清理或通过 Storage API 按 URL 删）
 */
export async function deleteWork(id: string): Promise<void> {
  const { error } = await supabase.from('works').delete().eq('id', id);
  if (error) throw new Error(`删除失败: ${error.message}`);
}
