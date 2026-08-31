# Brains, Minds, and Machines

Public textbook for **PSYCH 275 — Brain and Behaviour** (University of Alberta).

**Read it:** [kylemath.github.io/psych275-textbook/textbook/](https://kylemath.github.io/psych275-textbook/textbook/)

Enrolled students start in **Canvas**. This site is the book and the interactives, not the syllabus or the gradebook.

## What this repo is

A student-facing extract from the course workspace. It includes:

- Textbook reader (`textbook/`) and chapter pages (`chapter0.html`–`chapter15.html`)
- Chapter source (`content/*.txt`)
- Chapter maps (`GeminiSummaryCh*.png`)
- p5 sketches and the three mechanism demos
- Practice tools (`sketchCatalogue.html`, `student_practice.html`)

It does **not** include lecture scripts, slide decks, answer keys, exams, or rosters. Those stay in the private course repo.

## Local preview

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080/textbook/](http://localhost:8080/textbook/).

Chapter deep links: `/textbook/#chapter5` or `/textbook/?ch=5` once the reader supports the query string.

## GitHub Pages

This repo is served from the `main` branch root. `.nojekyll` is present so GitHub does not run Jekyll on the static files.
