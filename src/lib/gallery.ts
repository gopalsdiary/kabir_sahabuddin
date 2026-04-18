import { supabase } from './supabase';

export interface Photo {
  id: string;
  image_url: string;
  thumbnail_url: string;
  image_iid: string;
  section: string;
  categoryName: string;
  category: string;
  weight: number;
  clicks: number;
  title: string;
  description: string;
  created_at: string;
}

export const SECTION_CONFIG: Record<string, { name: string; category: string; weight: number }> = {
  'bangla_quotes_1':   { name: 'Bengla Quotes 1',   category: 'bangla',      weight: 1 },
  'bangla_quotes_2':   { name: 'Bengla Quotes 2',   category: 'bangla',      weight: 1 },
  'bangla_quotes_3':   { name: 'Bengla Quotes 3',   category: 'bangla',      weight: 1 },
  'bangla_quotes_4':   { name: 'Bengla Quotes 4',   category: 'bangla',      weight: 1 },
  'photography_1':     { name: 'Photography 1',     category: 'photography', weight: 1.5 },
  'photography_2':     { name: 'Photography 2',     category: 'photography', weight: 1.5 },
  'photography_3':     { name: 'Photography 3',     category: 'photography', weight: 1.5 },
  'photography_4':     { name: 'Photography 4',     category: 'photography', weight: 1.5 },
  'illustration_1':    { name: 'Illustration 1',    category: 'illustrations', weight: 1.2 },
  'illustration_2':    { name: 'Illustration 2',    category: 'illustrations', weight: 1.2 },
  'english_quote_1':   { name: 'English Quotes 1',  category: 'english',     weight: 1 },
  'english_quote_2':   { name: 'English Quotes 2',  category: 'english',     weight: 1 },
  'story_1':           { name: 'Story 1',           category: 'stories',     weight: 1.3 },
  'story_2':           { name: 'Story 2',           category: 'stories',     weight: 1.3 },
  'story_3':           { name: 'Story 3',           category: 'stories',     weight: 1.3 },
  'others':            { name: 'Others',            category: 'others',      weight: 0.8 }
};

export class ImageOptimizer {
  static getOptimizedUrl(url: string, width = 800, quality = 75): string {
    if (!url) return '';
    if (url.includes('supabase.co/storage')) {
      const u = new URL(url);
      u.searchParams.set('width', width.toString());
      u.searchParams.set('quality', quality.toString());
      u.searchParams.set('format', 'webp');
      return u.toString();
    }
    return url;
  }
}

export function sanitizeImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  url = url.split('#')[0].trim();
  url = url.replace(/i\.ibb\.co\.com/g, 'i.ibb.co');
  url = url.replace(/\.com\.com/g, '.com');
  url = url.replace(/([^:]\/)\/+/g, '$1');
  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  return url;
}

export async function fetchAllPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('kabirdatabase')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database fetch error:', error.message);
    return [];
  }

  if (!data) return [];

  return data.map((item: any) => {
    const section = item.section || 'others';
    const config = SECTION_CONFIG[section] || SECTION_CONFIG['others'];
    const imageIid = item.image_iid || item.iid || item.id;

    return {
      id: imageIid,
      image_url: sanitizeImageUrl(item.image_url),
      thumbnail_url: sanitizeImageUrl(item.thumbnail_url || item.image_url),
      image_iid: imageIid,
      section: section,
      categoryName: config.name,
      category: config.category,
      weight: config.weight || 1,
      clicks: 0,
      title: item.title || '',
      description: item.description || '',
      created_at: item.created_at
    };
  }).filter(item => item.image_url && item.id);
}

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Weighted Random Shuffle
 */
export function weightedShuffle(photos: Photo[]): Photo[] {
  return photos
    .map(p => ({
      p,
      weight: (p.clicks || 0) * 0.3 + (SECTION_CONFIG[p.section]?.weight || 1) * 10 + Math.random() * 50
    }))
    .sort((a, b) => b.weight - a.weight)
    .map(x => x.p);
}

/**
 * Table-Balanced Shuffle
 */
export function tableBalancedShuffle(photos: Photo[]): Photo[] {
  const tables: Record<string, Photo[]> = {};
  photos.forEach(p => {
    if (!tables[p.section]) tables[p.section] = [];
    tables[p.section].push(p);
  });

  Object.keys(tables).forEach(t => {
    tables[t] = fisherYatesShuffle(tables[t]);
  });

  const result: Photo[] = [];
  const tableNames = Object.keys(tables);
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    const shuffledTables = fisherYatesShuffle(tableNames);
    for (const t of shuffledTables) {
      if (tables[t][index]) {
        result.push(tables[t][index]);
        hasMore = true;
      }
    }
    index++;
  }
  return result;
}

/**
 * Advanced Mixed Shuffle (Category and Section balanced)
 */
export function advancedMixedShuffle(photos: Photo[]): Photo[] {
  const grouped: Record<string, Photo[]> = {};
  photos.forEach(p => {
    const key = `${p.category}-${p.section}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  Object.keys(grouped).forEach(k => {
    grouped[k] = fisherYatesShuffle(grouped[k]);
  });

  const allGroups = Object.values(grouped);
  const result: Photo[] = [];
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    const shuffledGroups = fisherYatesShuffle(allGroups);
    for (const g of shuffledGroups) {
      if (g[index]) {
        result.push(g[index]);
        hasMore = true;
      }
    }
    index++;
  }
  return result;
}

export function smartShuffle(photos: Photo[]): Photo[] {
  return advancedMixedShuffle(photos);
}
