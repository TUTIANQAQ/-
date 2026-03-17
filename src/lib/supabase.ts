/**
 * 统一导出的 Supabase 客户端（供 AuthContext / 组件使用）
 * 实际客户端仍由根目录 services/supabase.ts 创建。
 */

import { supabase as baseClient } from '../../services/supabase';

export const supabase = baseClient;

export type SupabaseClient = typeof supabase;

