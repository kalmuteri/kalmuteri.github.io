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

The script writes `index.html` alongside the Markdown using `templates/article.html` and the existing site styles. Regenerate after editing the source. It never commits, pushes, or changes the homepage, Writing index, or sitemap. Use the publishing script below to update those listings when the article is ready. The canonical template starts as a draft with placeholders; replace them before publication.

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

## Publish an article locally

Use Node.js 20 or newer and install dependencies with `npm ci --prefix scripts`.
Set `status: "published"`, a real `publication_date` (`YYYY-MM-DD`), and a nonempty `title`, `summary`, and `topic`. The `slug` must match its folder under `writing/`.

```sh
node scripts/publish-article.mjs writing/my-article/my-article.md --dry-run
node scripts/publish-article.mjs writing/my-article/my-article.md
```

The dry run validates and renders in a temporary directory, reports the files that would change, and leaves the website untouched. The second command:

- Regenerates the article's `index.html` using the shared template.
- Adds or updates its Writing row with title, summary, topic, type, reading time, and publication date.
- Sorts Writing by publication date, newest first, and renumbers the rows.
- Updates the homepage's Recent writing to the three newest articles. Existing homepage titles are retained for other articles.
- Adds its canonical URL to the sitemap without duplicates.

Running it again without changing the article produces no further changes. Rendering and listing validation finish before files are written; ordinary write failures restore the previous files. The command never commits, pushes, or changes Markdown status for you. Review `git diff` before deployment, and include the Markdown, generated HTML, and images in the commit alongside the listings.

Limitations: this updates one article at a time using the current Writing list, including manually authored articles. It does not scan folders, unpublish articles, clean up renamed slugs, validate external links, detect placeholder prose, or schedule future publication dates. A future date is treated as ordinary metadata, not a scheduled release. Do not manually change the `writing-list` or `post-list` container structure without updating the script. The ignored `writing/my-test-article/` folder is for local tests; real articles should use a different descriptive slug.

## Test without changing your website

Run the automated checks from the repository root:

```sh
node --test tests/article-publisher.test.mjs tests/article-renderer.test.mjs
```

These create and remove temporary fixtures. They verify dry-run behavior, successful publication, duplicate prevention, repeat runs, metadata changes, ordering, preservation of surrounding HTML, and failures for drafts, invalid dates, missing figures, and unexpected page structure.

For a manual test, create an isolated preview copy from the repository root:

```sh
preview_dir=$(mktemp -d /tmp/article-preview.XXXXXX)
cp -R assets writing templates scripts index.html sitemap.xml "$preview_dir/"
cd "$preview_dir"
printf 'Preview folder: %s\n' "$preview_dir"
```

This copies installed renderer dependencies as well as your existing `writing/my-test-article/`. In this temporary copy only, edit `writing/my-test-article/my-test-article.md`: set `status: "published"`, `publication_date: "2026-10-19"`, and keep a nonempty topic. Then run:

```sh
node scripts/publish-article.mjs writing/my-test-article/my-test-article.md --dry-run
node scripts/publish-article.mjs writing/my-test-article/my-test-article.md
node scripts/publish-article.mjs writing/my-test-article/my-test-article.md
python3 -m http.server 8770 --bind 127.0.0.1
```

The second publishing run should say `Already up to date`. Open:

- `http://127.0.0.1:8770/` — the article appears in Recent writing if among the three newest.
- `http://127.0.0.1:8770/writing/` — one entry with the right title, summary, date, and link.
- `http://127.0.0.1:8770/writing/my-test-article/` — published date, content, equations, image, comparison cards, and working contents links.
- `http://127.0.0.1:8770/sitemap.xml` — exactly one URL for the test article.

Check desktop/mobile widths and light/dark themes. The preview copy omits About, Lab, Guides, and Contact, so those navigation destinations are unavailable there. Stop the server with Ctrl+C. Your original repository is unchanged by this manual test.
