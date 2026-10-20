# Khalid Almuteri — Personal Website

A static website published at [kalmuteri.github.io](https://kalmuteri.github.io/), built with HTML, CSS, and browser JavaScript. GitHub Pages serves the files directly; no site-wide build is required.

Articles can be authored in Markdown and rendered locally using Node.js and `marked`. Equations use MathJax from jsDelivr. HTML pages include Google Analytics measurement ID `G-J94NGL218Z`.

## Site structure

| Path | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `about/` | Biography, research interests, and working principles |
| `lab/` | Interactive laboratory index |
| `lab/acoustic-wave/` | Acoustic wave simulation and three guided experiments |
| `writing/` | Technical articles and Writing index |
| `guides/strategy-field-guide/` | Nine-chapter leadership guide |
| `guides/` | Guide index |
| `contact/` | Contact page |
| `assets/lab/` | Numerical solver, controls, diagnostics, and plotting |
| `writing/writing-article-template.md` | Canonical Markdown article template |
| `templates/article.html` | Shared HTML shell for generated articles |
| `scripts/render-article.mjs` | Markdown-to-HTML renderer |
| `scripts/publish-article.mjs` | Generate an article and update Writing, Recent writing, and the sitemap |
| `tests/` | Numerical, renderer, and publishing regression tests |
| `tests/helpers/` | Test-only numerical helpers |
| `docs/` | Writing workflow and acoustic-lab implementation notes |

## Styling and behavior

- `assets/site.css`: shared layout, typography foundations, theme variables, and site components.
- `assets/ux.css`: shared accessibility, navigation refinements, and date styling.
- `assets/article.css`: article layout, callouts, equations, comparison cards, figures, tables, code blocks, and article-specific responsive rules.
- Articles load those three stylesheets in that order.
- `assets/theme-init.js`: applies the saved theme before painting, using `:root[data-theme="dark"]`.
- `assets/ux.js`: theme switching and accessible navigation behavior.
- `assets/site.js`: updates the footer year.
- `assets/social-preview.png` and `assets/favicon.svg`: social sharing image and site icon.

The leadership guide uses its own page styles plus shared interaction assets. Its return link goes to Guides. Its chapter navigation, concept tabs, exercises, and print view remain separate from the Writing article renderer.

## Write an article

1. Copy `writing/writing-article-template.md` to `writing/<slug>/<slug>.md`.
2. Set `slug` to the containing folder name and keep `status: "draft"` while preparing it. Choose `category: "technical"` or `category: "essay"`; `type` supplies the visible label.
3. Put images beside the Markdown file.
4. Install the renderer dependency and generate the page:

```sh
npm install --prefix scripts
node scripts/render-article.mjs writing/<slug>/<slug>.md
```

The renderer creates `index.html` beside the source. It does not update listings, commit, or deploy. To publish locally, set `status: "published"`, `publication_date`, and `topic`, then run:

```sh
node scripts/publish-article.mjs writing/<slug>/<slug>.md --dry-run
node scripts/publish-article.mjs writing/<slug>/<slug>.md
```

The publishing script generates HTML, updates Writing, shows the three most recent articles on the homepage, and adds the sitemap entry. It does not commit or push.

See [the writing workflow](docs/writing-workflow.md) for title emphasis, LaTeX, callouts, comparison cards, captions, and related links. Draft pages use `noindex`, which is not access control: any deployed draft remains accessible by URL.

## Local preview and checks

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [the local preview](http://127.0.0.1:8000/).

With Node.js installed and renderer dependencies available:

```sh
node --test tests/lab.test.mjs tests/article-renderer.test.mjs tests/article-publisher.test.mjs tests/writing-filters.test.mjs
```

Before publishing, check changed pages at desktop and mobile widths, both themes, keyboard navigation, and relevant equations or interactive controls. See [acoustic-lab notes](docs/acoustic-lab.md) for numerical assumptions and implementation history.

## Deployment and URLs

GitHub Pages publishes the `main` branch from the repository root. `.nojekyll` keeps the static files unprocessed. Review and commit the intended files, push to `origin`, and allow the Pages deployment to finish. Keep `sitemap.xml`, canonical URLs, and navigation links synchronized when adding or moving pages. `404.html` provides the missing-page screen, and `robots.txt` points crawlers to the sitemap.

Use `/lab/` for laboratories, `/about/#research` for research interests, and `/guides/strategy-field-guide/` for the leadership guide.

## Content maintenance

Keep proposed topics in [the future-articles backlog](docs/future-articles.md) and detailed recommendations in `docs/article-plans/`, starting with [spline interpolation](docs/article-plans/spline-interpolation.md).

Edit research interests in `about/index.html`, laboratory listings in `lab/index.html`, and guide listings in `guides/index.html`. Navigation is repeated in the static HTML pages and in the article shell; update each relevant page when changing it. Regenerate Markdown articles after changing their shell.

The leadership guide originated from user-supplied content. Review article text, figures, sources, and attribution before publication.
