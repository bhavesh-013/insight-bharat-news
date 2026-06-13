/**
 * Homepage Logic - Insight Samachar
 * Handles: dynamic layout feeds, tickers, widgets, dark mode, and auth profile state.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme Handling (Day/Night Edition)
  initTheme();

  // Auth Profile State
  checkAuthSession();

  // API Key Interface
  initApiKeyWidget();

  // Country selector
  initCountrySelector();

  // Load News Content
  loadHomeNews();

  // Tickers & Widgets
  initWidgets();

  // Search Overlay Binding
  initSearchOverlay();

  // Newsletter Submit
  initNewsletter();

  // Update header date dynamically
  updateHeaderDate();
});

/* ==========================================================================
   1. Theme Management (Day/Night Edition)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const editionIndicator = document.getElementById('edition-indicator');
  
  // Default is day (cream)
  const savedTheme = localStorage.getItem('insight_samachar_theme') || 'light';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('insight_samachar_theme', theme);
  
  const themeIcon = document.getElementById('theme-icon');
  const editionIndicator = document.getElementById('edition-indicator');
  
  if (theme === 'dark') {
    if (themeIcon) themeIcon.className = 'ri-sun-line';
    if (editionIndicator) {
      editionIndicator.innerHTML = '<i class="ri-moon-fill" style="color: var(--gold-color);"></i> Night Edition';
    }
  } else {
    if (themeIcon) themeIcon.className = 'ri-moon-line';
    if (editionIndicator) {
      editionIndicator.innerHTML = '<i class="ri-sun-fill" style="color: var(--accent-color);"></i> Morning Edition';
    }
  }
}

/* ==========================================================================
   2. Auth Session Management
   ========================================================================== */
function checkAuthSession() {
  const authStatus = document.getElementById('auth-status');
  const sessionData = sessionStorage.getItem('insight_samachar_session') || localStorage.getItem('insight_samachar_session');
  
  if (!authStatus) return;

  if (sessionData) {
    const session = JSON.parse(sessionData);
    if (session.isLoggedIn) {
      authStatus.innerHTML = `
        <span class="user-greeting" style="font-weight: 600; color: var(--text-primary);">
          <i class="ri-user-smile-line"></i> ${session.user.name}
        </span>
        <span>•</span>
        <a href="#" id="signout-btn" style="color: var(--accent-color); font-weight: 600;"><i class="ri-logout-box-r-line"></i> Log Out</a>
      `;

      // Update mobile profile menu item
      const mobileProfileLink = document.querySelector('#mobile-profile-item a');
      if (mobileProfileLink) {
        mobileProfileLink.innerHTML = '<i class="ri-user-smile-line"></i><span>Profile</span>';
        mobileProfileLink.href = '#';
      }

      // Bind Sign Out
      document.getElementById('signout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('insight_samachar_session');
        localStorage.removeItem('insight_samachar_session');
        window.location.reload();
      });
    }
  }
}

/* ==========================================================================
   3. API Key settings UI
   ========================================================================== */
function initApiKeyWidget() {
  const keyInput = document.getElementById('api-key-input');
  const saveBtn  = document.getElementById('save-key-btn');
  const statusEl = document.getElementById('api-key-status');

  // Pre-fill with active key (hardcoded or localStorage)
  if (keyInput) {
    keyInput.value = apiService.apiKey || '';
  }

  // Show current key status on load
  if (statusEl) {
    if (apiService.isUsingRealAPI()) {
      statusEl.textContent = '✅ Live API key active — real news enabled.';
      statusEl.style.color = '#16a34a';
      statusEl.style.display = 'block';
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const keyVal = keyInput ? keyInput.value.trim() : '';
      apiService.setApiKey(keyVal || null);

      if (statusEl) {
        if (keyVal) {
          statusEl.textContent = '✅ Key applied! Reloading…';
          statusEl.style.color = '#16a34a';
        } else {
          statusEl.textContent = '⚠️ Using built-in key. Reloading…';
          statusEl.style.color = 'var(--accent-color)';
        }
        statusEl.style.display = 'block';
        setTimeout(() => {
          statusEl.style.display = 'none';
          window.location.reload();
        }, 1500);
      }
    });
  }
}

/* ==========================================================================
   3b. Country Selector
   ========================================================================== */
function initCountrySelector() {
  const selector = document.getElementById('country-selector');
  if (!selector) return;

  // Restore saved preference
  const saved = localStorage.getItem('insight_samachar_country') || 'in';
  selector.value = saved;

  selector.addEventListener('change', () => {
    localStorage.setItem('insight_samachar_country', selector.value);
    // Clear cache so fresh articles load for new country
    apiService.cache = {};
    loadHomeNews();
  });
}

/* ==========================================================================
   3c. Dynamic header date
   ========================================================================== */
function updateHeaderDate() {
  const dateEl = document.getElementById('header-date');
  const volEl  = document.getElementById('volume-indicator');
  if (!dateEl) return;

  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (volEl) {
    const start  = new Date(now.getFullYear(), 0, 1);
    const dayNum = Math.floor((now - start) / 86400000) + 1;
    volEl.textContent = `Vol. ${now.getFullYear() - 2022}, No. ${dayNum}`;
  }
}

/* ==========================================================================
   4. News Content Loading & Rendering
   ========================================================================== */
async function loadHomeNews() {
  const heroContainer        = document.getElementById('hero-container');
  const heroPlaceholder      = document.getElementById('hero-placeholder');
  const editorPicksContainer = document.getElementById('editor-picks-container');
  const leftColContainer     = document.getElementById('left-column-container');
  const centerColContainer   = document.getElementById('center-column-container');
  const tickerTrack          = document.getElementById('ticker-track');

  if (heroPlaceholder) heroPlaceholder.style.display = 'block';

  const country = localStorage.getItem('insight_samachar_country') || 'in';

  try {
    // Fetch all headlines (live API with CORS proxy, or editorial fallback)
    const articles = await apiService.fetchTopHeadlines('', country);
    if (heroPlaceholder) heroPlaceholder.style.display = 'none';

    if (!articles || articles.length === 0) {
      renderErrorState();
      return;
    }

    // Show live/mock source badge on home page
    showSourceBadge(articles);

    // 1. Hero Article
    renderHero(articles[0], heroContainer);

    // 2. Editor's Picks (next 4)
    renderPicks(articles.slice(1, 5), editorPicksContainer);

    // 3. Left Column (next 3)
    renderLeftColumn(articles.slice(5, 8), leftColContainer);

    // 4. Center Column (next 4)
    renderCenterColumn(articles.slice(8, 12), centerColContainer);

    // 5. Ticker
    renderTicker(articles.slice(0, 8), tickerTrack);

  } catch (err) {
    console.error('[Home] Fatal error loading news', err);
    if (heroPlaceholder) heroPlaceholder.style.display = 'none';
    renderErrorState();
  }
}

function showSourceBadge(articles) {
  const badge = document.getElementById('home-api-badge');
  if (!badge) return;
  const isLive = articles.length > 0 && articles[0].id && articles[0].id.startsWith('live-');
  badge.textContent  = isLive ? '🟢 Live NewsAPI' : '📁 Editorial Archive';
  badge.style.cssText = `display:inline-flex;align-items:center;gap:5px;font-size:0.68rem;
    font-family:var(--font-sans);font-weight:600;padding:2px 10px;border-radius:20px;
    letter-spacing:0.05em;text-transform:uppercase;${
    isLive
      ? 'background:rgba(34,197,94,0.12);color:#16a34a;border:1px solid rgba(34,197,94,0.3);'
      : 'background:rgba(100,116,139,0.1);color:var(--text-muted);border:1px solid var(--border-color);'
    }`;
  badge.style.display = 'inline-flex';
}

function renderHero(art, container) {
  if (!art || !container) return;
  const publishedDate = new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isBookmarked = isArticleBookmarked(art.id);
  
  container.innerHTML = `
    <div class="image-container hero-image-container">
      <img src="${art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80'}" alt="${art.title}">
    </div>
    <div class="hero-content">
      <span class="category-badge">${art.category}</span>
      <h2 class="hero-title"><a href="article.html?id=${art.id}">${art.title}</a></h2>
      <p class="hero-summary">${art.description || 'Editorial dispatch from Insight Samachar covering key policies, events, and strategic updates in global affairs.'}</p>
      
      <div style="font-family: var(--font-sans); font-size: 0.75rem; color: var(--text-muted); margin-bottom: 20px;">
        By <strong style="color: var(--text-primary);">${art.author || 'Staff Reporter'}</strong> 
        <span>•</span> ${publishedDate}
        <span>•</span> <i class="ri-time-line"></i> ${art.readingTime || '4 min read'}
      </div>
      
      <div class="hero-actions">
        <a href="article.html?id=${art.id}" class="btn btn-primary">Read Full Story</a>
        <button class="bookmark-icon-btn ${isBookmarked ? 'active' : ''}" data-id="${art.id}" aria-label="Bookmark article">
          <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
        </button>
      </div>
    </div>
  `;

  // Bind Bookmark click
  container.querySelector('.bookmark-icon-btn').addEventListener('click', (e) => {
    toggleBookmarkState(art, e.currentTarget);
  });
}

function renderPicks(articles, container) {
  if (!container) return;
  container.innerHTML = '';

  if (articles.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No recommendations available today.</p>`;
    return;
  }

  articles.forEach(art => {
    const isBookmarked = isArticleBookmarked(art.id);
    const card = document.createElement('div');
    card.className = 'paper-card';
    card.innerHTML = `
      <div class="image-container" style="margin-bottom: 12px;">
        <img src="${art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'}" alt="${art.title}">
      </div>
      <span class="category-badge">${art.category}</span>
      <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 8px;">
        <a href="article.html?id=${art.id}">${art.title}</a>
      </h3>
      <div class="card-meta">
        <span>By ${art.author || 'Staff'}</span>
        <span class="read-time"><i class="ri-time-line"></i> ${art.readingTime || '3m'}</span>
      </div>
      <button class="bookmark-icon-btn ${isBookmarked ? 'active' : ''}" data-id="${art.id}" style="position: absolute; right: 10px; top: 10px; background: rgba(255,255,255,0.8); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" aria-label="Bookmark article">
        <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
      </button>
    `;
    
    card.querySelector('.bookmark-icon-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmarkState(art, e.currentTarget);
    });

    container.appendChild(card);
  });
}

function renderLeftColumn(articles, container) {
  if (!container) return;
  container.innerHTML = '';

  articles.forEach(art => {
    const isBookmarked = isArticleBookmarked(art.id);
    const item = document.createElement('div');
    item.className = 'paper-card';
    item.style.paddingBottom = '15px';
    item.innerHTML = `
      <span class="category-badge">${art.category}</span>
      <h3 class="card-title"><a href="article.html?id=${art.id}">${art.title}</a></h3>
      <p class="card-summary">${art.description || 'Editorial analysis and reporting from the desk of Insight Samachar'}</p>
      <div class="card-meta">
        <span>By ${art.author || 'Editorial Board'}</span>
        <span>${art.readingTime || '4 min'}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderCenterColumn(articles, container) {
  if (!container) return;
  container.innerHTML = '';

  articles.forEach((art, idx) => {
    const item = document.createElement('div');
    item.style.paddingBottom = '16px';
    if (idx < articles.length - 1) {
      item.style.borderBottom = '1px dashed var(--border-color)';
    }
    
    item.innerHTML = `
      <span class="category-badge" style="font-size:0.65rem; margin-bottom: 4px;">${art.category}</span>
      <h3 class="card-title" style="font-size: 1.1rem; line-height:1.2; margin-bottom: 6px;">
        <a href="article.html?id=${art.id}">${art.title}</a>
      </h3>
      <p style="font-size:0.85rem; color: var(--text-secondary); line-height: 1.4;">
        ${art.description ? art.description.substring(0, 100) + '...' : 'In-depth coverage and headlines breaking down today\'s main topics.'}
      </p>
      <div style="font-family: var(--font-sans); font-size: 0.7rem; color: var(--text-muted); margin-top: 6px;">
        By ${art.author || 'Press Dispatch'} • ${art.readingTime}
      </div>
    `;
    container.appendChild(item);
  });
}

function renderTicker(articles, container) {
  if (!container) return;
  container.innerHTML = '';

  // Duplicate items to ensure infinite marquee width
  const scrollList = [...articles, ...articles];
  scrollList.forEach(art => {
    const span = document.createElement('span');
    span.className = 'ticker-item';
    span.style.cssText = 'color:#e5e5e5; font-family:var(--font-sans); font-size:0.78rem; font-weight:500; letter-spacing:0.01em; white-space:nowrap; padding:0 6px;';
    span.innerHTML = `<a href="article.html?id=${art.id}" style="color:#e5e5e5; text-decoration:none;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#e5e5e5'">${art.title}</a><span style="color:#8b0000; margin-left:18px; font-size:0.55rem; vertical-align:middle;">&#9670;</span>`;
    container.appendChild(span);
  });
}

function renderErrorState() {
  const container = document.getElementById('hero-container');
  if (container) {
    container.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1; width: 100%; margin: 20px auto;">
        <span class="state-illustration">📯</span>
        <h3 class="state-title">Today's Edition Could Not Be Loaded</h3>
        <p class="state-desc">We had trouble retrieving the headlines. Check your internet connection or try refreshing.</p>
        <button onclick="window.location.reload();" class="btn btn-primary">Retry Loading</button>
      </div>
    `;
  }
}

/* ==========================================================================
   5. Tickers & Widgets Logic
   ========================================================================== */
function initWidgets() {
  // Update Widget Dates
  const weatherDate = document.getElementById('weather-date');
  if (weatherDate) {
    const today = new Date();
    weatherDate.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Market Ticker Initial Values
  const markets = [
    { name: 'S&P 500', value: 5432.75, change: 0.12, status: 'up' },
    { name: 'NASDAQ', value: 16920.30, change: -0.45, status: 'down' },
    { name: 'Gold (Oz)', value: 2315.40, change: 0.85, status: 'up' },
    { name: 'Brent Crude', value: 82.15, change: -1.25, status: 'down' },
    { name: 'USD/INR', value: 83.52, change: 0.05, status: 'up' }
  ];

  renderMarkets(markets);
  
  // Ticking Animation loop (simulate real micro-movements)
  setInterval(() => {
    markets.forEach(m => {
      const isUp = Math.random() > 0.45;
      const factor = isUp ? 1 : -1;
      const pct = (Math.random() * 0.08) * factor;
      
      m.value = parseFloat((m.value * (1 + pct / 100)).toFixed(2));
      m.change = parseFloat((m.change + pct).toFixed(2));
      m.status = m.change >= 0 ? 'up' : 'down';
    });
    renderMarkets(markets);
  }, 4000);

  // Dynamic Weather Generation based on local current hour
  const currentHour = new Date().getHours();
  const weatherTemp = document.getElementById('weather-temp');
  const weatherCondition = document.getElementById('weather-condition');
  const weatherIcon = document.getElementById('weather-icon');
  
  if (currentHour > 18 || currentHour < 6) {
    // Night
    if (weatherTemp) weatherTemp.textContent = '26°C';
    if (weatherCondition) weatherCondition.textContent = 'Clear Sky';
    if (weatherIcon) weatherIcon.innerHTML = '<i class="ri-moon-clear-line" style="color: var(--gold-color);"></i>';
  } else {
    // Day
    if (weatherTemp) weatherTemp.textContent = '33°C';
    if (weatherCondition) weatherCondition.textContent = 'Sunny and Hot';
    if (weatherIcon) weatherIcon.innerHTML = '<i class="ri-sun-line" style="color: var(--gold-color);"></i>';
  }
}

function renderMarkets(markets) {
  const container = document.getElementById('market-container');
  if (!container) return;

  container.innerHTML = '';
  markets.forEach(m => {
    const sign = m.change >= 0 ? '+' : '';
    const classTag = m.status === 'up' ? 'market-up' : 'market-down';
    const iconTag = m.status === 'up' ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill';

    const item = document.createElement('div');
    item.className = 'market-item';
    item.innerHTML = `
      <span class="market-name">${m.name}</span>
      <div class="market-values">
        <span class="market-val">${m.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        <span class="market-change ${classTag}">
          <i class="${iconTag}"></i> ${sign}${m.change}%
        </span>
      </div>
    `;
    container.appendChild(item);
  });
}

/* ==========================================================================
   6. Search Overlay controls
   ========================================================================== */
function initSearchOverlay() {
  const triggers = [
    document.getElementById('search-trigger'),
    document.getElementById('mobile-search-trigger')
  ];
  const closeBtn = document.getElementById('search-close-btn');
  const overlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const submitBtn = document.getElementById('search-submit-btn');

  if (!overlay) return;

  // Show
  triggers.forEach(tr => {
    if (tr) {
      tr.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
        searchInput.focus();
        renderSearchHistory();
      });
    }
  });

  // Hide
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }

  // Key Event or Submit Redirect
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSearch(searchInput.value.trim());
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      executeSearch(searchInput.value.trim());
    });
  }

  // Bind suggested tags inside overlay
  const tags = document.querySelectorAll('.suggestion-tag');
  tags.forEach(t => {
    t.addEventListener('click', () => {
      executeSearch(t.textContent);
    });
  });
}

function executeSearch(query) {
  if (!query) return;

  // Save query to search history
  const history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 5) history.pop();
    localStorage.setItem('insight_samachar_search_history', JSON.stringify(history));
  }

  window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

function renderSearchHistory() {
  const box = document.getElementById('search-history-box');
  const container = document.getElementById('recent-searches-container');
  if (!box || !container) return;

  const history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');
  if (history.length === 0) {
    box.style.display = 'none';
    return;
  }

  box.style.display = 'block';
  container.innerHTML = '';
  
  history.forEach(q => {
    const tag = document.createElement('span');
    tag.className = 'suggestion-tag';
    tag.innerHTML = `${q} <i class="ri-close-line" style="margin-left: 4px; pointer-events: auto;"></i>`;
    
    // Clicking on tag triggers search
    tag.addEventListener('click', (e) => {
      if (e.target.classList.contains('ri-close-line')) {
        e.stopPropagation();
        removeHistoryItem(q);
      } else {
        executeSearch(q);
      }
    });
    container.appendChild(tag);
  });
}

function removeHistoryItem(query) {
  let history = JSON.parse(localStorage.getItem('insight_samachar_search_history') || '[]');
  history = history.filter(h => h !== query);
  localStorage.setItem('insight_samachar_search_history', JSON.stringify(history));
  renderSearchHistory();
}

/* ==========================================================================
   7. Newsletter Subscription Logic
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const successMsg = document.getElementById('newsletter-success');

  if (form && successMsg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Play brief submit animation
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.innerHTML = '<i class="ri-loader-4-line" style="animation: spin 1s infinite linear; display: inline-block;"></i> Processing';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        
        emailInput.value = '';
        form.style.display = 'none';
        successMsg.style.display = 'block';

        // Add standard keyframe spin styles locally if needed
        if (!document.getElementById('spin-keyframes')) {
          const style = document.createElement('style');
          style.id = 'spin-keyframes';
          style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
      }, 1200);
    });
  }
}

/* ==========================================================================
   8. Bookmark Controller Helpers
   ========================================================================== */
function isArticleBookmarked(id) {
  const bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  return bookmarks.some(art => art.id === id);
}

function toggleBookmarkState(art, btnEl) {
  let bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  const index = bookmarks.findIndex(item => item.id === art.id);

  const icon = btnEl.querySelector('i');

  if (index > -1) {
    // Remove
    bookmarks.splice(index, 1);
    btnEl.classList.remove('active');
    if (icon) icon.className = 'ri-bookmark-line';
  } else {
    // Add
    bookmarks.unshift(art);
    btnEl.classList.add('active');
    if (icon) icon.className = 'ri-bookmark-fill';
  }

  localStorage.setItem('insight_samachar_bookmarks', JSON.stringify(bookmarks));
}