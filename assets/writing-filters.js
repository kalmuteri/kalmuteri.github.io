(() => {
  const group = document.querySelector('.writing-filters');
  if (!group) return;
  const buttons = [...group.querySelectorAll('[data-filter]')];
  const rows = [...document.querySelectorAll('.writing-row')];
  const count = document.querySelector('.writing-count');
  const empty = document.querySelector('.writing-empty');
  function apply(value) {
    const selected = ['all', 'technical', 'essay'].includes(value) ? value : 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
    let visible = 0;
    rows.forEach(row => {
      row.hidden = selected !== 'all' && (row.dataset.category || 'technical') !== selected;
      if (!row.hidden) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? 'piece' : 'pieces'}`;
    count.hidden = false;
    empty.hidden = visible !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const url = new URL(location.href);
    if (button.dataset.filter === 'all') url.searchParams.delete('filter');
    else url.searchParams.set('filter', button.dataset.filter);
    history.replaceState(null, '', url);
    apply(button.dataset.filter);
  }));
  const restore = () => apply(new URL(location.href).searchParams.get('filter'));
  window.addEventListener('popstate', restore);
  window.addEventListener('pageshow', restore);
  restore();
  group.hidden = false;
})();
