import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader, Alert } from '@mantine/core';
import MarkdownView from './MarkdownView';

interface MarkdownPageProps {
  filePath: string;
}

function MarkdownPage({ filePath }: MarkdownPageProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  return <MarkdownView content={content} filePath={filePath} />;
}

export default MarkdownPage;
