# Learning Mandarin

Interactive Mandarin learning website built with Next.js, Tailwind CSS, and local JSON course data.

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000.

PowerShell may block `npm.ps1` on Windows, so `npm.cmd` is the recommended command form.

## Course Data

The Month 1 curriculum contract lives in `mandarin_course/`:

- `config/` schemas, scoring rules, and SRS rules
- `data/` vocabulary, sentences, grammar, pronunciation, and writing data
- `lessons/` lesson definitions
- `audio/` audio manifest placeholders
- `engine/` pronunciation and grading specs
- `ui/` UI copy
