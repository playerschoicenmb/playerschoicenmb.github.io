(() => {
  'use strict';
  const config = window.INVENTORY_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const grid = $('#inventoryGrid');
  const search = $('#inventorySearch');
  const filters = $('#categoryFilters');
  const inStockOnly = $('#inStockOnly');
  const sort = $('#inventorySort');
  const count = $('#resultCount');
  const updated = $('#inventoryUpdated');
  const empty = $('#inventoryEmpty');
  let products = [];
  let activeCategory = 'All';

  if (!grid || !search || !filters || !inStockOnly || !sort || !count) return;

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const categoryIcon = (category) => ({
    'Video Games': '🎮', 'Comics': '📚', 'Consoles': '🕹️', 'Figures': '🦸',
    'Movies': '📀', 'Trading Cards': '🃏', 'Accessories': '🎯'
  })[category] || '★';

  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i], next = text[i + 1];
      if (char === '"' && quoted && next === '"') { field += '"'; i++; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { row.push(field); field = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') i++;
        row.push(field); field = '';
        if (row.some((value) => value !== '')) rows.push(row);
        row = [];
      } else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    if (rows.length < 2) return [];
    const headers = rows.shift().map((header) => header.trim());
    return rows.map((values) => Object.fromEntries(headers.map((header, i) => [header, (values[i] || '').trim()])))
      .filter((item) => item.SKU && item.Title)
      .map((item) => ({ ...item, Price: Number(item.Price) || 0, Quantity: Number(item.Quantity) || 0, Year: Number(item.Year) || 0 }));
  }

  function renderFilters() {
    const categories = ['All', ...new Set(products.map((item) => item.Category).filter(Boolean))];
    if (!categories.includes(activeCategory)) activeCategory = 'All';
    filters.innerHTML = categories.map((category) => `<button type="button" class="filter-btn${category === activeCategory ? ' active' : ''}" data-cat="${escapeHTML(category)}">${category === 'All' ? '★' : categoryIcon(category)} ${escapeHTML(category)}</button>`).join('');
  }

  function rowHTML(item) {
    const stockText = item.Quantity < 1 ? 'OUT OF STOCK' : item.Quantity === 1 ? 'LAST ONE' : `IN STOCK · ${item.Quantity}`;
    const stockClass = item.Quantity < 1 ? 'out' : item.Quantity === 1 ? 'last' : 'in';
    const condition = [item.Item_Status, item.Condition].filter(Boolean).join(' · ') || '—';
    const email = `mailto:Playerschoicenmb@gmail.com?subject=${encodeURIComponent('Inventory question: ' + item.SKU)}&body=${encodeURIComponent('Hi, is this item still available?\n\n' + item.Title + '\nSKU: ' + item.SKU)}`;
    return `<tr class="inventory-row${item.Quantity < 1 ? ' sold' : ''}">
      <td data-label="Item" class="inventory-title-cell"><span class="inventory-icon" aria-hidden="true">${categoryIcon(item.Category)}</span><span><strong>${escapeHTML(item.Title)}</strong>${item.Year ? `<small>${item.Year}</small>` : ''}</span></td>
      <td data-label="Category">${escapeHTML(item.Category)}</td>
      <td data-label="Platform / Series">${escapeHTML(item.Platform_Series)}</td>
      <td data-label="Condition">${escapeHTML(condition)}</td>
      <td data-label="Price" class="inventory-price">$${item.Price.toFixed(2)}</td>
      <td data-label="Stock"><span class="stock-badge ${stockClass}">${stockText}</span></td>
      <td data-label="SKU" class="inventory-sku">${escapeHTML(item.SKU)}</td>
      <td class="inventory-action"><a href="${email}">ASK</a></td>
    </tr>`;
  }

  function render() {
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = products.filter((item) => {
      if (activeCategory !== 'All' && item.Category !== activeCategory) return false;
      if (inStockOnly.checked && item.Quantity <= 0) return false;
      const haystack = Object.values(item).join(' ').toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    const mode = sort.value;
    visible.sort((a, b) => mode === 'price-low' ? a.Price - b.Price : mode === 'price-high' ? b.Price - a.Price : mode === 'newest' ? b.Year - a.Year : mode === 'quantity' ? b.Quantity - a.Quantity : a.Title.localeCompare(b.Title));
    count.textContent = `${visible.length} ITEM${visible.length === 1 ? '' : 'S'} FOUND`;
    grid.innerHTML = visible.map(rowHTML).join('');
    if (empty) empty.hidden = visible.length !== 0;
  }

  async function load() {
    let timeout;
    try {
      if (!config.GOOGLE_SHEET_CSV_URL) throw new Error('Inventory feed is not configured');
      count.textContent = products.length ? count.textContent : 'LOADING...';
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 15000);
      const separator = config.GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?';
      const response = await fetch(config.GOOGLE_SHEET_CSV_URL + separator + '_cache=' + Date.now(), { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const nextProducts = parseCSV(await response.text());
      if (!nextProducts.length) throw new Error('No valid inventory rows were found');
      products = nextProducts;
      renderFilters();
      render();
      if (updated) updated.textContent = 'LIVE GOOGLE SHEET · SYNCED ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      count.textContent = 'INVENTORY COULD NOT LOAD';
      grid.innerHTML = `<tr><td colspan="8" class="inventory-load-error"><h2>CONNECTION LOST</h2><p>${escapeHTML(error.name === 'AbortError' ? 'Request timed out' : error.message)}</p></td></tr>`;
      if (empty) empty.hidden = true;
    } finally { if (timeout) clearTimeout(timeout); }
  }

  filters.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; activeCategory = button.dataset.cat; renderFilters(); render(); });
  search.addEventListener('input', render);
  inStockOnly.addEventListener('change', render);
  sort.addEventListener('change', render);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
  load();
  setInterval(load, Math.max(1, Number(config.AUTO_REFRESH_MINUTES) || 5) * 60000);
})();
