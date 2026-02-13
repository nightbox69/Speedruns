import { Routes, Route, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import MarkdownPage from './components/MarkdownPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MarkdownPage filePath="/content/index.md" />} />
        <Route
          path="/games/:game"
          element={<GamePage />}
        />
        <Route
          path="/games/:game/*"
          element={<NotesPage />}
        />
      </Routes>
    </Layout>
  );
}

function GamePage() {
  const { game } = useParams<{ game: string }>();
  return <MarkdownPage filePath={`/content/Games/${game}/README.md`} />;
}

function NotesPage() {
  const { game, '*': rest } = useParams<{ game: string; '*': string }>();
  // Remove .md extension from URL if present, we'll add it back for fetching
  const cleanPath = rest?.endsWith('.md') ? rest : `${rest}.md`;
  return <MarkdownPage filePath={`/content/Games/${game}/${cleanPath}`} />;
}

export default App;
