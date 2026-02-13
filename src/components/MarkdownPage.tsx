import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { TypographyStylesProvider, Loader, Alert } from '@mantine/core';

interface MarkdownPageProps {
  filePath: string;
}

function MarkdownPage({ filePath }: MarkdownPageProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${filePath}`;
    fetch(fetchPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${fetchPath}: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        // Strip YAML frontmatter if present
        const stripped = text.replace(/^---[\s\S]*?---\n*/m, '');
        setContent(stripped);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filePath]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error loading page">
        {error}
      </Alert>
    );
  }

  return (
    <TypographyStylesProvider>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Override links to use SPA navigation for internal .md links
          a: ({ href, children, ...props }) => {
            if (href && isInternalMdLink(href)) {
              const route = mdLinkToRoute(href, location.pathname);
              return (
                <a
                  href={route}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(route);
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            // External links open in new tab
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          // Fix image paths to point to /content/
          img: ({ src, alt, ...props }) => {
            const resolvedSrc = resolveAssetPath(src, filePath);
            return <img src={resolvedSrc} alt={alt} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </TypographyStylesProvider>
  );
}

/**
 * Check if a link is an internal .md link
 */
function isInternalMdLink(href: string): boolean {
  if (!href) return false;
  if (href.startsWith('http://') || href.startsWith('https://')) return false;
  if (href.startsWith('mailto:')) return false;
  return href.endsWith('.md');
}

/**
 * Convert a relative .md link to an SPA route.
 */
function mdLinkToRoute(href: string, currentPath: string): string {
  // Handle links that start with ../../ (going back to root index.md)
  if (href.includes('../../index.md')) {
    return '/';
  }

  // Handle links like ../README.md (going up one level to game index)
  if (href.startsWith('../')) {
    const parts = currentPath.split('/').filter(Boolean);
    let baseParts = [...parts];
    let linkPath = href;
    while (linkPath.startsWith('../')) {
      baseParts.pop();
      linkPath = linkPath.slice(3);
    }
    const resolved = '/' + baseParts.join('/') + '/' + linkPath;
    return resolved;
  }

  // Handle links like ./Notes/Something.md (relative to current path)
  if (href.startsWith('./')) {
    const basePath = currentPath.endsWith('.md')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : currentPath;
    return basePath + '/' + href.slice(2);
  }

  // Bare filename
  const basePath = currentPath.endsWith('.md')
    ? currentPath.substring(0, currentPath.lastIndexOf('/'))
    : currentPath;
  return basePath + '/' + href;
}

/**
 * Resolve asset paths (images, PDFs) relative to the current markdown file.
 */
function resolveAssetPath(src: string | undefined, filePath: string): string | undefined {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return src;

  const dir = filePath.substring(0, filePath.lastIndexOf('/'));

  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  let resolved: string;

  if (src.startsWith('./')) {
    resolved = dir + '/' + src.slice(2);
  } else if (src.startsWith('../')) {
    let baseParts = dir.split('/').filter(Boolean);
    let assetPath = src;
    while (assetPath.startsWith('../')) {
      baseParts.pop();
      assetPath = assetPath.slice(3);
    }
    resolved = '/' + baseParts.join('/') + '/' + assetPath;
  } else {
    resolved = dir + '/' + src;
  }

  return `${baseUrl}${resolved}`;
}

export default MarkdownPage;
