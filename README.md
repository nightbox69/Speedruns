# NB Speedrun Notes 🏃‍♂️💨

Modern note-taking hub for speedrun strategies, built with React, TypeScript, and Mantine.

## 🚀 Features

- **SPA Performance**: Lightning-fast navigation between notes.
- **Dark Mode**: Premium dark theme powered by Mantine.
- **Vibrant Markdown**: Full support for inline HTML tables, maintaining original color-coded strategies (e.g., Persona 5 battle notes).
- **Type Safety**: Fully typed with TypeScript.
- **Automated Deployment**: Integrated with GitHub Actions for seamless updates.

## 📂 Structure

- `public/content/`: All markdown notes and game-specific assets.
- `src/`: React source code.
- `index.html`: Entry point.

## 🛠️ Development

### Local Dev

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📝 Usage

To add new notes, simply place your `.md` files in `public/content/Games/[GameName]/Notes/` and link them in the corresponding game's `README.md`.

## 📄 License

This repository is forked from [drush211](https://github.com/drush211/Speedruns).
