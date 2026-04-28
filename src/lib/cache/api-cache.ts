import fs from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.resolve('.cache');
const shouldUseDevCache = process.argv.slice(2).includes('dev');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 7 * 24 * 60 * 60 * 1000): Promise<T> {
  if (!shouldUseDevCache) {
    return fetcher();
  }

  ensureCacheDir();
  const cacheFile = path.join(CACHE_DIR, `${encodeURIComponent(key)}.json`);
  
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const age = Date.now() - stats.mtimeMs;
    
    if (age < ttlMs) {
      try {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        console.log(`[cache] Hit for ${key}`);
        return data;
      } catch (e) {
        console.warn(`[cache] Failed to read ${key}, fetching fresh...`);
      }
    }
  }

  const data = await fetcher();
  fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  console.log(`[cache] Miss/Expired for ${key}, saved to disk`);
  return data;
}
