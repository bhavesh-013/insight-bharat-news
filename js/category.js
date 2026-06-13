/**
 * Category Controller - Insight Samachar
 * Binds active navigation states, updates category summaries, and handles pagination.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Decode current category route
  const urlParams = new URLSearchParams(window.location.search);
  const rawCat = urlParams.get('cat') || 'technology';
  const category = rawCat.toLowerCase();

  // Highlight active nav item
  highlightNavigation(category);

  // Update page header info
  updateCategoryHeader(category);

  // Setup Pagination state
  const state = {
    category: category,
    page: 1,
    pageSize: 6,
    articles: []
  };

  // Fetch and Load Page Data
  loadCategoryFeed(state);

  // Pagination Button bindings
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        renderPaginatedGrid(state);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxPages = Math.ceil(state.articles.length / state.pageSize);
      if (state.page < maxPages) {
        state.page++;
        renderPaginatedGrid(state);
      }
    });
  }
});

/**
 * Match URL category with main navigation elements and apply active highlights
 */
function highlightNavigation(category) {
  const navItems = document.querySelectorAll('#main-nav .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    const dataCat = item.getAttribute('data-category');
    if (dataCat && dataCat.toLowerCase() === category) {
      item.classList.add('active');
    }
  });
}

/**
 * Set Page Titles and Subheadings based on selected category
 */
function updateCategoryHeader(category) {
  const titleEl = document.getElementById('category-page-title');
  const subEl = document.getElementById('category-page-subtitle');
  
  if (!titleEl || !subEl) return;

  const headerDetails = {
    world: {
      title: "World Affairs",
      desc: "Global reporting, diplomatic dispatches, and geopolitical developments from our international bureaus."
    },
    politics: {
      title: "National Politics",
      desc: "Inside the halls of parliament, policy analyses, public debates, and political movements."
    },
    business: {
      title: "Business & Economy",
      desc: "Market indices, financial summaries, enterprise milestones, and micro-economic updates."
    },
    technology: {
      title: "Technology Edge",
      desc: "Tracking silicon innovations, digital regulations, internet rights, and hardware design."
    },
    sports: {
      title: "Sporting Chronicles",
      desc: "Championship reporting, athlete profiles, tournament outcomes, and national match diaries."
    },
    entertainment: {
      title: "Arts & Culture",
      desc: "Independent cinema profiles, global film festivals reviews, theater updates, and editorial columns."
    },
    science: {
      title: "Scientific Inquiry",
      desc: "Space explorations, environmental milestones, astronomical updates, and public breakthroughs."
    },
    health: {
      title: "Health & Well-being",
      desc: "Preventive medicine insights, botanical pharmacological research, and healthcare policies."
    },
    opinion: {
      title: "Opinion & Discourse",
      desc: "In-depth commentary, policy debates, societal reviews, and academic guest letters."
    }
  };

  const info = headerDetails[category] || {
    title: category,
    desc: `Curated headlines and deep coverage tracking today's updates in ${category}.`
  };

  titleEl.textContent = info.title;
  subEl.textContent = info.desc;
  
  // Set meta title dynamically for SEO
  document.title = `${info.title} News | Insight Samachar`;
}

/**
 * Pull articles for the category and load them into the paging state
 */
async function loadCategoryFeed(state) {
  const grid      = document.getElementById('category-articles-grid');
  const skeletons = document.getElementById('category-skeletons');

  if (grid)      grid.innerHTML = '';
  if (skeletons) skeletons.style.display = 'grid';

  const country = localStorage.getItem('insight_samachar_country') || 'in';

  try {
    const list = await apiService.fetchTopHeadlines(state.category, country);
    state.articles = list || [];

    if (skeletons) skeletons.style.display = 'none';
    renderPaginatedGrid(state);

  } catch (err) {
    console.error('[Category] Failed to load feed', err);
    if (skeletons) skeletons.style.display = 'none';

    if (grid) {
      grid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; width: 100%;">
          <span class="state-illustration">📯</span>
          <h3 class="state-title">Connection Error</h3>
          <p class="state-desc">We had trouble loading the ${state.category} edition. Please try refreshing.</p>
          <button class="btn btn-primary" onclick="window.location.reload()" style="margin-top:12px;"><i class="ri-refresh-line"></i> Retry</button>
        </div>
      `;
    }
  }
}

/**
 * Slice active articles and render correct cards grid based on page state
 */
function renderPaginatedGrid(state) {
  const grid = document.getElementById('category-articles-grid');
  if (!grid) return;

  grid.innerHTML = '';
  
  if (state.articles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; width: 100%;">
        <span class="state-illustration">📯</span>
        <h3 class="state-title">No Reports Found</h3>
        <p class="state-desc">There are no reports archived under the "${state.category}" category in this edition.</p>
      </div>
    `;
    updatePaginationControls(state);
    return;
  }

  // Slicing active indices
  const startIdx = (state.page - 1) * state.pageSize;
  const endIdx = startIdx + state.pageSize;
  const pagedArticles = state.articles.slice(startIdx, endIdx);

  pagedArticles.forEach(art => {
    const isBookmarked = isArticleBookmarked(art.id);
    const publishedDate = new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const card = document.createElement('div');
    card.className = 'paper-card';
    card.innerHTML = `
      <div class="image-container" style="margin-bottom: 12px;">
        <img src="${art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'}" alt="${art.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80';this.onerror=null;">
      </div>
      <span class="category-badge">${art.category}</span>
      <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 8px;">
        <a href="article.html?id=${art.id}">${art.title}</a>
      </h3>
      <p class="card-summary">${art.description || 'Detailed reporting from our correspondents.'}</p>
      <div class="card-meta">
        <span>By ${art.author || 'Staff'}</span>
        <span class="read-time"><i class="ri-time-line"></i> ${art.readingTime || '3 min'}</span>
      </div>
      <button class="bookmark-icon-btn ${isBookmarked ? 'active' : ''}" data-id="${art.id}" style="position: absolute; right: 10px; top: 10px; background: rgba(255,255,255,0.85); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center;" aria-label="Bookmark article">
        <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
      </button>
    `;

    card.querySelector('.bookmark-icon-btn').addEventListener('click', (e) => {
      toggleBookmarkState(art, e.currentTarget);
    });

    grid.appendChild(card);
  });

  // Update controls and numbers
  updatePaginationControls(state);

  // Smooth scroll up to category title on page change
  window.scrollTo({
    top: document.getElementById('category-page-title').offsetTop - 120,
    behavior: 'smooth'
  });
}

/**
 * Disable buttons and output page numbers depending on slice indices
 */
function updatePaginationControls(state) {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const numbersEl = document.getElementById('pagination-numbers');
  
  if (!prevBtn || !nextBtn || !numbersEl) return;

  const total = state.articles.length;
  const maxPages = Math.ceil(total / state.pageSize) || 1;

  prevBtn.disabled = state.page === 1;
  nextBtn.disabled = state.page === maxPages;

  numbersEl.innerHTML = '';
  for (let i = 1; i <= maxPages; i++) {
    const span = document.createElement('span');
    span.className = `page-number ${state.page === i ? 'active' : ''}`;
    span.textContent = i;
    
    span.addEventListener('click', () => {
      if (state.page !== i) {
        state.page = i;
        renderPaginatedGrid(state);
      }
    });

    numbersEl.appendChild(span);
  }
}

/* Local helpers matching home.js scope */
function isArticleBookmarked(id) {
  const bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  return bookmarks.some(art => art.id === id);
}

function toggleBookmarkState(art, btnEl) {
  let bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
  const index = bookmarks.findIndex(item => item.id === art.id);
  const icon = btnEl.querySelector('i');

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