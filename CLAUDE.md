# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + TypeScript single-page application that serves as a pseudo-CMS for speedrun notes. The app dynamically loads and displays markdown files and PDFs from the `public/content/Games/` directory. Built with Vite, Mantine UI, and deployed to GitHub Pages at https://nightbox69.github.io/Speedruns/.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Routing System

The app uses file-based routing that maps URLs to markdown/PDF files in `public/content/`:

- **Root**: `/` → renders `/content/index.md`
- **Game index**: `/games/{game}` → renders `/content/Games/{game}/README.md`
- **Game content**: `/games/{game}/*` → renders `/content/Games/{game}/*` (auto-appends `.md` if not `.pdf`)

Route segments like `current`, `former`, and `utility-guides` are hidden from breadcrumbs (see `HIDDEN_BREADCRUMB_SEGMENTS` in [src/utils/constants.ts](src/utils/constants.ts)).

### Content Organization

```
public/content/
├── index.md                    # Homepage
└── Games/
    ├── {GameName}/
    │   ├── README.md          # Game landing page
    │   ├── Notes/             # Markdown guides
    │   ├── Current/           # Current route PDFs
    │   ├── Former/            # Archived route PDFs
    │   └── images/            # Game-specific assets
```

Each game folder is self-contained with its own content and assets.

### Key Components

- **[Layout.tsx](src/components/Layout.tsx)**: App shell with breadcrumb navigation. Breadcrumbs are constructed from URL segments, with special formatting for titles (hyphens → spaces, decoded URIs).
- **[MarkdownPage.tsx](src/components/MarkdownPage.tsx)**: Fetches and renders markdown files. Strips YAML frontmatter automatically.
- **[MarkdownView.tsx](src/components/MarkdownView.tsx)**: Renders markdown with custom components:
  - Internal `.md`/`.pdf` links converted to SPA routes
  - External links open in new tab
  - Images resolve relative paths using `resolveAssetPath()`
  - Custom sanitization schema allows `style`, `colspan`, `rowspan` attributes on table elements
- **[PdfPage.tsx](src/components/PdfPage.tsx)**: Embeds PDFs using `<object>` tag with download fallback.

### Path Utilities ([src/utils/pathUtils.ts](src/utils/pathUtils.ts))

Critical for internal linking between markdown files:

- **`toAppRoute(href, currentPath, sourceFilePath)`**: Converts relative markdown links to SPA routes. Handles `./`, `../` resolution, normalizes `/Games/` to `/games/`, strips `.md` extensions but preserves `.pdf`.
- **`resolveAssetPath(src, filePath)`**: Resolves relative image/asset paths to absolute URLs including `BASE_URL`.
- **`extractTitleFromPath(segment)`**: Formats URL segments into readable titles.

### Markdown Processing

Uses `react-markdown` with plugins:
- `remark-gfm`: GitHub Flavored Markdown (tables, strikethrough, etc.)
- `rehype-raw`: Allows raw HTML in markdown
- `rehype-sanitize`: Sanitizes HTML with custom schema to allow inline styles on tables

## Python Tools (Excel Converter)

Located in `Tools/Excel-Converter/`. Used to convert Excel spreadsheets to HTML/Markdown tables with color preservation, bold text, borders, and colspan support.

**Main script**: `convert_to_table.py`

Prerequisites:
```bash
pip install pandas openpyxl
```

See [Tools/Excel-Converter/Conversion-Guide.md](Tools/Excel-Converter/Conversion-Guide.md) for detailed usage.

## Deployment

GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) automatically builds and deploys to GitHub Pages on push to `master` branch. Ignores changes to `README.md`, `LICENSE`, `Games/`, `Tools/`, and `.gitignore`.

Build outputs to `dist/` and is deployed with base path `/Speedruns/` (configured in [vite.config.ts](vite.config.ts)).

## Important Configuration

- **Base URL**: `/Speedruns/` - all asset paths and routes are prefixed with this in production
- **TypeScript**: Strict mode enabled with `moduleResolution: "Bundler"`
- **Vite plugins**: React plugin + vite-plugin-checker for TypeScript validation during dev

## Adding New Game Content

1. Create folder: `public/content/Games/{GameName}/`
2. Add `README.md` in the game folder (serves as game landing page)
3. Add markdown files in `Notes/` subfolder
4. Link to the game from `public/content/index.md`
5. Reference notes from the game's `README.md` using relative paths (e.g., `./Notes/guide.md`)

Internal links are automatically converted to SPA routes, so use standard markdown link syntax.

## Code Style Notes

- Path utilities handle edge cases like `README.md` acting as directory index
- All file fetches use `import.meta.env.BASE_URL` to work correctly in both dev and production
- Components use Mantine's dark theme with custom styling in MarkdownView
