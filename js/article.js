/**
 * Article Reader Logic - Insight Samachar
 * Coordinates: content loading, progress tracking, bookmarks, social shares, print, and local comments.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Parse article query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id') || 'editorial-world-1';

  // Load article content
  loadArticleReader(articleId);

  // Setup scroll event for reading progress bar
  window.addEventListener('scroll', updateReadingProgress);

  // Share buttons bindings
  setupShareControls();

  // Comments submit binding
  setupComments(articleId);
});

/**
 * Fetch targets details and bind markup nodes
 */
async function loadArticleReader(id) {
  try {
    const art = await apiService.fetchArticleById(id);
    if (!art) {
      renderReaderError();
      return;
    }

    // Populate SEO tags
    document.title = `${art.title} | Insight Samachar`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && art.description) {
      metaDesc.setAttribute('content', art.description);
    }

    // 1. Text elements
    document.getElementById('art-category').textContent = art.category;
    document.getElementById('art-title').textContent = art.title;
    document.getElementById('art-summary').textContent = art.description || 'Editorial analysis from the Insight Samachar desk.';
    document.getElementById('art-author').textContent = art.author || 'Staff Writer';
    document.getElementById('art-source').textContent = art.source?.name || 'Insight Samachar';
    
    const publishedDate = new Date(art.publishedAt).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById('art-date').textContent = publishedDate;
    document.getElementById('art-read-time').innerHTML = `<i class="ri-time-line"></i> ${art.readingTime || '5 min read'}`;

    // 2. Image
    const imgEl = document.getElementById('art-image');
    if (imgEl) {
      const fallbackImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';
      imgEl.src = art.urlToImage || fallbackImg;
      imgEl.alt = art.title;
      imgEl.onerror = function() { this.src = fallbackImg; this.onerror = null; };
    }

    // 3. Main content body paragraphs
    renderBodyParagraphs(art);

    // 5. Bookmark active state
    const bookmarkBtn = document.getElementById('art-bookmark-btn');
    if (bookmarkBtn) {
      const isSaved = isArticleBookmarked(art.id);
      if (isSaved) bookmarkBtn.classList.add('active');

      bookmarkBtn.addEventListener('click', () => {
        toggleBookmarkState(art, bookmarkBtn);
      });
    }

    // 6. Source label + live badge
    const sourceEl = document.getElementById('art-source');
    if (sourceEl) {
      const isLive  = art.id && art.id.startsWith('live-');
      const srcName = art.source?.name || 'Insight Samachar';
      sourceEl.innerHTML = isLive
        ? `${srcName} &nbsp;<span style="font-size:0.65rem;background:rgba(34,197,94,0.15);color:#16a34a;border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:1px 8px;font-family:var(--font-sans);font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">LIVE</span>`
        : srcName;
    }

    // 7. Original article external link
    const originalLink = document.getElementById('art-original-link');
    if (originalLink) {
      if (art.url && art.url !== '#') {
        originalLink.href   = art.url;
        originalLink.target = '_blank';
        originalLink.rel    = 'noopener noreferrer';
        originalLink.textContent = 'Read Original Article →';
      } else {
        if (originalLink.parentElement) originalLink.parentElement.style.display = 'none';
      }
    }

    // 8. Related articles
    loadRelatedArticles(art.category, art.id);

  } catch (err) {
    console.error('[Article] Error setting up article details', err);
    renderReaderError();
  }
}


/**
 * Split body content text and apply vintage dropcap styling to first letter of first paragraph
 */
function renderBodyParagraphs(art) {
  const container = document.getElementById('art-text-paragraphs');
  if (!container) return;

  container.innerHTML = '';
  
  let paragraphs = [];
  
  // If we have full mock text content
  if (art.content && !art.content.includes('[+')) {
    paragraphs = art.content.split('\n\n').filter(p => p.trim() !== '');
  } else {
    // Generate beautiful placeholder paragraphs for live NewsAPI articles which are truncated
    const mainDesc = art.description || 'Global systems are experiencing critical shifts as modern sectors scale.';
    const snippet = art.content ? art.content.split('[+')[0] : 'Detailed reporting regarding this news updates is unfolding.';
    
    paragraphs = [
      snippet,
      mainDesc,
      "Correspondents reports indicate that this issue has sparked intense conversation among policy advisors and industry leaders. Analysts suggest that the initial policy shifts could influence near-term strategic priorities, creating ripples across global corridors.",
      "As debates continue in committees, market indexes have shown minor fluctuations, reflecting public reactions. Additional updates will be printed in our next morning bulletin as official statements are delivered by the press departments."
    ];
  }

  // Render paragraphs
  paragraphs.forEach((text, idx) => {
    const p = document.createElement('p');
    if (idx === 0) {
      p.className = 'dropcap';
    }
    p.textContent = text;
    container.appendChild(p);
  });

  // Inject a mock editorial pullquote halfway through
  if (paragraphs.length >= 3) {
    const quote = document.createElement('blockquote');
    quote.className = 'editorial-pullquote';
    quote.textContent = `"${art.title.length > 60 ? art.title.substring(0, 60) + '...' : art.title}"`;
    container.insertBefore(quote, container.children[2]);
  }
}

/**
 * Handle Reading Progress bar width mapping on scroll
 */
function updateReadingProgress() {
  const progressEl = document.getElementById('reading-progress');
  if (!progressEl) return;

  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight === 0) return;

  const scrollPercent = (window.scrollY / totalHeight) * 100;
  progressEl.style.width = `${scrollPercent}%`;
}

/**
 * Social Sharing API hooks
 */
function setupShareControls() {
  const shareButtons = document.querySelectorAll('.share-icon-btn[data-share]');
  const copyBtn = document.getElementById('art-copy-link-btn');
  const printBtn = document.getElementById('art-print-btn');

  shareButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const network = btn.getAttribute('data-share');
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      
      let shareUrl = '';
      switch (network) {
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const icon = copyBtn.querySelector('i');
        icon.className = 'ri-checkbox-circle-line';
        copyBtn.style.color = 'var(--accent-color)';
        
        setTimeout(() => {
          icon.className = 'ri-link';
          copyBtn.style.color = '';
        }, 1500);
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Local Comments Management
 */
function setupComments(articleId) {
  const form = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');
  const countEl = document.getElementById('comments-count');
  const listEl = document.getElementById('comments-list');
  const noticeEl = document.getElementById('comment-auth-notice');

  // Check auth session for comments attribution
  const sessionData = sessionStorage.getItem('insight_samachar_session') || localStorage.getItem('insight_samachar_session');
  let currentUser = { name: "Guest Reader", initials: "GR" };
  
  if (sessionData) {
    const session = JSON.parse(sessionData);
    if (session.isLoggedIn) {
      currentUser.name = session.user.name;
      currentUser.initials = session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      if (noticeEl) noticeEl.textContent = `Posting as subscriber: ${currentUser.name}`;
    }
  }

  renderCommentsList(articleId);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const txtVal = commentText.value.trim();
      if (!txtVal) return;

      const commentsKey = `insight_samachar_comments_${articleId}`;
      const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
      
      const newComment = {
        author: currentUser.name,
        initials: currentUser.initials,
        date: new Date().toISOString(),
        content: txtVal
      };

      comments.unshift(newComment);
      localStorage.setItem(commentsKey, JSON.stringify(comments));

      commentText.value = '';
      renderCommentsList(articleId);
    });
  }
}

function renderCommentsList(articleId) {
  const listEl = document.getElementById('comments-list');
  const countEl = document.getElementById('comments-count');
  if (!listEl) return;

  const commentsKey = `insight_samachar_comments_${articleId}`;
  const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');

  if (countEl) {
    countEl.textContent = `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`;
  }

  listEl.innerHTML = '';

  if (comments.length === 0) {
    listEl.innerHTML = `<p style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 20px 0;">No responses yet. Be the first to express your opinion.</p>`;
    return;
  }

  comments.forEach(c => {
    const formattedDate = new Date(c.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <span class="comment-avatar">${c.initials || 'GR'}</span>
          <span>${c.author}</span>
        </div>
        <span class="comment-date">${formattedDate}</span>
      </div>
      <div class="comment-text">${escapeHtml(c.content)}</div>
    `;
    listEl.appendChild(card);
  });
}

/**
 * Fetch and load related articles sidebar
 */
async function loadRelatedArticles(category, currentId) {
  const container = document.getElementById('related-articles-container');
  if (!container) return;

  container.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted);">Loading related...</p>';

  try {
    const list = await apiService.fetchTopHeadlines(category);
    // Filter out current article
    const filtered = (list || []).filter(art => art.id !== currentId).slice(0, 3);

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted);">No related articles in this category today.</p>';
      return;
    }

    filtered.forEach(art => {
      const card = document.createElement('div');
      card.className = 'related-article-card';
      card.innerHTML = `
        <span class="category-badge" style="font-size:0.6rem; margin-bottom: 2px;">${art.category}</span>
        <h5 class="related-title">
          <a href="article.html?id=${art.id}">${art.title}</a>
        </h5>
        <div style="font-family: var(--font-sans); font-size: 0.7rem; color: var(--text-muted);">
          By ${art.author || 'Staff'} • ${art.readingTime}
        </div>
      `;
      container.appendChild(card);
    });

  } catch (e) {
    console.warn("Could not load related articles", e);
    container.innerHTML = '';
  }
}

function renderReaderError() {
  const container = document.querySelector('main');
  if (container) {
    container.innerHTML = `
      <div class="error-state" style="margin: 40px auto; width: 100%;">
        <span class="state-illustration">📯</span>
        <h3 class="state-title">Article Not Found</h3>
        <p class="state-desc">The requested publication could not be retrieved from the archives.</p>
        <a href="index.html" class="btn btn-primary">Return to Homepage</a>
      </div>
    `;
  }
}

/* Helpers */
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

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