// Refresh the recommendation from the published Writing index on each page load.
(async () => {
  const body = document.querySelector('.essay-body');
  if (!body) return;
  const indexURL = new URL('/writings/', location.href);
  const currentPath = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  try {
    const response = await fetch(indexURL.href, {cache: 'no-cache'});
    if (!response.ok) return; // Preserve the authored fallback if the index is unavailable.
    const index = new DOMParser().parseFromString(await response.text(), 'text/html');
    const candidates = new Map();
    for (const row of index.querySelectorAll('a.writing-row')) {
      const href = row.getAttribute('href');
      const title = row.querySelector('strong')?.textContent.trim();
      if (!href || !title) continue;
      const url = new URL(href, indexURL);
      const route = url.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
      if (url.origin !== location.origin || !/^\/writings\/[a-z0-9-]+$/.test(route) || route === currentPath) continue;
      candidates.set(route, {href: route + '/', title});
    }
    let section = body.querySelector('.essay-next');
    if (!candidates.size) { if (section) section.hidden = true; return; }
    const key = 'continue-reading:' + currentPath;
    let previous;
    try { previous = sessionStorage.getItem(key); } catch {} // Storage can be disabled.
    let choices = [...candidates.values()];
    if (choices.length > 1) choices = choices.filter(article => article.href !== previous);
    const selected = choices[Math.floor(Math.random() * choices.length)];
    if (!section) {
      section = document.createElement('div');
      section.className = 'essay-next';
      body.append(section);
    }
    const heading = document.createElement('span');
    heading.textContent = 'CONTINUE READING';
    const link = document.createElement('a');
    link.href = selected.href;
    link.textContent = selected.title + ' ↗';
    section.replaceChildren(heading, link);
    section.hidden = false;
    try { sessionStorage.setItem(key, selected.href); } catch {}
  } catch {
    // Offline or malformed responses leave the original link usable.
  }
})();
