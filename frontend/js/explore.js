// ============================================
// EXPLORE PAGE LOGIC
// ============================================

requireAuth();
renderNavbar();

const exploreGrid = document.getElementById('exploreGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const exploreTitle = document.getElementById('exploreTitle');

// Check if we arrived here filtering by a hashtag, e.g. explore.html?tag=travel
const urlParams = new URLSearchParams(window.location.search);
const filterTag = urlParams.get('tag');

if (filterTag) {
  exploreTitle.textContent = `#${filterTag}`;
}

async function loadExplorePosts() {
  loadingSpinner.style.display = 'block';
  exploreGrid.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cache: 'no-store',
    });
    let posts = await response.json();

    // Only show posts that actually have an image
    posts = posts.filter((p) => p.image);

    // If filtering by hashtag, only keep posts whose caption contains it
    if (filterTag) {
      const tagRegex = new RegExp(`#${filterTag}\\b`, 'i');
      posts = posts.filter((p) => tagRegex.test(p.caption || ''));
    }

    loadingSpinner.style.display = 'none';

    if (posts.length === 0) {
      exploreGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div style="font-size: 40px; margin-bottom: 8px;">🔍</div>
          <h3>No posts found</h3>
          <p>${filterTag ? `Nothing tagged #${filterTag} yet` : 'No photo posts yet'}</p>
        </div>
      `;
      return;
    }

    exploreGrid.innerHTML = posts
      .map(
        (post) => `
        <div class="explore-tile" data-caption="${escapeHTMLExplore(post.caption || '')}" data-username="${escapeHTMLExplore(post.userId.username)}">
          <img src="images/${post.image}" alt="Post" loading="lazy" />
          <div class="explore-tile-overlay">
            <span>❤️ ${post.likes.length}</span>
            <span>💬 ${post.comments.length}</span>
          </div>
        </div>
      `
      )
      .join('');

    // Click any tile to open it full-screen with caption
    document.querySelectorAll('.explore-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const img = tile.querySelector('img').src;
        const caption = tile.dataset.caption;
        const username = tile.dataset.username;
        openExploreLightbox(img, caption, username);
      });
    });
  } catch (error) {
    loadingSpinner.style.display = 'none';
    showToast('Failed to load explore feed', 'error');
  }
}

function escapeHTMLExplore(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function openExploreLightbox(src, caption, username) {
  let overlay = document.getElementById('lightboxOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.id = 'lightboxOverlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.classList.remove('active'));
  }
  overlay.innerHTML = `
    <div style="text-align: center;">
      <img src="${src}" alt="Full view" />
      <p style="color: white; margin-top: 12px; font-size: 14px;"><strong>@${username}</strong> ${caption}</p>
    </div>
  `;
  overlay.classList.add('active');
}

loadExplorePosts();