/**
 * Bookmarks Logic - Insight Samachar
 * Handles rendering the saved articles library, removing bookmarks, and managing empty states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load and display all bookmarked items
  renderBookmarksLibrary();
});

/**
 * Read bookmarks list from LocalStorage and build the grid
 */
function renderBookmarksLibrary() {
  const grid = document.getElementById('bookmarks-grid');
  const emptyState = document.getElementById('bookmarks-empty-state');
  const countEl = document.getElementById('saved-count');

  if (!grid || !emptyState) return;

  const bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');

  // Update counts
  if (countEl) {
    countEl.textContent = `${bookmarks.length} ${bookmarks.length === 1 ? 'dispatch' : 'dispatches'} saved`;
  }

  if (bookmarks.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '';

  bookmarks.forEach(art => {
    const publishedDate = new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const card = document.createElement('div');
    card.className = 'paper-card';
    card.style.position = 'relative';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    card.innerHTML = `
      <div class="image-container" style="margin-bottom: 12px;">
        <img src="${art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'}" alt="${art.title}">
      </div>
      <span class="category-badge">${art.category}</span>
      <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 8px;">
        <a href="article.html?id=${art.id}">${art.title}</a>
      </h3>
      <p class="card-summary" style="-webkit-line-clamp: 2;">${art.description || 'Editorial dispatch from the desk of Insight Samachar.'}</p>
      <div class="card-meta">
        <span>By ${art.author || 'Staff'} • ${publishedDate}</span>
        <span class="read-time"><i class="ri-time-line"></i> ${art.readingTime || '4m'}</span>
      </div>
      <button class="bookmark-icon-btn active" data-id="${art.id}" style="position: absolute; right: 10px; top: 10px; background: rgba(255,255,255,0.9); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);" aria-label="Remove bookmark">
        <i class="ri-bookmark-fill" style="color: var(--accent-color);"></i>
      </button>
    `;

    // Click handler to remove bookmark with visual card collapse
    card.querySelector('.bookmark-icon-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      removeBookmarkWithAnimation(art.id, card);
    });

    grid.appendChild(card);
  });
}

/**
 * Play a fade and transform animation before slicing the item from storage to ensure premium user experience
 */
function removeBookmarkWithAnimation(id, cardElement) {
  cardElement.style.opacity = '0';
  cardElement.style.transform = 'scale(0.9) translateY(10px)';

  setTimeout(() => {
    let bookmarks = JSON.parse(localStorage.getItem('insight_samachar_bookmarks') || '[]');
    bookmarks = bookmarks.filter(item => item.id !== id);
    localStorage.setItem('insight_samachar_bookmarks', JSON.stringify(bookmarks));
    
    // Re-render
    renderBookmarksLibrary();
  }, 350);
}