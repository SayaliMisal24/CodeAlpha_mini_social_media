// ============================================
// FEED PAGE LOGIC
// ============================================

requireAuth(); // redirect to login if not logged in
renderNavbar();

const postsContainer = document.getElementById('postsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentUser = getUser();

// ----- Escape user text so it can never break our HTML -----
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ----- Format date nicely (e.g. "2 hours ago") -----
function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ----- Build the HTML for a single post -----
// ----- Build the HTML for a single post -----
function renderPostCard(post) {
  const isLiked = post.likes.includes(currentUser.id);
  const isOwnPost = post.userId._id === currentUser.id;
  const fallbackAvatar = 'https://ui-avatars.com/api/?background=a855f7&color=fff&name=' + encodeURIComponent(post.userId.username);
  const profileImg = post.userId.profileImage ? `images/${post.userId.profileImage}` : fallbackAvatar;
  const profileLink = isOwnPost ? 'profile.html' : `view-profile.html?id=${post.userId._id}`;

  const commentsHTML = post.comments.length
  ? post.comments
      .map((c) => {
        const commentAvatar = `https://ui-avatars.com/api/?background=a855f7&color=fff&size=28&name=${encodeURIComponent(c.userId.username)}`;
        return `
        <div class="comment-item">
          <img src="${commentAvatar}" class="comment-avatar" alt="${escapeHTML(c.userId.username)}" />
          <div><strong>${escapeHTML(c.userId.username)}</strong>${escapeHTML(c.comment)}</div>
        </div>
      `;
      })
      .join('')
  : `<p style="color: var(--text-gray); font-size: 13px; padding: 4px 0;">No comments yet — be the first!</p>`;

  return `
    <div class="card post-card" data-post-id="${post._id}">

      <div class="post-header">
  <a href="${profileLink}">
    <img src="${profileImg}" alt="${escapeHTML(post.userId.username)}" onerror="this.src='${fallbackAvatar}'" />
  </a>
  <div class="post-user-info">
    <a href="${profileLink}" class="post-username">${isOwnPost ? 'You' : escapeHTML(post.userId.username)}</a>
    <span class="post-date">${timeAgo(post.createdAt)}</span>
  </div>
  ${isOwnPost ? `
    <div class="post-menu-wrapper" style="margin-left: auto; position: relative;">
      <button class="btn-icon" data-action="toggle-menu" data-id="${post._id}" style="font-size: 20px; padding: 4px 10px;">⋮</button>
      <div class="post-menu-dropdown" data-menu-for="${post._id}" style="display: none;">
        <button data-action="edit-post" data-id="${post._id}" style="color: var(--text-dark);">✏️ Edit Caption</button>
        <button data-action="delete-post" data-id="${post._id}">🗑️ Delete Post</button>
      </div>
    </div>
  ` : ''}
</div>

      ${post.image ? `<img src="images/${post.image}" class="post-image" alt="Post image" loading="lazy" />` : ''}

      ${post.caption ? `<p class="post-caption">${escapeHTML(post.caption)}</p>` : ''}

      <div class="post-actions">
        <button class="btn-icon like-btn ${isLiked ? 'liked' : ''}" data-action="like" data-id="${post._id}">
          <span class="like-heart">${isLiked ? '❤️' : '🤍'}</span> <span class="like-count">${post.likes.length}</span>
        </button>
        <button class="btn-icon" data-action="toggle-comments" data-id="${post._id}">
          💬 <span>${post.comments.length}</span>
        </button>
      </div>

      <div class="comments-section" style="display: none;" data-comments-for="${post._id}">
        <div class="comment-list">${commentsHTML}</div>
        <div class="comment-input-row">
          <input type="text" placeholder="Write a comment..." class="comment-input" data-id="${post._id}" maxlength="300" />
          <button class="btn-icon" data-action="send-comment" data-id="${post._id}" style="color: var(--primary-blue);">Send</button>
        </div>
      </div>

    </div>
  `;
}

// ----- Fetch all posts from backend -----
// ----- Show animated skeleton placeholders while loading -----
function renderSkeletons(count = 3) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="skeleton-circle"></div>
          <div style="flex: 1;">
            <div class="skeleton-line" style="width: 40%;"></div>
            <div class="skeleton-line" style="width: 25%;"></div>
          </div>
        </div>
        <div class="skeleton-line" style="width: 90%;"></div>
        <div class="skeleton-line" style="width: 60%;"></div>
        <div class="skeleton-block"></div>
      </div>
    `;
  }
  return html;
}

// ----- Fetch all posts from backend -----
async function loadPosts() {
  loadingSpinner.style.display = 'none';
  postsContainer.innerHTML = renderSkeletons();

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
  headers: { Authorization: `Bearer ${getToken()}` },
  cache: 'no-store', // always get fresh data, never a cached 304 response
});

    if (!response.ok) throw new Error('Request failed');

    const posts = await response.json();
    cachedPosts = posts;

    if (posts.length === 0) {
      postsContainer.innerHTML = `
  <div class="empty-state">
    <h3>Couldn't load the feed</h3>
    <p>Check your connection and try again.</p>
    <button class="btn btn-primary" style="width: auto; padding: 10px 24px; margin-top: 12px;" onclick="loadPosts()">Retry</button>
  </div>
`;
      return;
    }

    postsContainer.innerHTML = posts.map(renderPostCard).join('');
  } catch (error) {
  console.error('LOAD POSTS ERROR:', error); // shows the real reason in the console
  postsContainer.innerHTML = `
    <div class="empty-state">
      <h3>Couldn't load the feed</h3>
      <p>Check your connection and try again.</p>
    </div>
  `;
  showToast('Failed to load posts — is your backend running?', 'error');
}
}
// ----- Image Lightbox: click any post image to view full-screen -----
postsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('post-image')) {
    openLightbox(e.target.src);
  }
});
// ----- Double-click image to like (Instagram-style) -----
postsContainer.addEventListener('dblclick', (e) => {
  const img = e.target.closest('.post-image');
  if (!img) return;

  const card = img.closest('.post-card');
  const postId = card.dataset.postId;

  // Show a big heart burst animation
  const heartBurst = document.createElement('div');
  heartBurst.className = 'heart-burst';
  heartBurst.textContent = '❤️';
  img.parentElement.style.position = 'relative';
  img.parentElement.appendChild(heartBurst);
  setTimeout(() => heartBurst.remove(), 800);

  toggleLike(postId);
});
function openLightbox(src) {
  let overlay = document.getElementById('lightboxOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.id = 'lightboxOverlay';
    overlay.innerHTML = '<img id="lightboxImg" src="" alt="Full view" />';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.classList.remove('active'));
  }
  document.getElementById('lightboxImg').src = src;
  overlay.classList.add('active');
}

// ----- Attach click events to like/comment buttons (run after every render) -----
function attachPostEventListeners() {
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleLike(btn.dataset.id));
  });

  document.querySelectorAll('.comment-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = document.getElementById(`comments-${btn.dataset.id}`);
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.comment-input').forEach((input) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        addComment(input.dataset.id, input.value.trim());
        input.value = '';
      }
    });
  });
}

// ----- Like/unlike a post -----
async function toggleLike(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error();
    loadPosts(); // reload feed to reflect the new like count
  } catch (error) {
    showToast('Failed to like post', 'error');
  }
}

// ----- Add a comment -----
async function addComment(postId, comment) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error();
    loadPosts();
  } catch (error) {
    showToast('Failed to add comment', 'error');
  }
}
// ----- Delete a post (from feed) -----
async function deletePostFromFeed(postId) {
  if (!confirm('Delete this post? This cannot be undone.')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error();
    showToast('Post deleted', 'success');
    loadPosts();
  } catch (error) {
    showToast('Failed to delete post', 'error');
  }
}
// ----- Edit a post's caption -----
async function editPostCaption(postId, currentCaption) {
  const newCaption = prompt('Edit your caption:', currentCaption || '');
  if (newCaption === null) return; // user clicked cancel
  if (newCaption.trim() === currentCaption) return; // no change

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ caption: newCaption.trim() }),
    });
    if (!response.ok) throw new Error();
    showToast('Caption updated!', 'success');
    loadPosts();
  } catch (error) {
    showToast('Failed to update caption', 'error');
  }
}
// ----- EVENT DELEGATION for like, comment toggle, and send comment -----
postsContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const postId = btn.dataset.id;

  if (action === 'like') {
    toggleLike(postId);
  }

  if (action === 'toggle-comments') {
    const section = postsContainer.querySelector(`[data-comments-for="${postId}"]`);
    if (section) {
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
  }

  if (action === 'toggle-menu') {
  e.stopPropagation();
  const dropdown = postsContainer.querySelector(`[data-menu-for="${postId}"]`);
  // Close all other open menus first
  document.querySelectorAll('.post-menu-dropdown').forEach((d) => {
    if (d !== dropdown) d.style.display = 'none';
  });
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}
if (action === 'edit-post') {
  const card = postsContainer.querySelector(`[data-post-id="${postId}"]`);
  const captionEl = card.querySelector('.post-caption');
  editPostCaption(postId, captionEl ? captionEl.textContent : '');
}
if (action === 'delete-post') {
  deletePostFromFeed(postId);
  
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.post-menu-wrapper')) {
    document.querySelectorAll('.post-menu-dropdown').forEach((d) => (d.style.display = 'none'));
  }
});
});

// Handle "Enter" key inside comment inputs (also via delegation)
postsContainer.addEventListener('keypress', (e) => {
  if (e.key !== 'Enter') return;
  if (!e.target.classList.contains('comment-input')) return;

  const postId = e.target.dataset.id;
  const value = e.target.value.trim();
  if (value === '') return;

  addComment(postId, value);
  e.target.value = '';
});

// ----- Image Lightbox: click any post image to view full-screen -----
postsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('post-image')) {
    openLightbox(e.target.src);
  }
});

function openLightbox(src) {
  let overlay = document.getElementById('lightboxOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.id = 'lightboxOverlay';
    overlay.innerHTML = '<img id="lightboxImg" src="" alt="Full view" />';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.classList.remove('active'));
  }
  document.getElementById('lightboxImg').src = src;
  overlay.classList.add('active');
}
// ----- Load posts when the page opens -----
loadPosts();
// ----- Load "People to Follow" suggestions -----
async function loadSuggestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/suggestions`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const users = await response.json();

    if (!response.ok || users.length === 0) return;

    const suggestionsCard = document.getElementById('suggestionsCard');
    const suggestionsList = document.getElementById('suggestionsList');

    suggestionsList.innerHTML = users
      .map(
        (u) => `
        <div class="suggestion-item">
          <a href="view-profile.html?id=${u._id}">
            <img src="${u.profileImage ? 'images/' + u.profileImage : 'https://ui-avatars.com/api/?background=a855f7&color=fff&name=' + encodeURIComponent(u.username)}" />
          </a>
          <div class="suggestion-info">
            <a href="view-profile.html?id=${u._id}" class="suggestion-name" style="color: var(--text-dark);">${escapeHTML(u.username)}</a>
          </div>
          <button class="follow-mini-btn" data-follow-id="${u._id}">Follow</button>
        </div>
      `
      )
      .join('');

    suggestionsCard.style.display = 'block';

    // Follow button clicks
    suggestionsList.querySelectorAll('.follow-mini-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '...';
        try {
          const res = await fetch(`${API_BASE_URL}/follow/${btn.dataset.followId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (!res.ok) throw new Error();
          btn.textContent = 'Following ✓';
          btn.style.background = 'var(--success)';
        } catch (error) {
          btn.disabled = false;
          btn.textContent = 'Follow';
          showToast('Failed to follow', 'error');
        }
      });
    });
  } catch (error) {
    // Fail silently — suggestions are a nice-to-have, not critical
  }
}

loadSuggestions();