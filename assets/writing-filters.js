// Shared listing search for Writing, Lab, and Guides. No network requests.
(() => {
  const tools = document.querySelector('.section-tools');
  if (!tools) return;
  const group = tools.querySelector('.writing-filters');
  const buttons = group ? [...group.querySelectorAll('[data-filter]')] : [];
  const input = tools.querySelector('input[type="search"]');
  const clear = tools.querySelector('.search-clear');
  const rows = [...document.querySelectorAll(tools.dataset.items)];
  const count = document.querySelector('.writing-count');
  const empty = document.querySelector('.writing-empty');
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const searchable = rows.map(row => normalize(row.textContent));
  let category = 'all';
  function apply() {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    rows.forEach((row, i) => {
      row.hidden = (category !== 'all' && (row.dataset.category || 'technical') !== category) || !terms.every(term => searchable[i].includes(term));
      if (!row.hidden) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? tools.dataset.singular : tools.dataset.plural}`;
    count.hidden = false;
    empty.textContent = terms.length ? 'No matches. Try another search or clear the search.' : 'No pieces in this category yet. Choose All to browse the collection.';
    empty.hidden = visible !== 0;
    clear.hidden = !input.value;
  }
  function save() {
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('filter');
    else url.searchParams.set('filter', category);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    apply();
  }
  buttons.forEach(button => button.addEventListener('click', () => {category = button.dataset.filter;save();}));
  input.addEventListener('input', save);
  clear.addEventListener('click', () => {input.value = '';save();input.focus();});
  const restore = () => {
    const params = new URL(location.href).searchParams;
    category = group && ['technical', 'essay'].includes(params.get('filter')) ? params.get('filter') : 'all';
    input.value = params.get('q') || '';
    apply();
  };
  window.addEventListener('popstate', restore);
  window.addEventListener('pageshow', restore);
  restore();
  if (group) group.hidden = false;
  tools.hidden = false;
})();
