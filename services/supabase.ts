
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { createClient } from '@supabase/supabase-js';

// 为了确保在各种环境（包括无法正确加载 .env 文件的预览环境）中都能正常运行，
// 我们定义了硬编码的默认值（来自您提供的 .env.local）。
const DEFAULT_SUPABASE_URL = "https://plkwtvggumgfjlbjldsx.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_fxXQt370nXo1Lj1l3jiQJw_8A42ya-q";

let supabaseUrl = DEFAULT_SUPABASE_URL;
let supabaseKey = DEFAULT_SUPABASE_KEY;

// 尝试从环境变量覆盖默认值 (如果可用)
try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    const envKey = import.meta.env.VITE_SUPABASE_KEY;

    if (envUrl) supabaseUrl = envUrl;
    if (envKey) supabaseKey = envKey;
  }
} catch (e) {
  // 忽略访问 import.meta.env 时的错误，继续使用默认值
  console.debug('Environment variable access check failed, using defaults.', e);
}

// 再次检查 (理论上不应该触发，因为有默认值)
if (!supabaseUrl || !supabaseKey) {
  console.error("严重错误: Supabase 配置缺失且无默认值。");
}

console.log(`Supabase Client Initialized: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseKey);
