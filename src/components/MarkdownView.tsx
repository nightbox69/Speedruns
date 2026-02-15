import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { TypographyStylesProvider, Title, Anchor } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { isInternalLink, resolveAssetPath, toAppRoute } from '../utils/pathUtils';

interface MarkdownViewProps {
  content: string;
  filePath: string;
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || [])],
  attributes: {
    ...defaultSchema.attributes,
    tr: [...(defaultSchema.attributes?.tr || []), 'style'],
    td: [...(defaultSchema.attributes?.td || []), 'style', 'width', 'colspan', 'rowspan'],
    th: [...(defaultSchema.attributes?.th || []), 'style', 'width', 'colspan', 'rowspan'],
    table: [...(defaultSchema.attributes?.table || []), 'style'],
  },
};

function MarkdownView({ content, filePath }: MarkdownViewProps) {
  const location = useLocation();

  return (
    <TypographyStylesProvider
      styles={(theme) => ({
        // ... styles
        root: {
          color: theme.colors.dark[0],
          lineHeight: 1.6,
          '& h1, & h2, & h3, & h4': {
            fontWeight: 700,
            marginBottom: theme.spacing.md,
            marginTop: theme.spacing.xl,
            color: theme.white,
            letterSpacing: '-0.02em',
          },
          '& p': {
            marginBottom: theme.spacing.lg,
          },
          '& code': {
            backgroundColor: theme.colors.dark[6],
            padding: '2px 5px',
            borderRadius: theme.radius.xs,
            fontFamily: theme.fontFamilyMonospace,
            fontSize: '0.9em',
          },
          '& pre': {
            backgroundColor: theme.colors.dark[8],
            padding: theme.spacing.md,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.dark[5]}`,
            overflowX: 'auto',
          },
          '& blockquote': {
            borderLeft: `4px solid ${theme.colors.blue[6]}`,
            backgroundColor: theme.colors.dark[8],
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            color: theme.colors.dark[2],
            fontStyle: 'italic',
          }
        }
      })}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{

          // Override headers to add id/anchors if needed, or just style
          h1: ({ children }) => <Title order={1} mb="lg" mt="xl">{children}</Title>,
          h2: ({ children }) => (
            <Title order={2} mb="md" mt="xl" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)', paddingBottom: '0.5rem' }}>
              {children}
            </Title>
          ),
          h3: ({ children }) => <Title order={3} mb="sm" mt="lg">{children}</Title>,
          // Override links to use SPA navigation for internal .md links
          a: ({ href, children, ...props }) => {
            if (href && isInternalLink(href)) {
              const route = toAppRoute(href, location.pathname, filePath);
              return (
                <Anchor
                  component={Link}
                  to={route}
                  {...props}
                >
                  {children}
                </Anchor>
              );
            }
            // External links open in new tab
            return (
              <Anchor href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </Anchor>
            );
          },
          // Fix image paths to point to /content/
          img: ({ src, alt, ...props }) => {
            const resolvedSrc = resolveAssetPath(src, filePath);
            return (
              <img 
                src={resolvedSrc} 
                alt={alt} 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: 'var(--mantine-radius-md)', 
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  boxShadow: 'var(--mantine-shadow-md)'
                }} 
                {...props} 
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </TypographyStylesProvider>
  );
}

export default MarkdownView;
