import { Routes, Route, useParams } from 'react-router-dom';
import { EXT_MD, EXT_PDF } from './utils/constants';
import Layout from './components/Layout';
import MarkdownPage from './components/MarkdownPage';
import PdfPage from './components/PdfPage';

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
  
  // Check if it's a PDF
  if (rest?.toLowerCase().endsWith(EXT_PDF)) {
    return <PdfPage filePath={`/content/Games/${game}/${rest}`} />;
  }

  // Remove .md extension from URL if present, we'll add it back for fetching
  const cleanPath = rest?.endsWith(EXT_MD) ? rest : `${rest}${EXT_MD}`;
  return <MarkdownPage filePath={`/content/Games/${game}/${cleanPath}`} />;
}

export default App;
