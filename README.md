# Learning Mandarin

Interactive Mandarin learning website built with Next.js, Tailwind CSS, and local JSON course data.

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000.

PowerShell may block `npm.ps1` on Windows, so `npm.cmd` is the recommended command form.

## Website

GitHub Pages deployment is configured through `.github/workflows/deploy-pages.yml`.

Expected public URL:

https://riperdy-tech.github.io/LearningMandarin/

In GitHub, open the repository settings and confirm:

1. Go to `Settings` -> `Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main`, or run `Deploy to GitHub Pages` from the `Actions` tab.

## Course Data

The Month 1 curriculum contract lives in `mandarin_course/`:

- `config/` schemas, scoring rules, and SRS rules
- `data/` vocabulary, sentences, grammar, pronunciation, and writing data
- `lessons/` lesson definitions
- `audio/` audio manifest placeholders
- `engine/` pronunciation and grading specs
- `ui/` UI copy
