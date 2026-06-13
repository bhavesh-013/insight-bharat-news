/**
 * Search Controller - Insight Samachar
 * Coordinates keyword queries, search lists, empty illustrations, and search history sidebars.
 * Integrates with live NewsAPI (via CORS proxy) with seamless editorial fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const pageInput = document.getElementById('page-search-input');
  const pageBtn   = document.getElementById('page-search-btn');

  // Check URL parameters on load
  const urlParams    = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');

  if (initialQuery) {
    const decQuery = decodeURIComponent(initialQuery);
    if (pageInput) pageInput.value = decQuery;
    triggerSearch(decQuery);
  } else {
    // Show all articles by default
    triggerSearch('');
  }

  // Bind main page search actions
  if (pageBtn && pageInput) {
    pageBtn.addEventListener('click', () => {
      triggerSearch(pageInput.value.trim());
    });

    pageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        triggerSearch(pageInput.value.trim());
      }
    });
  }

  // Live-as-you-type search (debounced 600ms)
  let debounceTimer = null;
  if (pageInput) {
    pageInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = pageInput.value.trim();
      if (val.length >= 3 || val.length === 0) {
        debounceTimer = setTimeout(() => triggerSearch(val), 600);
      }
    });
  }

  // Bind suggestion tags on the search page
  const pageTags = document.querySelectorAll('.suggestion-tag.page-tag');
  pageTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const val = tag.textContent.trim();
      if (pageInput) pageInput.value = val;
      triggerSearch(val);
    });
  });

  // Load sidebar search history
  renderSidebarHistory();
});

/* ─────────────────────────────────────────────────────────────────────────────
   Core search function
───────────────────────────────────────────────────────────────────────────── */
async function triggerSearch(query) {
  const resultsGrid = document.getElementById('results-grid');
  const skeletons   = document.getElementById('search-skeletons');
  const emptyState  = document.getElementById('no-results-state');
  const countEl     = document.getElementById('results-count');
  const headlineEl  = document.getElementById('results-headline');
  const apiBadge    = document.getElementById('api-source-badge');

  // 1. Show loading state
  if (resultsGrid) resultsGrid.innerHTML = '';
  if (emptyState)  emptyState.style.display = 'none';
  if (skeletons)   skeletons.style.display = 'flex';
  if (countEl)     countEl.textContent = 'Searching…';
  if (apiBadge)    apiBadge.style.display = 'none';

  if (headlineEl) {
    headlineEl.textContent = query
      ? `Live Results for "${query}"`
      : 'Latest Headlines';
  }

  try {
    // 2. Fetch from API layer (live or mock)
    const results = await apiService.fetchEverything(query);

    if (skeletons) skeletons.style.display = 'none';

    // Show source badge
    if (apiBadge) {
      const isLive = results.length > 0 && results[0].id && results[0].id.startsWith('live-');
      apiBadge.textContent  = isLive ? '🟢 Live NewsAPI' : '📁 Editorial Archive';
      apiBadge.className    = `api-badge ${isLive ? 'badge-live' : 'badge-mock'}`;
      apiBadge.style.display = 'inline-flex';
    }

    // Save to search history
    if (query) {
      saveQueryToHistory(query);
      renderSidebarHistory();
    }

    // Update URL without reloading page
    const newUrl = query
      ? `${window.location.pathname}?q=${encodeURIComponent(query)}`
      : window.location.pathname;
    window.history.replaceState(null, '', newUrl);

    // 3. Handle zero results
    if (!results || results.length === 0) {
      if (countEl) countEl.textContent = '0 Articles';
      if (emptyState) {
        emptyState.style.display = 'block';
        const emptyDesc = document.getElementById('no-results-desc');
        if (emptyDesc) {
          emptyDesc.textContent = query
            ? `No articles found for "${query}". Try a different keyword like "India", "Climate", "Cricket" or "AI".`
            : `The archive is empty. Check your connection or API key.`;
        }
      }
      return;
    }

    // 4. Render cards
    if (countEl) countEl.textContent = `${results.length} ${results.length === 1 ? 'Article' : 'Articles'}`;

    results.forEach(art => {
      const isBookmarked  = isArticleBookmarked(art.id);
      const publishedDate = art.publishedAt
        ? new Date(art.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';

      const sourceName = art.source && art.source.name ? art.source.name : 'Insight Samachar';
      const thumb      = art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80';

      const card = document.createElement('div');
      card.className = 'paper-card search-result-card';
      card.style.position = 'relative';
      card.innerHTML = `
        <div class="search-card-inner">
          <div class="search-card-thumb">
            <img src="${thumb}" alt="${escapeHtml(art.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80'">
          </div>
          <div class="search-card-body">
            <span class="category-badge">${escapeHtml(art.category || 'general')}</span>
            <h3 class="card-title" style="font-size: 1.1rem; margin: 6px 0;">
              <a href="article.html?id=${art.id}">${highlightQuery(escapeHtml(art.title), query)}</a>
            </h3>
            <p class="card-summary" style="-webkit-line-clamp: 2;">
              ${highlightQuery(escapeHtml(art.description || 'Editorial analysis from Insight Samachar.'), query)}
            </p>
            <div class="card-meta" style="margin-top: 8px;">
              <span><i class="ri-quill-pen-line"></i> ${escapeHtml(art.author || sourceName)}</span>
              <span>•</span>
              <span>${publishedDate}</span>
              <span class="read-time"><i class="ri-time-line"></i> ${art.readingTime || '3 min read'}</span>
            </div>
          </div>
        </div>
        <button class="bookmark-icon-btn ${isBookmarked ? 'active' : ''}" data-id="${art.id}" style="position: absolute; right: 12px; top: 12px;" aria-label="Bookmark article">
          <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
        </button>
      `;

      card.querySelector('.bookmark-icon-btn').addEventListener('click', e => {
        toggleBookmarkState(art, e.currentTarget);
      });

      resultsGrid.appendChild(card);
    });

  } catch (err) {
    console.error('[Search] Unexpected error:', err);
    if (skeletons) skeletons.style.display = 'none';
    if (countEl)   countEl.textContent = 'Error';
    if (resultsGrid) {
      resultsGrid.innerHTML = `
        <div class="error-state" style="margin: 0 auto; width: 100%;">
          <span class="state-illustration">📯</span>
          <h3 class="state-title">Connection Error</h3>
          <p class="state-desc">We had trouble reaching the archive. Check your connection and try again.</p>
          <button class="btn btn-primary" onclick="triggerSearch('')" style="margin-top:12px;">
            <i class="ri-refresh-line"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sidebar search history
───────────────────────────────────────────────────────────────────────────── */
function renderSidebarHistory() {
  const container = document.getElementById('search-history-list');
  const emptyMsg  = document.getElementById('empty-history-msg');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');

  if (history.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  container.innerHTML = '';

  history.forEach(q => {
    const li = document.createElement('li');
    li.style.cssText = 'display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding:6px 0;';

    li.innerHTML = `
      <a href="#" class="history-item-link" style="flex-grow:1; color:var(--text-primary); font-weight:500;">
        <i class="ri-history-line"></i> ${escapeHtml(q)}
      </a>
      <button class="delete-history-btn" aria-label="Delete history item" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">
        <i class="ri-close-fill"></i>
      </button>
    `;

    li.querySelector('.history-item-link').addEventListener('click', e => {
      e.preventDefault();
      const pageInput = document.getElementById('page-search-input');
      if (pageInput) pageInput.value = q;
      triggerSearch(q);
    });

    li.querySelector('.delete-history-btn').addEventListener('click', e => {
      e.stopPropagation();
      removeSearchHistoryItem(q);
    });

    container.appendChild(li);
  });
}

function saveQueryToHistory(query) {
  if (!query) return;
  const history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');
  const updated  = [query, ...history.filter(h => h !== query)].slice(0, 8);
  localStorage.setItem('insight_samachar_search_history', JSON.stringify(updated));
}

function removeSearchHistoryItem(query) {
  let history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');
  history = history.filter(h => h !== query);
  localStorage.setItem('insight_samachar_search_history', JSON.stringify(history));
  renderSidebarHistory();
  if (typeof renderSearchHistory === 'function') renderSearchHistory();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Bookmark helpers (local scope)
───────────────────────────────────────────────────────────────────────────── */
function isArticleBookmarked(id) {
  const bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  return bookmarks.some(art => art.id === id);
}

function toggleBookmarkState(art, btnEl) {
  let bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  const index   = bookmarks.findIndex(item => item.id === art.id);
  const icon    = btnEl.querySelector('i');

  if (index > -1) {
    bookmarks.splice(index, 1);
    btnEl.classList.remove('active');
    if (icon) icon.className = 'ri-bookmark-line';
  } else {
    bookmarks.unshift(art);
    btnEl.classList.add('active');
    if (icon) icon.className = 'ri-bookmark-fill';
  }
  localStorage.setItem('insight_samachar_bookmarks', JSON.stringify(bookmarks));
}

/* ─────────────────────────────────────────────────────────────────────────────
   Utility helpers
───────────────────────────────────────────────────────────────────────────── */

/** Safely escape HTML special chars to prevent XSS */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wrap query keyword occurrences in <mark> for visual highlight */
function highlightQuery(text, query) {
  if (!query || query.length < 2) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}