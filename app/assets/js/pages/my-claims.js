/* TripTrail — My Claims page controller. */
(async function () {
  await TT.nav.render('my-claims');

  const rowsEl = document.getElementById('rows');
  const cardsEl = document.getElementById('cards');
  const emptyEl = document.getElementById('empty');
  const qEl = document.getElementById('q');
  const statusEl = document.getElementById('status');

  let all = [];

  function rowHtml(c) {
    return `<tr class="tt-row-enter border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer" data-id="${c.id}">
      <td class="px-6 py-4 font-medium">${c.purpose}</td>
      <td class="px-6 py-4 text-on-surface-variant">${c.place_of_visit}</td>
      <td class="px-6 py-4 text-on-surface-variant">${TT.format.dateRange(c.trip_from, c.trip_to)}</td>
      <td class="px-6 py-4 text-right font-semibold">${TT.format.money(c.grand_total)}</td>
      <td class="px-6 py-4">${TT.statusBadge.html(c.status)}</td>
      <td class="px-6 py-4 text-right">
        <a href="claim-detail.html?id=${encodeURIComponent(c.id)}" class="text-on-surface-variant hover:text-primary" aria-label="View claim ${c.id}">
          <span class="material-symbols-outlined">chevron_right</span>
        </a>
      </td>
    </tr>`;
  }

  function cardHtml(c) {
    return `<a href="claim-detail.html?id=${encodeURIComponent(c.id)}" class="tt-row-enter block p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-semibold">${c.purpose}</p>
          <p class="text-sm text-on-surface-variant">${c.place_of_visit} · ${TT.format.dateRange(c.trip_from, c.trip_to)}</p>
        </div>
        ${TT.statusBadge.html(c.status)}
      </div>
      <p class="mt-2 font-semibold">${TT.format.money(c.grand_total)}</p>
    </a>`;
  }

  function render(list) {
    const show = list.length > 0;
    emptyEl.classList.toggle('hidden', show);
    rowsEl.innerHTML = list.map(rowHtml).join('');
    cardsEl.innerHTML = list.map(cardHtml).join('');
    rowsEl.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        location.href = 'claim-detail.html?id=' + encodeURIComponent(tr.dataset.id);
      });
    });
  }

  function applyFilters() {
    const q = qEl.value.trim().toLowerCase();
    const st = statusEl.value;
    render(all.filter(c =>
      (!st || c.status === st) &&
      (!q || (c.purpose + c.place_of_visit).toLowerCase().includes(q))
    ));
  }

  qEl.addEventListener('input', applyFilters);
  statusEl.addEventListener('change', applyFilters);

  try {
    all = await TT.api.listMyClaims();
    render(all);
  } catch (e) {
    TT.toast.error('Could not load your claims.');
    console.error(e);
  }
})();
