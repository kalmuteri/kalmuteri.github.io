# Writings articles

Copy `writings/writing-article-template.md` into `writings/<slug>/<slug>.md`. Keep images alongside it. Metadata uses one `key: "value"` per line (JSON-style double-quoted strings); nested YAML is not supported.

## Article features

- `title: "From waves | to *computation*"`: `|` inserts a title line break; `*…*` produces teal italic emphasis. Plain text is used for browser and social titles.
- `subtitle`: opening deck beneath the title; `summary` is the search description and falls back as the deck when subtitle is empty.
- `topic`, `type`, optional `article_number`: article header metadata. Reading time is calculated. `type` is the visible label, such as Essay, Explainer, or Perspective.
- `category`: `technical` or `essay`, controlling the Writings filter independently of the type label. Older sources without this field default to `technical`; use an explicit category for new articles. Both the renderer and publisher reject invalid categories.
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
node scripts/render-article.mjs writings/your-article-title/your-article-title.md
```

The script writes `index.html` alongside the Markdown using `templates/article.html` and the existing site styles. Regenerate after editing the source. It never commits, pushes, or changes the homepage, Writings index, or sitemap. Use the publishing script below to update those listings when the article is ready. The canonical template starts as a draft with placeholders; replace them before publication.

Use these extensions in authored prose. Do not nest extension blocks. Fenced and inline code examples are protected from math, extension, and footnote processing.

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

All Writings articles load `site.css`, `ux.css`, then `article.css`. Article layout, callouts, equations, comparison cards, contents navigation, related links, and their responsive/dark/print rules live in `article.css`. Shared theme variables, navigation, typography foundations, and dates remain shared because other sections use them.

## Random Continue reading link

Existing articles and the article shell load `assets/continue-reading.js`. Each page load fetches the current Writings index and randomly recommends one other article listed there. Keep drafts out of that index: it is the published-article list. Adding a published article to Writings makes it eligible without regenerating older pages.

Within the same browser tab, the script remembers the previous recommendation and avoids immediately repeating it when at least two alternatives exist. With only two published articles, each can recommend only the other. If session storage is unavailable, selection still works but may repeat.

`next_title` and `next_url` provide a static fallback for offline visits, disabled JavaScript, or an unavailable index. When the index loads successfully, the random selection replaces that fallback. If these fields are blank, the script creates the section once it finds an eligible article. If no other articles are listed, the section is hidden.

## Publish an article locally

Use Node.js 20 or newer and install dependencies with `npm ci --prefix scripts`.
Set `status: "published"`, a real `publication_date` (`YYYY-MM-DD`), and a nonempty `title`, `summary`, and `topic`. The `slug` must match its folder under `writings/`.

```sh
node scripts/publish-article.mjs writings/my-article/my-article.md --dry-run
node scripts/publish-article.mjs writings/my-article/my-article.md
```

The dry run validates and renders in a temporary directory, reports the files that would change, and leaves the website untouched. The second command:

- Regenerates the article's `index.html` using the shared template.
- Adds or updates its Writings row with title, summary, topic, type, reading time, and publication date.
- Sorts Writings by publication date, newest first, and renumbers the rows.
- Updates the homepage's Recent writing to the three newest articles. Existing homepage titles are retained for other articles.
- Adds its canonical URL to the sitemap without duplicates.

Running it again without changing the article produces no further changes. Rendering and listing validation finish before files are written; ordinary write failures restore the previous files. The command never commits, pushes, or changes Markdown status for you. Review `git diff` before deployment, and include the Markdown, generated HTML, and images in the commit alongside the listings.

Limitations: this updates one article at a time using the current Writings list, including manually authored articles. It does not scan folders, unpublish articles, clean up renamed slugs, validate external links, detect placeholder prose, or schedule future publication dates. A future date is treated as ordinary metadata, not a scheduled release. Do not manually change the `writing-list` or `post-list` container structure without updating the script. The ignored `writings/my-test-article/` folder is for local tests; real articles should use a different descriptive slug.

## Test without changing your website

Run the automated checks from the repository root:

```sh
node --test tests/article-publisher.test.mjs tests/article-renderer.test.mjs
```

These create and remove temporary fixtures. They verify dry-run behavior, successful publication, duplicate prevention, repeat runs, metadata changes, ordering, preservation of surrounding HTML, and failures for drafts, invalid dates, missing figures, and unexpected page structure.

For a manual test, create an isolated preview copy from the repository root:

```sh
preview_dir=$(mktemp -d /tmp/article-preview.XXXXXX)
cp -R assets writings templates scripts index.html sitemap.xml "$preview_dir/"
cd "$preview_dir"
printf 'Preview folder: %s\n' "$preview_dir"
```

This copies installed renderer dependencies as well as your existing `writings/my-test-article/`. In this temporary copy only, edit `writings/my-test-article/my-test-article.md`: set `status: "published"`, `publication_date: "2026-10-19"`, and keep a nonempty topic. Then run:

```sh
node scripts/publish-article.mjs writings/my-test-article/my-test-article.md --dry-run
node scripts/publish-article.mjs writings/my-test-article/my-test-article.md
node scripts/publish-article.mjs writings/my-test-article/my-test-article.md
python3 -m http.server 8770 --bind 127.0.0.1
```

The second publishing run should say `Already up to date`. Open:

- `http://127.0.0.1:8770/` — the article appears in Recent writing if among the three newest.
- `http://127.0.0.1:8770/writings/` — one entry with the right title, summary, date, and link.
- `http://127.0.0.1:8770/writings/my-test-article/` — published date, content, equations, image, comparison cards, and working contents links.
- `http://127.0.0.1:8770/sitemap.xml` — exactly one URL for the test article.

Check desktop/mobile widths and light/dark themes. The preview copy omits About, Lab, Guides, and Contact, so those navigation destinations are unavailable there. Stop the server with Ctrl+C. Your original repository is unchanged by this manual test.

## Technical articles and personal essays

The Writings page has All, Technical, and Essays filters. The chosen category is stored in the URL (`?filter=essay` or `?filter=technical`) so refreshes and returning from an article preserve the choice. Without JavaScript, all entries remain available and the filters stay hidden. An empty category displays an explanation.

For a personal essay, use:

```yaml
type: "Essay"
category: "essay"
topic: "Learning and discovery"
```

For a technical perspective, use:

```yaml
type: "Perspective"
category: "technical"
topic: "AI and science"
```

Both use the same rendering and publishing commands. The publisher writes `data-category` on the Writings row and updates it when republishing. Optional math, comparisons, assumptions, figures, and related-content panels can be removed for prose-only essays. For manually authored articles, set `data-category="technical"` or `data-category="essay"` on their Writings row. The two existing articles are Technical; no sample essay is published.

## Header metadata and consistent HTML

- `title` controls the visible heading, with `|` for a line break and `*emphasis*`.
- Optional `page_title` sets the browser/social title independently; blank uses the plain heading.
- Optional `breadcrumb` sets the breadcrumb text; blank uses the plain heading in uppercase.
- Optional `subject` supplies the broad subject above the title. The header order is TYPE · SUBJECT; when omitted, `topic` is used.
- `topic` is the more specific label below the title and in listings. For the wave article, `subject: "Geophysics"`, `type: "Explainer"`, and `topic: "Numerical methods"` produce EXPLAINER · GEOPHYSICS above and Numerical methods below. The metadata below the title uses sentence case, including the reading-time label (for example, Explainer / 001 · ~2 min read · Numerical methods).
- Published pages include a `date` meta tag; pages with `updated_date` also include `last-modified`.

Callouts consistently use `div` elements. Generated block markup is compacted while code-block whitespace is preserved. Apostrophes use literal characters. Reading time continues to be calculated automatically.

## References, further reading, and footnotes

Definitions are separated by name:

| Syntax | Destination | Inline citation required? |
| --- | --- | --- |
| `[^source]: ...` or `[^source-name]: ...` | References and further reading | No; cite it when supporting a claim |
| `[^further]: ...` | References and further reading | No; repeat this definition for multiple entries |
| `[^further-name]: ...` | References and further reading | Optional; use a unique name if cited |
| `[^footnote]: ...`, `[^note]: ...`, or another name | Footnotes | Yes |

Use `source-` or `further-` prefixes for named references. Other names remain ordinary footnotes. Names are case-sensitive and may contain letters, digits, underscores, and hyphens.

```markdown
A claim with a cited source.[^source-waves]
A detail explained separately.[^note]

[^source-waves]: Author. Year. [Source title](https://example.com).
[^further]: Author. Year. [Another source](https://example.com).
[^further]: Author. *Book title*. Publisher, year.
[^note]: An explanatory footnote.
    Continue the same note with four spaces of indentation.
```

The generated order is **article body → References and further reading → Footnotes → Continue reading**. Empty sections are omitted. Both headings match other article section headings. Do not manually add either heading when using these definitions.

References are numbered in definition order and all are displayed, including uncited further reading. Cited references use bracketed superscripts, such as [1]. Footnotes have separate numbering in order of first citation. Uncited ordinary footnotes are omitted.

Repeated `[^further]:` definitions are allowed: each becomes a separate entry. Bare `[^further]` cannot be cited inline because it could refer to multiple entries. Use `[^further-book]` and a matching definition instead. Every other definition name must be unique. Repeated inline citations reuse the same entry and provide a return link for each occurrence.

Entries appear as **number → return link(s), if cited → text**. Uncited entries have no return links. Markdown links, emphasis, and math work inside definitions. Definitions belong on separate lines outside code and callout/comparison blocks. Start subsequent article headings unindented, separated by a blank line; indented headings inside definitions are rejected. Nested citations inside definitions are unsupported. Literal syntax inside code remains literal.

### Further reading as an ordinary list

You can alternatively write a normal section without definitions:

```markdown
## References and further reading

- Author. Year. [Source title](https://example.com).
- Author. *Book title*. Publisher, year.
```

Choose either this manual list or automatic source/further definitions to avoid duplicate headings. Direct links in prose are also supported. Replace example addresses with your actual sources.

Regenerate the HTML after editing Markdown. Check that references precede footnotes and that citation/return links work. Do not edit generated HTML directly.

## Search within a section

Writings, Lab, and Guides provide a search field on the right of the listing controls; it moves below the Writings filters on narrow screens. Search matches all entered words against each listing's visible title, topic, and description, ignoring case and accents. It searches listings, not the full text inside article, guide, or lab pages. Writings search combines with All / Technical / Essays.

Search and category are stored in URL parameters (`q` and `filter`) and restored on refresh or return navigation. Clear removes the search while retaining the category. Without JavaScript, all entries remain available. New published articles are searchable automatically through their generated listing rows.
