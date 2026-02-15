import { EXT_MD, EXT_PDF, GAMES_ROUTE_SEGMENT } from './constants';

/**
 * Extracts and formats a readable title from a URL path segment.
 * - Decodes URI components.
 * - Removes file extensions (.pdf, .md).
 * - Replaces hyphens with spaces.
 */
export function extractTitleFromPath(segment: string): string {
  let title = decodeURIComponent(segment);
  if (title.toLowerCase().endsWith(EXT_PDF)) title = title.slice(0, -EXT_PDF.length);
  if (title.toLowerCase().endsWith(EXT_MD)) title = title.slice(0, -EXT_MD.length);
  return title.replace(/-/g, ' ');
}

/**
 * Checks if a given link is an internal application link (Markdown or PDF).
 */
export function isInternalLink(href: string): boolean {
  if (!href) return false;
  if (href.startsWith('http://') || href.startsWith('https://')) return false;
  if (href.startsWith('mailto:')) return false;
  return href.endsWith(EXT_MD) || href.endsWith(EXT_PDF);
}

/**
 * Converts a relative file path (from a markdown link) to an SPA route.
 * Handles:
 * - ./ and ../ relative resolution
 * - /Games/ casing normalization
 * - Stripping .md extension (but keeping .pdf)
 * - Handling index/README acting as directories
 */
export function toAppRoute(href: string, currentPath: string, sourceFilePath: string): string {
  const resolved = resolveAbsolutePath(href, currentPath, sourceFilePath);

  // Transform specific file patterns to application routes
  // e.g. /Games/ -> /games/
  let appRoute = resolved;
  if (appRoute.includes('/Games/')) {
    appRoute = appRoute.replace('/Games/', `/${GAMES_ROUTE_SEGMENT}/`);
  }

  // Strip README.md to point to the folder route (which renders the README)
  if (appRoute.endsWith('/README.md')) {
    return appRoute.slice(0, -10);
  }

  // Strip .md extension for clean routes
  if (appRoute.endsWith(EXT_MD)) {
    return appRoute.slice(0, -EXT_MD.length);
  }

  // Keep .pdf extension as it is handled by specific route logic
  return appRoute;
}

function resolveAbsolutePath(href: string, currentPath: string, sourceFilePath: string): string {
  if (href.startsWith('/')) {
    return href;
  }

  // Determine if the current route acts as a directory (if the source file is an index/README)
  const isIndex = sourceFilePath.toLowerCase().endsWith('index.md') || sourceFilePath.toLowerCase().endsWith('readme.md');

  let currentDir: string;
  if (isIndex) {
    currentDir = currentPath.endsWith('/') ? currentPath : currentPath + '/';
  } else {
    currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  }

  return resolveRelativePath(currentDir, href);
}

/**
 * Resolve asset paths (images, PDFs) relative to the current markdown file.
 * Returns the full URL including BASE_URL.
 */
export function resolveAssetPath(src: string | undefined, filePath: string): string | undefined {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;

  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  const resolved = resolveRelativePath(dir + '/', src);

  return `${baseUrl}${resolved}`;
}

/**
 * Common logic to resolve ./ and ../ paths against a base directory.
 * Base directory should end with /
 */
function resolveRelativePath(baseDir: string, relativePath: string): string {
  if (relativePath.startsWith('./')) {
    return baseDir + relativePath.slice(2);
  } 
  
  if (relativePath.startsWith('../')) {
    const parts = baseDir.split('/').filter(Boolean);
    let path = relativePath;
    while (path.startsWith('../') && parts.length > 0) {
      parts.pop();
      path = path.slice(3);
    }
    return '/' + parts.join('/') + (parts.length > 0 ? '/' : '') + path;
  }

  return baseDir + relativePath;
}
