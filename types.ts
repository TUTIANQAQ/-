
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  timestamp: number;
  sourceUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export enum Section {
  HERO = 'hero',
  GALLERY = 'gallery',
}
