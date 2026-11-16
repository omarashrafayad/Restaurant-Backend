import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { baseUrl } from '../utils/url.util.js';

/** Response keys that hold an uploaded image path. */
const IMAGE_KEYS = new Set(['image', 'imageCover', 'images', 'profileImg', 'banner']);
/** Folder used for legacy values that were stored as a bare file name. */
const LEGACY_FOLDERS: Record<string, string> = {
  profileImg: 'user',
  imageCover: 'products',
  images: 'products',
};

function toUrl(key: string, value: unknown): unknown {
  if (typeof value !== 'string' || !value || /^https?:\/\//i.test(value)) return value;
  if (value.includes('/')) return `${baseUrl()}/uploads/${value.replace(/^\/+/, '')}`;
  const legacy = LEGACY_FOLDERS[key];
  return legacy ? `${baseUrl()}/uploads/${legacy}/${value}` : value;
}

function walk(node: any): any {
  if (Array.isArray(node)) return node.map(walk);
  if (!node || typeof node !== 'object') return node;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (IMAGE_KEYS.has(key)) {
      node[key] = Array.isArray(value) ? value.map((v) => toUrl(key, v)) : toUrl(key, value);
    } else if (value && typeof value === 'object') {
      node[key] = walk(value);
    }
  }
  return node;
}

/**
 * Images are stored as relative paths (`products/x.jpeg`) so the API can move
 * between domains/CDNs; this turns them into absolute URLs on the way out,
 * for lean and hydrated documents alike.
 */
@Injectable()
export class UploadUrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();
    return next.handle().pipe(
      map((body) => {
        if (body === undefined || body === null || typeof body !== 'object') return body;
        // Normalise mongoose documents / ObjectIds / Dates to plain JSON first.
        return walk(JSON.parse(JSON.stringify(body)));
      }),
    );
  }
}
