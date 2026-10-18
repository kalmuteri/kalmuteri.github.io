# Writing articles

Copy `writing/writing-article-template.md` into `writing/<slug>/<slug>.md`. Keep images alongside it. Metadata uses one `key: "value"` per line (JSON-style double-quoted strings); nested YAML is not supported.

## Article features

- `title: "From waves | to *computation*"`: `|` inserts a title line break; `*…*` produces teal italic emphasis. Plain text is used for browser and social titles.
- `subtitle`: opening deck beneath the title; `summary` is the search description and falls back as the deck when subtitle is empty.
- `topic`, `type`, optional `article_number`: article header metadata. Reading time is calculated.
- `status`: `draft` or `published`. Drafts display a preview label and request no search indexing. This is not access control.
- `publication_date` and optional `updated_date`: explicit YYYY-MM-DD dates. Published content requires a publication date.
- `slug`: must equal the article folder name.
- `related_title`, `related_description`, `related_label`, `related_url`: optional related-content panel above the article.
- `next_title`, `next_url`: optional Continue reading link at the end. Leave URLs blank to omit these features.
- `##` headings create the automatic table of contents; `###` creates subsections.
- `$…$` and `$$…$$`: inline and display LaTeX, rendered by MathJax.
- Standard Markdown tables, lists, links, images, and fenced code blocks are supported. Raw HTML is displayed as text.

Callouts use a block on separate lines:

```text
:::idea
Your central idea, with **Markdown** formatting.
:::

:::note ASSUMPTIONS
Your explanation.
:::

:::takeaway
Your closing insight.
:::

:::figure
![Meaningful description](figure.png)
Figure 1: Caption with an optional [source](https://example.com).
:::
```

## Generate a local page

Install the renderer dependency once:

```sh
npm install --prefix scripts
node scripts/render-article.mjs writing/your-article-title/your-article-title.md
```

The script writes `index.html` alongside the Markdown using `templates/article.html` and the existing site styles. Regenerate after editing the source. It never commits, pushes, or changes the homepage, Writing index, or sitemap. Publishing those listings remains a separate reviewed step. The canonical template starts as a draft with placeholders; replace them before publication.

Use these extensions in authored prose. Do not nest extension blocks or place literal math delimiters or extension syntax inside code examples; this small renderer processes extensions before standard Markdown.

## Comparison cards

Use exactly two level-three headings, each with nonempty Markdown content. The renderer reports incomplete or extra cards as errors. Cards appear side by side on desktop and stack below 650px.

```markdown

:::comparison
### Stability
Time and space sampling must satisfy the numerical scheme’s stability conditions.

### Dispersion
Enough points per wavelength are needed to preserve wave behavior accurately.
:::
```

All Writing articles load `site.css`, `ux.css`, then `article.css`. Article layout, callouts, equations, comparison cards, contents navigation, related links, and their responsive/dark/print rules live in `article.css`. Shared theme variables, navigation, typography foundations, and dates remain shared because other sections use them.

## Random Continue reading link

Existing articles and the article shell load `assets/continue-reading.js`. Each page load fetches the current Writing index and randomly recommends one other article listed there. Keep drafts out of that index: it is the published-article list. Adding a published article to Writing makes it eligible without regenerating older pages.

Within the same browser tab, the script remembers the previous recommendation and avoids immediately repeating it when at least two alternatives exist. With only two published articles, each can recommend only the other. If session storage is unavailable, selection still works but may repeat.

`next_title` and `next_url` provide a static fallback for offline visits, disabled JavaScript, or an unavailable index. When the index loads successfully, the random selection replaces that fallback. If these fields are blank, the script creates the section once it finds an eligible article. If no other articles are listed, the section is hidden.
